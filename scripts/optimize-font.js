import Fontmin from 'fontmin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义源字体路径和目标路径
const srcPath = path.resolve(__dirname, '../src/styles/fonts/LeeeafHei-Regular.ttf');
const destPath = path.resolve(__dirname, '../src/styles/fonts/optimized');

// 确保目标目录存在
if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
}

// 常用汉字集合 - 这里可以根据项目需要调整
// 包含常用数字、字母、标点和减肥相关的中文字符
const text = [
  '0123456789',
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ',.?!;:"\'\'()[]{}',
  '减肥记录助手体重变化历史数据图表分析目标进度日期时间公斤千克斤',
  '身高体质指数BMI健康饮食运动卡路里消耗摄入水分睡眠',
  '增加减少保持稳定波动趋势平均值最大最小',
  '登录注册用户账号密码设置个人信息保存取消确认',
].join('');

// 创建Fontmin实例
const fontmin = new Fontmin()
  .src(srcPath)
  .use(Fontmin.glyph({ text }))      // 字型提取
  .use(Fontmin.ttf2woff())           // ttf转woff
  .use(Fontmin.ttf2woff2())          // ttf转woff2
  .dest(destPath);

// 执行字体优化
fontmin.run((err, files) => {
  if (err) {
    console.error('字体优化失败:', err);
    return;
  }
  
  console.log('字体优化成功!');
  console.log('优化后的字体文件:');
  files.forEach(file => {
    console.log(`- ${path.basename(file.path)}`);
    // 计算压缩率
    if (file.history && file.history[0] === srcPath) {
      const originalSize = fs.statSync(srcPath).size;
      const optimizedSize = file.contents.length;
      const ratio = ((1 - optimizedSize / originalSize) * 100).toFixed(2);
      console.log(`  原始大小: ${(originalSize / 1024).toFixed(2)}KB`);
      console.log(`  优化大小: ${(optimizedSize / 1024).toFixed(2)}KB`);
      console.log(`  压缩率: ${ratio}%`);
    }
  });
});