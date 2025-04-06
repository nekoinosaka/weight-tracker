import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { getDeepseek } from '../services/deepseek';

const DeepSeek = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getDeepseek(prompt);
      
      if (error) {
        throw new Error(error.message || '请求失败');
      }
      
      setResponse(data);
    } catch (err) {
      console.error('DeepSeek API 调用错误:', err);
      setError(err.message || '发生错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        DeepSeek AI 助手
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="输入您的问题"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            margin="normal"
            disabled={loading}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || !prompt.trim()}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '提交'}
          </Button>
        </form>
      </Paper>

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {response && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>AI 响应:</Typography>
          <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {response}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DeepSeek;