import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import RecordForm from '../pages/RecordForm';
import WeightHistory from '../pages/WeightHistory';
import DeepSeek from '../pages/DeepSeek';
import Messages from '../pages/Messages';
import Conversation from '../pages/Conversation';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/record" element={<ProtectedRoute><RecordForm /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><WeightHistory /></ProtectedRoute>} />
      <Route path="/deepseek" element={<ProtectedRoute><DeepSeek /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;