# Lambda 测试 URLs

## 本地测试 (serverless offline)

启动命令：
```bash
pnpm serverless:dev
```

服务器运行在：`http://localhost:3001`

## 已部署的 Lambda 端点

**基础 URL**: `https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com`

## 测试端点

### 1. 健康检查
```bash
# 本地
curl http://localhost:3001/
curl http://localhost:3001/health

# 生产环境
curl https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/
curl https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/health
```

### 2. 用户注册
```bash
# 本地
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# 生产环境
curl -X POST https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 3. Urges API
```bash
# 获取所有 urges - 本地
curl http://localhost:3001/api/urges

# 获取所有 urges - 生产环境
curl https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/api/urges

# 创建新 urge - 本地
curl -X POST http://localhost:3001/api/urges \
  -H "Content-Type: application/json" \
  -d '{"type":"smoking","intensity":5}'

# 创建新 urge - 生产环境
curl -X POST https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/api/urges \
  -H "Content-Type: application/json" \
  -d '{"type":"smoking","intensity":5}'
```

### 4. Moods API
```bash
# 获取所有 moods - 本地
curl http://localhost:3001/api/moods

# 获取所有 moods - 生产环境
curl https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/api/moods

# 创建新 mood - 本地
curl -X POST http://localhost:3001/api/moods \
  -H "Content-Type: application/json" \
  -d '{"mood":"happy","level":8}'

# 创建新 mood - 生产环境
curl -X POST https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/api/moods \
  -H "Content-Type: application/json" \
  -d '{"mood":"happy","level":8}'
```

## 浏览器测试

直接在浏览器中访问：

**本地：**
- http://localhost:3001/
- http://localhost:3001/health
- http://localhost:3001/api/urges
- http://localhost:3001/api/moods

**生产环境：**
- https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/
- https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/health
- https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/api/urges
- https://fge3b3gmw9.execute-api.us-east-1.amazonaws.com/api/moods

## 部署命令

```bash
# 部署到 AWS
pnpm serverless:deploy

# 删除部署
pnpm serverless:remove

# 查看日志
serverless logs -f api -t
``` 