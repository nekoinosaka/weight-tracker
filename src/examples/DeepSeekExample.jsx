import { useState } from 'react';
import { getDeepseek } from '../services/deepseek';

// 这是一个简单的示例，展示如何在组件中使用DeepSeek服务
const DeepSeekExample = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      // 调用DeepSeek服务
      const { data, error } = await getDeepseek(prompt);
      
      if (error) {
        console.error('DeepSeek API调用失败:', error);
        alert('请求失败: ' + (error.message || '未知错误'));
        return;
      }
      
      // 处理返回的数据
      setResponse(data);
    } catch (err) {
      console.error('发生错误:', err);
      alert('发生错误: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2>DeepSeek API 使用示例</h2>
      
      <div>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入您的问题"
          rows={4}
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </div>
      
      <button 
        onClick={handleSubmit}
        disabled={loading || !prompt.trim()}
      >
        {loading ? '请求中...' : '发送请求'}
      </button>
      
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3>AI响应:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{response}</pre>
        </div>
      )}
    </div>
  );
};

export default DeepSeekExample;

/* 
使用方法：

1. 导入组件
import DeepSeekExample from '../examples/DeepSeekExample';

2. 在您的页面中使用组件
<DeepSeekExample />

3. 或者直接使用服务
import { getDeepseek } from '../services/deepseek';

const handleAskAI = async (question) => {
  try {
    const { data, error } = await getDeepseek(question);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('DeepSeek API调用错误:', err);
    throw err;
  }
};
*/