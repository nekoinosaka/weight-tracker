-- Supabase数据库表结构

-- 注意：users表会由Supabase Auth自动创建

-- 创建每日记录表
CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  body_fat DECIMAL(4,2),
  muscle_mass DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 添加唯一约束，防止用户在同一天重复提交
  UNIQUE(user_id, date)
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, delivered, read
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- message, system
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_id UUID, -- 关联的消息ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为daily_records表添加更新时间触发器
CREATE TRIGGER update_daily_records_updated_at
BEFORE UPDATE ON daily_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为messages表添加更新时间触发器
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为notifications表添加更新时间触发器
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_daily_records_user_id ON daily_records(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);

-- 创建消息表索引
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- 创建通知表索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
