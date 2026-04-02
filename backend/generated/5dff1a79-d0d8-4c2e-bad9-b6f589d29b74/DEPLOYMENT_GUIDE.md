# WordMaster 部署指南

## 📋 部署概述

本文档详细介绍了WordMaster背单词小程序的多种部署方式，包括本地部署、Docker部署、云服务器部署和Kubernetes部署。

## 🏠 本地部署

### 环境要求
- **操作系统**: Windows 10+/macOS 10.15+/Ubuntu 20.04+
- **Java**: JDK 17+
- **数据库**: MySQL 8.0+
- **缓存**: Redis 7.0+
- **构建工具**: Maven 3.6+
- **前端环境**: Node.js 16+

### 步骤1：环境准备
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk mysql-server redis-server maven nodejs npm

# macOS
brew install openjdk@17 mysql redis maven node

# Windows
# 1. 下载并安装JDK 17: https://adoptium.net/
# 2. 下载并安装MySQL: https://dev.mysql.com/downloads/
# 3. 下载并安装Redis: https://github.com/microsoftarchive/redis/releases
# 4. 下载并安装Maven: https://maven.apache.org/download.cgi
# 5. 下载并安装Node.js: https://nodejs.org/
```

### 步骤2：数据库配置
```sql
-- 创建数据库
CREATE DATABASE wordmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'wordmaster'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON wordmaster.* TO 'wordmaster'@'localhost';
FLUSH PRIVILEGES;

-- 执行初始化脚本
mysql -u wordmaster -p wordmaster < src/main/resources/db/init.sql
```

### 步骤3：Redis配置
```bash
# 启动Redis
redis-server

# 或使用systemd（Linux）
sudo systemctl start redis
sudo systemctl enable redis

# 验证Redis
redis-cli ping
# 应返回 PONG
```

### 步骤4：后端部署
```bash
# 1. 克隆项目
git clone https://github.com/yourusername/wordmaster.git
cd wordmaster/wordmaster-backend

# 2. 修改配置文件
# 编辑 src/main/resources/application.yml
# 修改数据库和Redis连接信息

# 3. 构建项目
mvn clean package -DskipTests

# 4. 运行项目
java -jar target/wordmaster-backend-1.0.0.jar

# 或使用Maven直接运行
mvn spring-boot:run
```

### 步骤5：前端部署
```bash
# 1. 进入前端目录
cd ../wordmaster-frontend

# 2. 安装依赖
npm install

# 3. 修改API配置
# 编辑 api/request.js，修改baseURL为后端地址

# 4. 开发环境运行
npm run dev:h5

# 5. 生产环境构建
npm run build:h5

# 构建后的文件在 dist/build/h5 目录
```

### 步骤6：验证部署
```bash
# 验证后端
curl http://localhost:8080/api/actuator/health
# 应返回 {"status":"UP"}

# 验证数据库连接
curl http://localhost:8080/api/actuator/health/db
# 应返回 {"status":"UP"}

# 验证Redis连接
curl http://localhost:8080/api/actuator/health/redis
# 应返回 {"status":"UP"}
```

## 🐳 Docker部署

### 单容器部署
```bash
# 1. 构建Docker镜像
cd wordmaster-backend
docker build -t wordmaster-backend:1.0.0 .

# 2. 运行容器
docker run -d \
  --name wordmaster-backend \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/wordmaster \
  -e SPRING_DATASOURCE_USERNAME=wordmaster \
  -e SPRING_DATASOURCE_PASSWORD=password123 \
  -e SPRING_REDIS_HOST=host.docker.internal \
  -e SPRING_REDIS_PORT=6379 \
  wordmaster-backend:1.0.0
```

### Docker Compose部署（推荐）
```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: wordmaster-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: wordmaster
      MYSQL_USER: wordmaster
      MYSQL_PASSWORD: password123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    command: 
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: wordmaster-redis
    ports:
      - "6379:6379"
    command: redis-server --requirepass redis123
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./wordmaster-backend
    container_name: wordmaster-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/wordmaster?useSSL=false&serverTimezone=Asia/Shanghai
      SPRING_DATASOURCE_USERNAME: wordmaster
      SPRING_DATASOURCE_PASSWORD: password123
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SPRING_REDIS_PASSWORD: redis123
      SERVER_PORT: 8080
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  frontend:
    build: ./wordmaster-frontend
    container_name: wordmaster-frontend
    ports:
      - "3000:80"
    environment:
      API_BASE_URL: http://backend:8080/api/v1
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: wordmaster-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
```

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### Dockerfile示例
```dockerfile
# 后端Dockerfile
FROM openjdk:17-jdk-slim AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/target/wordmaster-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```dockerfile
# 前端Dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:h5

FROM nginx:alpine
COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ☁️ 云服务器部署

### 阿里云/腾讯云部署
```bash
# 1. 购买云服务器（推荐配置）
# - CPU: 2核
# - 内存: 4GB
# - 系统盘: 50GB
# - 操作系统: Ubuntu 20.04 LTS

# 2. 连接服务器
ssh root@your-server-ip

# 3. 安装必要软件
apt update
apt install -y docker docker-compose git

# 4. 克隆项目
git clone https://github.com/yourusername/wordmaster.git
cd wordmaster

# 5. 修改配置文件
# 编辑 docker-compose.yml，修改环境变量

# 6. 启动服务
docker-compose up -d

# 7. 配置防火墙
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 配置域名和SSL
```bash
# 1. 安装Certbot（Let's Encrypt）
apt install -y certbot python3-certbot-nginx

# 2. 获取SSL证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 3. 自动续期
certbot renew --dry-run

# 4. 配置Nginx反向代理
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🚢 Kubernetes部署

### 部署文件示例
```yaml
# wordmaster-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wordmaster
```

```yaml
# wordmaster-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: wordmaster-config
  namespace: wordmaster
data:
  application.yml: |
    spring:
      datasource:
        url: jdbc:mysql://wordmaster-mysql:3306/wordmaster
        username: wordmaster
        password: password123
      redis:
        host: wordmaster-redis
        port: 6379
        password: redis123
    server:
      port: 8080
```

```yaml
# wordmaster-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: wordmaster-secret
  namespace: wordmaster
type: Opaque
data:
  mysql-password: cGFzc3dvcmQxMjM=  # password123
  redis-password: cmVkaXMxMjM=      # redis123
```

```yaml
# wordmaster-mysql.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: wordmaster-mysql
  namespace: wordmaster
spec:
  serviceName: wordmaster-mysql
  replicas: 1
  selector:
    matchLabels:
      app: wordmaster-mysql
  template:
    metadata:
      labels:
        app: wordmaster-mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: wordmaster-secret
              key: mysql-password
        - name: MYSQL_DATABASE
          value: "wordmaster"
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: mysql-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: wordmaster-mysql
  namespace: wordmaster
spec:
  selector:
    app: wordmaster-mysql
  ports:
  - port: 3306
    targetPort: 3306
```

```yaml
# wordmaster-backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordmaster-backend
  namespace: wordmaster
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wordmaster-backend
  template:
    metadata:
      labels:
        app: wordmaster-backend
    spec:
      containers:
      - name: backend
        image: wordmaster-backend:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        volumeMounts:
        - name: config
          mountPath: /app/config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
      volumes:
      - name: config
        configMap:
          name: wordmaster-config
---
apiVersion: v1
kind: Service
metadata:
  name: wordmaster-backend
  namespace: wordmaster
spec:
  selector:
    app: wordmaster-backend
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wordmaster-ingress
  namespace: wordmaster
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: wordmaster.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: wordmaster-backend
            port:
              number: 80
```

### 部署命令
```bash
# 1. 创建命名空间
kubectl apply -f wordmaster-namespace.yaml

# 2. 创建配置
kubectl apply -f wordmaster-configmap.yaml
kubectl apply -f wordmaster-secret.yaml

# 3. 部署MySQL
kubectl apply -f wordmaster-mysql.yaml

# 4. 部署Redis
kubectl apply -f wordmaster-redis.yaml

# 5. 部署后端
kubectl apply -f wordmaster-backend.yaml

# 6. 部署前端
kubectl apply -f wordmaster-frontend.yaml

# 7. 查看部署状态
kubectl get all -n wordmaster

# 8. 查看日志
kubectl logs -f deployment/wordmaster-backend -n wordmaster
```

## 📊 监控和日志

### 应用监控
```yaml
# prometheus配置
scrape_configs:
  - job_name: 'wordmaster-backend'
    metrics_path: '/api/actuator/prometheus'
    static_configs:
      - targets: ['wordmaster-backend:8080']
        labels:
          application: 'wordmaster-backend'
```

### 日志收集
```yaml
# logback-spring.xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="./logs"/>
    <property name="LOG_FILE" value="wordmaster"/>
    
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${LOG_FILE}.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${LOG_FILE}.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### 性能监控
```bash
# 使用jconsole监控JVM
jconsole localhost:8080

# 使用jstat监控GC
jstat -gc <pid> 1000

# 使用jmap分析内存
jmap -heap <pid>
jmap -histo:live <pid>
```

## 🔒 安全配置

### 生产环境安全建议
```yaml
# application-prod.yml
spring:
  security:
    user:
      name: admin
      password: ${ADMIN_PASSWORD:strong_password}
  
  datasource:
    hikari:
      connection-timeout: 30000
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 600000
      max-lifetime: 1800000
  
  redis:
    ssl: true
    timeout: 2000
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: -1

server:
  tomcat:
    max-threads: 200
    min-spare-threads: 20
    max-connections: 10000
    connection-timeout: 30000
  
  compression:
    enabled: true
    mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json
    min-response-size: 1024
  
  error:
    whitelabel:
      enabled: false

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
      base-path: /api/actuator
    enabled-by-default: false
  endpoint:
    health:
      show-details: never
      probes:
        enabled: true
    metrics:
      enabled: true
  info:
    env:
      enabled: true
```

### 防火墙配置
```bash
# 配置iptables（Linux）
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 3306 -j DROP  # 禁止外部访问MySQL
iptables -A INPUT -p tcp --dport 6379 -j DROP  # 禁止外部访问Redis
iptables -A INPUT -j DROP

# 或使用firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --remove-service=ssh  # 可选，禁用SSH
firewall-cmd --reload
```

## 📈 性能优化

### 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_word_word ON word(word);
CREATE INDEX idx_study_record_user_next_review ON study_record(user_id, next_review_time);
CREATE INDEX idx_study_record_user_word ON study_record(user_id, word_id);

-- 优化查询
EXPLAIN SELECT * FROM word WHERE word LIKE 'a%';

-- 定期优化表
OPTIMIZE TABLE word;
OPTIMIZE TABLE study_record;
```

### JVM优化
```bash
# JVM参数
java -jar app.jar \
  -Xms512m \
  -Xmx1024m \
  -XX:MetaspaceSize=128m \
  -XX:MaxMetaspaceSize=256m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:ParallelGCThreads=4 \
  -XX:ConcGCThreads=2 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=./heapdump.hprof
```

### Redis优化
```bash
# Redis配置
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 🔄 备份和恢复

### 数据库备份
```bash
# 备份数据库
mysqldump -u wordmaster -p wordmaster > wordmaster_backup_$(date +%Y%m%d).sql

# 压缩备份
mysqldump -u wordmaster -p wordmaster | gzip > wordmaster_backup_$(date +%Y%m%d).sql.gz

# 自动备份脚本
#!/bin/bash
BACKUP_DIR="/backup/wordmaster"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u wordmaster -p'password123' wordmaster | gzip > $BACKUP_DIR/wordmaster_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### Redis备份
```bash
# 保存RDB文件
redis-cli SAVE

# 或使用BGSAVE（后台保存）
redis-cli BGSAVE

# 备份RDB文件
cp /var/lib/redis/dump.rdb /backup/redis_dump_$(date +%Y%m%d).rdb
```

### 应用数据备份
```bash
# 备份上传的文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /path/to/uploads

# 备份日志文件
tar -czf logs_backup_$(date +%Y%m%d).tar.gz /path/to/logs
```

## 🚨 故障排除

### 常见问题

#### 问题1：数据库连接失败
```bash
# 检查MySQL服务
systemctl status mysql

# 检查连接
mysql -u wordmaster -p -h localhost wordmaster

# 检查防火墙
iptables -L -n | grep 3306
```

#### 问题2：Redis连接失败
```bash
# 检查Redis服务
systemctl status redis

# 测试连接
redis-cli -h localhost -p 6379 ping

# 查看日志
tail -f /var/log/redis/redis-server.log
```

#### 问题3：应用启动失败
```bash
# 查看应用日志
tail -f logs/wordmaster.log

# 检查端口占用
netstat -tlnp | grep 8080

# 检查JVM内存
jps -l
jstat -gc <pid>
```

#### 问题4：前端无法访问后端
```bash
# 检查网络连通性
curl http://localhost:8080/api/actuator/health

# 检查CORS配置
curl -I http://localhost:8080/api/v1/words/1

# 检查Nginx配置
nginx -t
```

### 性能问题排查
```bash
# 查看CPU使用率
top -p $(pgrep -f wordmaster)

# 查看内存使用
ps aux | grep wordmaster

# 查看磁盘IO
iostat -x 1

# 查看网络连接
netstat -an | grep 8080
```

## 🔄 更新和升级

### 版本升级
```bash
# 1. 备份当前版本
cp -r wordmaster-backend wordmaster-backend-backup-$(date +%Y%m%d)

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建
mvn clean package -DskipTests

# 4. 停止旧服务
systemctl stop wordmaster

# 5. 部署新版本
cp target/wordmaster-backend-1.0.1.jar /opt/wordmaster/

# 6. 启动新服务
systemctl start wordmaster

# 7. 验证升级
curl http://localhost:8080/api/actuator/info
```

### 数据库迁移
```sql
-- 创建迁移脚本
-- db/migrations/V1.1__add_new_column.sql
ALTER TABLE user ADD COLUMN IF NOT EXISTS last_login_time DATETIME;

-- 执行迁移
mysql -u wordmaster -p wordmaster < db/migrations/V1.1__add_new_column.sql
```

## 📞 支持与维护

### 监控告警
```yaml
# alertmanager配置
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://your-webhook-url'
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
```

### 维护计划
```bash
# 每日维护任务
0 2 * * * /opt/wordmaster/scripts/daily_maintenance.sh

# 每周维护任务
0 3 * * 0 /opt/wordmaster/scripts/weekly_maintenance.sh

# 每月维护任务
0 4 1 * * /opt/wordmaster/scripts/monthly_maintenance.sh
```

---

**部署成功标志**：
1. ✅ 所有服务正常运行
2. ✅ 数据库连接正常
3. ✅ Redis连接正常
4. ✅ API接口可访问
5. ✅ 前端页面可访问
6. ✅ 监控系统正常工作

**下一步**：
- 配置监控告警
- 设置定期备份
- 进行压力测试
- 制定应急预案

如有部署问题，请参考详细文档或联系技术支持。