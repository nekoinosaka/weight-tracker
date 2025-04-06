import { supabase } from './supabase';

export const getDeepseek = async (prompt) => {
  const { data, error } = await supabase.functions.invoke("link-deepseek", {
    body: { 
        prompt: prompt,
        name: "Functions"
     },
  });
  return {
    data,
    error,
  };
};
