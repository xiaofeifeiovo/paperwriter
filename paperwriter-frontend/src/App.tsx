/* 根组件 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProjectSelectorPage from './pages/ProjectSelectorPage';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/project" element={<ProjectSelectorPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/" element={<Navigate to="/project" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
