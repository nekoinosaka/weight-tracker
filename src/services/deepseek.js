import { supabase } from "./supabase";

// 流式调用版本
export const getDeepseekStream = async (prompt, onChunk, onError, onComplete) => {
  try {
    // 获取Supabase项目URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // 构建函数URL
    const functionUrl = `${supabaseUrl}/functions/v1/smart-handler`;
    
    // 获取认证令牌
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    console.log('Sending streaming request to:', functionUrl);
    
    // 发送请求
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ prompt })
    });
    
    console.log('Got response:', response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    if (!response.body) {
      throw new Error('No response body');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    console.log('Starting to read stream');
    
    let done, value;
    while (!done) {
      console.log('Waiting for next chunk...');
      ({ done, value } = await reader.read());
      
      console.log('Got chunk:', { done, value: value ? value.length : 0 });
      
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        console.log('Decoded chunk:', chunk);
        
        // 处理SSE格式的数据
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data) {
              try {
                const parsed = JSON.parse(data);
                console.log('Parsed SSE data:', parsed);
                
                if (parsed.content) {
                  console.log('Got content chunk:', parsed.content);
                  onChunk(parsed.content);
                } else if (parsed.error) {
                  console.error('Got error chunk:', parsed);
                  onError(new Error(parsed.error + ': ' + parsed.details));
                } else if (parsed.finish) {
                  console.log('Got finish signal');
                  onComplete();
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
                console.error('Problematic data:', data);
              }
            }
          }
        }
      }
    }
    
    console.log('Stream finished');
  } catch (error) {
    console.error('Streaming error:', error);
    onError(error);
  }
};

// 原始非流式版本（保持兼容性）
export const getDeepseek = async (prompt) => {
  const { data, error } = await supabase.functions.invoke("smart-handler", {
    body: {
      prompt: prompt,
      name: "Functions",
    },
    method: "POST",
  });
  
  if (error) {
    return { data: "", error };
  }
  
  try {
    const { text } = data;
    const { choices } = text;
    const { message } = choices[0];
    const { content } = message;

    return {
      data: content || "",
      error,
    };
  } catch (e) {
    console.error('Error processing response:', e);
    return { data: "", error: e };
  }
};
