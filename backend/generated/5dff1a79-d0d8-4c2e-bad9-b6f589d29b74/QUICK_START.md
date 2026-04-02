# WordMaster 快速启动指南

## 🚀 5分钟快速部署

### 步骤1：环境准备
```bash
# 1. 安装必要软件
# - JDK 17+ (https://adoptium.net/)
# - MySQL 8.0+ (https://dev.mysql.com/downloads/)
# - Redis 7.0+ (https://redis.io/download)
# - Node.js 16+ (https://nodejs.org/)

# 2. 验证安装
java -version
mysql --version
redis-server --version
node --version
```

### 步骤2：后端快速启动
```bash
# 1. 克隆项目（如果已克隆请跳过）
git clone <repository-url>
cd wordmaster-backend

# 2. 创建数据库（使用默认配置）
mysql -u root -p < src/main/resources/db/init.sql

# 3. 修改配置文件（可选）
# 编辑 src/main/resources/application.yml
# 修改数据库和Redis连接信息

# 4. 启动后端
mvn spring-boot:run
# 或
java -jar target/wordmaster-backend-1.0.0.jar
```

### 步骤3：前端快速启动
```bash
# 1. 进入前端目录
cd ../wordmaster-frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
# 使用HBuilderX：导入项目 -> 运行到浏览器
# 或使用命令行：
npm run dev:h5
```

## 📱 快速体验

### 测试账号
```
用户名: testuser
密码: test123
```

### 核心功能体验

1. **登录系统**
   - 访问: http://localhost:8080
   - 使用测试账号登录

2. **开始学习**
   - 点击"开始学习"按钮
   - 体验卡片学习模式
   - 点击喇叭图标听发音

3. **查看统计**
   - 进入"统计"页面
   - 查看学习数据图表
   - 了解学习进度

## 🔧 常见问题解决

### 问题1：数据库连接失败
```bash
# 检查MySQL服务是否运行
sudo service mysql status

# 检查数据库用户权限
mysql -u root -p
GRANT ALL PRIVILEGES ON wordmaster.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 问题2：Redis连接失败
```bash
# 启动Redis服务
redis-server

# 或使用Docker启动Redis
docker run -d -p 6379:6379 redis:7-alpine
```

### 问题3：前端无法访问后端
```javascript
// 修改 api/request.js 中的 baseURL
const baseURL = 'http://localhost:8080/api/v1'
```

### 问题4：端口被占用
```bash
# 查找占用端口的进程
lsof -i :8080

# 杀死进程
kill -9 <PID>

# 或修改应用端口
# 在 application.yml 中修改：
# server:
#   port: 8081
```

## 📊 默认数据

### 初始词库
- 四级核心词汇 (500个单词)
- 六级高频词汇 (300个单词)
- 考研必备词汇 (200个单词)
- 托福核心词汇 (100个单词)

### 测试用户
- testuser (普通用户)
- student (学生用户)
- teacher (教师用户)

## ⚡ 性能调优建议

### 开发环境优化
```yaml
# application-dev.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
  redis:
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
```

### 生产环境建议
```yaml
# application-prod.yml
server:
  port: 80
  tomcat:
    max-threads: 200
    min-spare-threads: 20
```

## 🐳 使用Docker快速部署

### 一键启动（推荐）
```bash
# 1. 安装Docker和Docker Compose
# 2. 在项目根目录运行
docker-compose up -d

# 3. 访问应用
# 后端: http://localhost:8080
# 前端: http://localhost:3000
```

### Docker Compose配置
```yaml
# docker-compose.yml 简化版
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: wordmaster
    ports:
      - "3306:3306"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./wordmaster-backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis
```

## 📱 多平台构建

### 构建微信小程序
```bash
# 1. 修改 manifest.json 配置微信小程序appid
# 2. 构建
npm run build:mp-weixin

# 3. 使用微信开发者工具导入 dist/mp-weixin 目录
```

### 构建Android App
```bash
# 1. 安装Android Studio和SDK
# 2. 构建
npm run build:app-plus

# 3. 使用HBuilderX进行打包
```

## 🔍 调试技巧

### 后端调试
```bash
# 启用调试模式
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"

# 使用IDE连接调试端口
```

### 前端调试
```javascript
// 在浏览器开发者工具中
// 1. 查看网络请求
// 2. 查看Console日志
// 3. 使用Vue Devtools
```

## 📈 监控检查

### 健康检查端点
```
# 应用健康状态
http://localhost:8080/api/actuator/health

# 数据库连接状态
http://localhost:8080/api/actuator/health/db

# Redis连接状态
http://localhost:8080/api/actuator/health/redis
```

### 性能监控
```bash
# 查看JVM内存使用
jcmd <PID> VM.native_memory

# 查看GC情况
jstat -gc <PID> 1000
```

## 🎯 下一步

### 学习路径建议
1. ✅ 完成快速启动
2. 🔄 体验核心功能
3. ⚙️ 自定义配置
4. 🚀 部署到生产环境
5. 📊 监控和优化

### 扩展功能
- 添加社交功能（学习小组）
- 集成AI推荐算法
- 开发管理后台
- 支持离线学习

---

**遇到问题？**
- 查看详细文档: [README.md](README.md)
- 提交Issue: [GitHub Issues](https://github.com/yourusername/wordmaster/issues)
- 联系维护者: your.email@example.com

**祝您学习愉快！** 📚✨