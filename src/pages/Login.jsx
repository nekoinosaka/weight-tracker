import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  // 如果用户已登录，重定向到首页
  if (user) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // 清除错误信息
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!form.email) {
      setError('请输入邮箱地址');
      return;
    }
    if (!form.password) {
      setError('请输入密码');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isLogin) {
        // 登录
        await signIn(form.email, form.password);
        navigate('/');
      } else {
        // 注册
        await signUp(form.email, form.password);
        setError('');
        setIsLogin(true);
        setForm({ email: form.email, password: '' });
        // 显示注册成功信息
        setError('注册成功！请登录您的账号。');
      }
    } catch (err) {
      console.error('认证错误:', err.message);
      setError(err.message === 'Invalid login credentials' 
        ? '邮箱或密码错误' 
        : `错误: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setIsLogin(newValue === 0);
    setError('');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          减肥记录助手
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, width: '100%', mt: 2 }}>
          <Tabs value={isLogin ? 0 : 1} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="登录" />
            <Tab label="注册" />
          </Tabs>
          
          {error && (
            <Alert severity={error.includes('成功') ? 'success' : 'error'} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="邮箱地址"
              name="email"
              autoComplete="email"
              autoFocus
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
