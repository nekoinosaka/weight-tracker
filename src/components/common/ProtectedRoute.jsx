import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 如果认证状态正在加载，显示加载状态
  if (loading) {
    return <div>加载中...</div>;
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 如果用户已登录，显示子组件
  return children;
};

export default ProtectedRoute;