# 1️⃣ 构建阶段
FROM node AS build-stage
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 先复制依赖文件（利用缓存）
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建 Vue 项目
RUN pnpm build

# 2️⃣ 生产环境阶段
FROM nginx:alpine AS production-stage

# 复制打包好的文件到 Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 自定义 Nginx 配置（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
