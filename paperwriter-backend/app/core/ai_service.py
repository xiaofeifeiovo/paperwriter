"""AI 服务核心 - 集成通义千问"""
import asyncio
import json
from typing import AsyncGenerator, List, Dict, Any
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
import dashscope
from dashscope import Generation
from app.config import settings
from app.models.ai import Diagnostic
from app.utils.ai_utils import build_prompt, parse_ai_response


class AIService:
    """AI 服务核心类 - 复用 PaperReader2 经验"""

    def __init__(self):
        self.api_key = settings.DASHSCOPE_API_KEY
        self.model = settings.DASHSCOPE_MODEL
        if self.api_key:
            dashscope.api_key = self.api_key

    @retry(
        stop=stop_after_attempt(settings.AI_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ConnectionError, TimeoutError))
    )
    async def _call_with_retry(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False
    ) -> str | AsyncGenerator[str, None]:
        """
        带重试的 AI 调用

        Args:
            messages: 消息列表
            stream: 是否流式输出

        Returns:
            str: AI 响应（非流式）
            AsyncGenerator: 流式响应生成器
        """
        if not self.api_key:
            raise ValueError("DASHSCOPE_API_KEY 未配置")

        try:
            response = Generation.call(
                model=self.model,
                messages=messages,
                stream=stream,
                result_format='message'
            )

            if stream:
                return self._stream_response(response)
            else:
                if response.status_code == 200:
                    return response.output.choices[0].message.content
                else:
                    raise Exception(f"API 调用失败: {response.message}")
        except Exception as e:
            raise

    async def _stream_response(self, response) -> AsyncGenerator[str, None]:
        """处理流式响应"""
        for chunk in response:
            if chunk.status_code == 200:
                yield chunk.output.choices[0].message.content
            else:
                raise Exception(f"流式响应错误: {chunk.message}")

    async def analyze_idea(
        self,
        idea_content: str,
        project_context: str = ""
    ) -> AsyncGenerator[str, None]:
        """
        分析 idea 可行性

        Args:
            idea_content: 创新点内容
            project_context: 项目上下文

        Yields:
            str: 流式响应
        """
        system_prompt = """你是一位资深的学术研究顾问，擅长评估研究想法的可行性。

请从以下维度分析用户的研究想法：
1. 创新性 - 是否有原创贡献
2. 可行性 - 技术和资源是否可行
3. 价值性 - 对领域的贡献程度
4. 风险分析 - 可能的困难和挑战
5. 改进建议 - 如何优化和完善

输出格式清晰，使用 markdown 排版。"""

        user_prompt = f"""项目上下文：
{project_context}

研究想法：
{idea_content}

请分析这个研究想法的可行性。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        async for chunk in self._call_with_retry(messages, stream=True):
            yield chunk

    async def text_to_latex(self, text: str) -> str:
        """
        将纯文本转换为 LaTeX 格式

        Args:
            text: 纯文本内容

        Returns:
            str: LaTeX 格式内容
        """
        system_prompt = """你是一位学术论文格式专家，擅长将纯文本转换为 LaTeX 格式。

转换规则：
1. 使用 \\section, \\subsection 等标题命令
2. 使用 \\textbf{}, \\textit{} 等文本格式
3. 使用 \\begin{itemize} 等环境处理列表
4. 使用 \\begin{equation} 等环境处理公式
5. 只返回 LaTeX 代码，不要解释"""

        user_prompt = f"""请将以下文本转换为 LaTeX 格式：

{text}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        return await self._call_with_retry(messages, stream=False)

    async def continue_writing(
        self,
        current_content: str,
        file_context: str = ""
    ) -> AsyncGenerator[str, None]:
        """
        续写论文内容

        Args:
            current_content: 当前内容
            file_context: 文件上下文

        Yields:
            str: 流式响应
        """
        system_prompt = """你是一位优秀的学术论文写作助手。

续写原则：
1. 保持与已有内容的连贯性
2. 使用学术化、正式的语言
3. 逻辑清晰，论证充分
4. 避免重复已有内容
5. 使用 markdown 格式输出"""

        user_prompt = f"""文件上下文：{file_context}

当前内容：
{current_content}

请续写上述内容。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        async for chunk in self._call_with_retry(messages, stream=True):
            yield chunk

    async def check_content(
        self,
        content: str,
        check_type: str = "all"
    ) -> List[Diagnostic]:
        """
        检查内容问题

        Args:
            content: 待检查内容
            check_type: 检查类型 (grammar, logic, all)

        Returns:
            List[Diagnostic]: 诊断信息列表
        """
        system_prompt = f"""你是一位学术文本审阅专家。

请检查以下内容的问题，按以下格式返回 JSON：

```json
{{
  "issues": [
    {{
      "type": "语法错误|逻辑问题|格式问题",
      "severity": "error|warning|info",
      "line": 行号,
      "message": "问题描述",
      "suggestion": "修改建议"
    }}
  ]
}}
```

只返回 JSON，不要其他内容。"""

        user_prompt = f"""检查类型：{check_type}

内容：
{content}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._call_with_retry(messages, stream=False)
            return parse_ai_response(response)
        except Exception as e:
            # 解析失败时返回空列表
            return []

    async def search_papers(
        self,
        keywords: List[str],
        field: str = ""
    ) -> str:
        """
        搜索相关文献

        Args:
            keywords: 关键词列表
            field: 研究领域

        Returns:
            str: 搜索结果
        """
        system_prompt = """你是一位学术文献检索专家。

根据用户的关键词，推荐相关的论文和文献。
对于每篇论文，提供：
1. 标题
2. 作者
3. 发表年份
4. 核心贡献
5. 与用户研究的关联

使用 markdown 格式输出。"""

        user_prompt = f"""研究领域：{field}
关键词：{', '.join(keywords)}

请推荐相关论文。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        return await self._call_with_retry(messages, stream=False)

    async def generate_code(
        self,
        description: str,
        language: str = "python"
    ) -> str:
        """
        生成代码

        Args:
            description: 代码描述
            language: 编程语言

        Returns:
            str: 生成的代码
        """
        system_prompt = f"""你是一位资深的程序员和算法专家。

根据描述生成高质量、可运行的 {language} 代码。

要求：
1. 代码结构清晰
2. 添加必要注释
3. 包含错误处理
4. 使用最佳实践

只返回代码，不要解释。"""

        user_prompt = f"""{description}

请生成 {language} 代码。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        return await self._call_with_retry(messages, stream=False)


# 全局服务实例
ai_service = AIService()
