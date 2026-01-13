"""AI 工具函数"""
import json
import re
from typing import List, Dict, Any
from app.models.ai import Diagnostic


def build_prompt(
    system_prompt: str,
    user_content: str,
    context: Dict[str, Any] | None = None
) -> List[Dict[str, str]]:
    """
    构建 AI 提示词

    Args:
        system_prompt: 系统提示词
        user_content: 用户内容
        context: 额外上下文

    Returns:
        List[Dict]: 消息列表
    """
    messages = [
        {"role": "system", "content": system_prompt}
    ]

    user_message = user_content
    if context:
        context_str = "\n".join([f"{k}: {v}" for k, v in context.items()])
        user_message = f"上下文信息：\n{context_str}\n\n{user_content}"

    messages.append({"role": "user", "content": user_message})
    return messages


def parse_ai_response(response: str) -> List[Diagnostic]:
    """
    解析 AI 响应，提取诊断信息

    Args:
        response: AI 响应文本

    Returns:
        List[Diagnostic]: 诊断信息列表
    """
    diagnostics = []

    try:
        # 尝试提取 JSON 代码块
        json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # 尝试直接解析整个响应
            json_str = response

        data = json.loads(json_str)

        if "issues" in data:
            for issue in data["issues"]:
                severity_map = {
                    "error": "error",
                    "warning": "warning",
                    "info": "info"
                }
                diagnostics.append(Diagnostic(
                    from={"line": issue.get("line", 0), "ch": 0},
                    to={"line": issue.get("line", 0) + 1, "ch": 0},
                    severity=severity_map.get(issue.get("severity", "info"), "info"),
                    message=issue.get("message", "")
                ))

    except (json.JSONDecodeError, AttributeError, KeyError) as e:
        # 解析失败，返回空列表
        pass

    return diagnostics


def extract_diagnostics_from_text(text: str) -> List[Diagnostic]:
    """
    从文本中提取诊断信息（备用方案）

    Args:
        text: 文本内容

    Returns:
        List[Diagnostic]: 诊断信息列表
    """
    # 简单的文本解析逻辑
    diagnostics = []

    # 示例：查找 "Line X: Error message" 格式
    pattern = r'Line (\d+):\s*(.+?)(?=\n|$)'
    matches = re.findall(pattern, text)

    for line_num, message in matches:
        severity = "error" if "error" in message.lower() else "warning"
        diagnostics.append(Diagnostic(
            from={"line": int(line_num) - 1, "ch": 0},
            to={"line": int(line_num), "ch": 0},
            severity=severity,
            message=message.strip()
        ))

    return diagnostics


def format_chat_history(messages: List[Dict[str, str]]) -> str:
    """
    格式化聊天历史

    Args:
        messages: 消息列表

    Returns:
        str: 格式化后的历史记录
    """
    formatted = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        formatted.append(f"{role.upper()}: {content}")

    return "\n\n".join(formatted)
