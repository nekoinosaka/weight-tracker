// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 记录相关操作
export const recordService = {
  async addRecord(recordData) {
    // 使用upsert操作，当用户在同一天重复提交时，更新现有记录
    // 通过user_id和date作为唯一约束条件
    const { data, error } = await supabase
      .from('daily_records')
      .upsert(recordData, { 
        onConflict: 'user_id,date',
        ignoreDuplicates: false // 不忽略重复，而是更新
      })
      .select();
      
    if (error) throw error;
    return data;
  },
  
  async getRecords(userId) {
    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending:false  });
      
    if (error) throw error;
    return data;
  },
  
  async deleteRecord(recordId) {
    const { error } = await supabase
      .from('daily_records')
      .delete()
      .eq('id', recordId);
      
    if (error) throw error;
    return true;
  },

  async bulkAddRecords(recordsData) {
    // 批量添加记录，每次最多插入100条记录
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < recordsData.length; i += batchSize) {
      const batch = recordsData.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('daily_records')
        .upsert(batch, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false // 不忽略重复，而是更新
        })
        .select();
        
      if (error) throw error;
      results.push(...data);
    }
    
    return results;
  },
  
  async bulkDeleteRecords(recordIds) {
    // 批量删除记录，每次最多删除100条记录
    const batchSize = 100;
    
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batchIds = recordIds.slice(i, i + batchSize);
      const { error } = await supabase
        .from('daily_records')
        .delete()
        .in('id', batchIds);
        
      if (error) throw error;
    }
    
    return true;
  },
  
  async checkDuplicateDates(userId, dates) {
    // 检查指定日期是否已存在记录
    // 返回已存在记录的日期列表
    if (!dates || dates.length === 0) return [];
    
    const { data, error } = await supabase
      .from('daily_records')
      .select('date')
      .eq('user_id', userId)
      .in('date', dates);
      
    if (error) throw error;
    return data.map(record => record.date);
  }
};