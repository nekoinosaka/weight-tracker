import { supabase } from "./supabase";

export const getDeepseek = async (prompt) => {
  const { data, error } = await supabase.functions.invoke("link-deepseek", {
    body: {
      prompt: prompt,
      name: "Functions",
    },
    method: "POST",
  });
  const { text } = data;
  const { choices } = text;
  const { message } = choices[0];
  const { content } = message;

  // 处理API返回的复杂数据结构
  //   let processedData = null;
  //   if (data && data.text && data.text.choices && data.text.choices.length > 0) {
  //     debugger
  //     // 提取message.content作为响应文本
  //     processedData = data.text.choices[0].message.content;
  //   }

  return {
    data: content || "",
    error,
  };
};
