# AI Agent 技能安全检查规则详解

本文档详细说明AI Agent技能安全检查器所执行的安全检查规则。

## 安全检查原则

### 1. 最小权限原则

技能应该：
- 仅请求完成任务所需的最小权限
- 不访问与任务无关的系统资源
- 不修改不必要的系统配置

### 2. 用户授权原则

任何可能影响系统或数据的操作都必须：
- 获得用户的明确授权确认
- 提供清晰的操作说明
- 允许用户取消或回滚操作

### 3. 数据保护原则

技能应该：
- 避免处理敏感数据
- 不存储不必要的用户数据
- 及时清理临时文件

## 检查类别

### 1. 文件删除操作

#### 高危模式

| 模式 | 说明 | 严重程度 |
|------|------|---------|
| `rm -rf` | 递归强制删除 | 🔴 高危 |
| `shutil.rmtree()` | Python目录删除 | 🔴 高危 |
| `os.remove()` | 文件删除 | 🟡 中等 |
| `os.unlink()` | 文件删除 | 🟡 中等 |
| `del /s /f` | Windows强制删除 | 🔴 高危 |
| `format` | 磁盘格式化 | 🔴 高危 |
| `mkfs` | 文件系统格式化 | 🔴 高危 |
| `dd if=/dev/zero` | 危险磁盘写入 | 🔴 高危 |

#### 检测逻辑

```python
# 高危 - 未授权的删除操作
if "rm -rf" in code and not user_confirmed:
    raise SecurityIssue("未授权的文件删除操作")

# 中等 - 普通删除命令
if re.search(r'\brm\b', code):
    flag_for_review()
```

#### 修复建议

```python
# 错误示例
def cleanup(target_dir):
    shutil.rmtree(target_dir)  # 无确认机制

# 正确示例
def cleanup(target_dir, user_confirmed=False):
    if not user_confirmed:
        raise PermissionError("需要用户明确授权才能执行删除操作")
    if not os.path.exists(target_dir):
        return
    shutil.rmtree(target_dir)
```

### 2. 敏感文件访问

#### 高危路径模式

| 模式 | 说明 | 严重程度 |
|------|------|---------|
| `~/.ssh/` | SSH密钥目录 | 🔴 高危 |
| `~/.aws/` | AWS配置目录 | 🔴 高危 |
| `~/.bashrc` | Shell配置 | 🔴 高危 |
| `/etc/passwd` | 系统密码文件 | 🔴 高危 |
| `/etc/shadow` | 影子密码文件 | 🔴 高危 |
| `.env` | 环境变量文件 | 🔴 高危 |
| `*.keystore` | 密钥库文件 | 🔴 高危 |
| `passwords.txt` | 密码文件 | 🔴 高危 |
| `credentials.json` | 凭证文件 | 🔴 高危 |
| `api_keys.txt` | API密钥文件 | 🔴 高危 |

#### 检测逻辑

```python
# 检测敏感文件访问
SENSITIVE_PATTERNS = [
    r'\.ssh/',      # SSH密钥
    r'\.aws/',      # AWS配置
    r'/etc/passwd', # 系统文件
    r'\.env',       # 环境变量
]

def check_sensitive_access(code):
    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, code):
            raise SecurityIssue(f"访问敏感文件: {pattern}")
```

#### 修复建议

```python
# 错误示例
def read_config():
    with open('/home/user/.aws/credentials') as f:
        return f.read()

# 正确示例 - 使用环境变量
def read_config():
    import os
    aws_key = os.environ.get('AWS_ACCESS_KEY')
    if not aws_key:
        raise ValueError("需要配置AWS访问密钥")
    return aws_key
```

### 3. 危险命令执行

#### 系统级危险命令

| 模式 | 说明 | 严重程度 |
|------|------|---------|
| `sudo su` | 提权到root | 🔴 高危 |
| `chmod 777` | 危险权限设置 | 🔴 高危 |
| `chmod 0` | 移除所有权限 | 🔴 高危 |
| `iptables` | 防火墙修改 | 🔴 高危 |
| `crontab -r` | 删除定时任务 | 🔴 高危 |
| `modprobe` | 内核模块操作 | 🔴 高危 |
| `mount` | 挂载操作 | 🔴 高危 |
| `passwd` | 密码修改 | 🔴 高危 |
| `useradd/userdel` | 用户管理 | 🔴 高危 |
| `nc -e` | 反向shell | 🔴 高危 |

#### 代码执行危险模式

| 模式 | 说明 | 严重程度 |
|------|------|---------|
| `eval()` | 动态代码执行 | 🔴 高危 |
| `exec()` | 代码执行 | 🔴 高危 |
| `subprocess` with shell | Shell执行 | 🔴 高危 |
| `process.exec()` | Node.js命令执行 | 🔴 高危 |
| `os.system()` | 系统命令执行 | 🟡 中等 |

#### 修复建议

```python
# 危险示例
def run_command(cmd):
    os.system(cmd)  # 直接执行用户输入

# 安全示例
def run_command(cmd):
    allowed_commands = ['ls', 'cat', 'grep']
    if cmd.split()[0] not in allowed_commands:
        raise PermissionError("不允许执行该命令")
    subprocess.run(cmd.split(), shell=False)
```

### 4. 信息泄露

#### 硬编码敏感信息

| 模式 | 说明 | 严重程度 |
|------|------|---------|
| `api_key = "..."` | API密钥 | 🔴 高危 |
| `password = "..."` | 密码 | 🔴 高危 |
| `token = "..."` | 令牌 | 🔴 高危 |
| `AWS_ACCESS_KEY_ID` | AWS密钥ID | 🔴 高危 |
| `-----BEGIN RSA PRIVATE KEY-----` | 私钥 | 🔴 高危 |

#### 日志泄露

| 模式 | 说明 | 严重程度 |
|------|------|---------|
| `print(password)` | 密码日志 | 🔴 高危 |
| `console.log(token)` | 令牌日志 | 🔴 高危 |
| `logger.info(user_data)` | 用户数据日志 | 🟡 中等 |
| `traceback.print_exc()` | 堆栈跟踪 | 🟡 中等 |

#### 修复建议

```python
# 危险示例
API_KEY = "sk-1234567890abcdef"

def get_api_key():
    return API_KEY  # 返回硬编码密钥

# 安全示例
import os

def get_api_key():
    return os.environ.get('OPENAI_API_KEY')

def log_user_action(action):
    # 不记录敏感信息
    logger.info(f"User performed: {action}")
```

## 检查流程

```
开始安全检查
    ↓
检查文件类型
    ├─ .py, .js, .ts, .sh, .bash → 继续检查
    └─ 其他文件 → 跳过
    ↓
逐行代码分析
    ↓
模式匹配检查
    ├─ 文件删除模式 → 分类: FILE_DELETE
    ├─ 敏感文件模式 → 分类: SENSITIVE_FILE
    ├─ 危险命令模式 → 分类: DANGEROUS_COMMAND
    ├─ 信息泄露模式 → 分类: INFO_LEAK
    └─ 路径遍历模式 → 分类: PATH_TRAVERSAL
    ↓
严重程度评估
    ↓
生成安全问题报告
    ↓
结束
```

## 严重程度分类标准

### 🔴 高危 (HIGH)

必须立即修复的问题，包括：
- 未授权的文件删除操作
- 敏感文件访问
- 危险系统命令执行
- 硬编码密钥和密码
- 反向shell和提权尝试

### 🟡 中等 (MEDIUM)

应该尽快修复的问题，包括：
- 普通删除命令
- 临时文件操作
- 路径遍历风险
- 日志记录敏感信息
- 子进程执行

### 🟢 低 (LOW)

建议优化的问题，包括：
- 代码注释中的敏感信息
- 详细的错误信息
- 用户信息查询命令

## 误报处理

### 已知误报场景

1. **测试代码中的危险命令**
   - 单元测试中的删除操作
   - 沙箱环境中的危险命令

2. **文档和示例**
   - README中的命令示例
   - 注释中的代码片段

3. **变量名包含关键词**
   - 变量名包含 "password" 但不是密码
   - 函数名包含 "delete" 但不是删除操作

### 减少误报的方法

```python
# 使用上下文分析
def check_dangerous_pattern(code, context):
    # 检查是否在测试函数中
    if context.get('is_test'):
        return False
    
    # 检查是否有安全前缀
    if code.strip().startswith('#'):
        return False
    
    # 检查是否是字符串中的内容
    if in_string_literal(code):
        return False
    
    return True
```

## 配置文件

### 自定义规则

```json
{
  "custom_patterns": [
    {
      "name": "自定义危险命令",
      "pattern": "dangerous_command.*",
      "severity": "high",
      "description": "检测自定义危险命令模式",
      "category": "dangerous_command"
    }
  ],
  "ignore_patterns": [
    {
      "pattern": "# test",
      "description": "忽略测试代码"
    }
  ],
  "severity_overrides": {
    "rm": "low"
  }
}
```

## 合规性检查清单

### 技能提交前检查

- [ ] 不包含未授权的文件删除操作
- [ ] 不访问敏感配置文件
- [ ] 不包含危险系统命令
- [ ] 不硬编码密钥和密码
- [ ] 不在日志中输出敏感信息
- [ ] 使用环境变量管理敏感配置
- [ ] 提供清晰的用户授权机制

### 安全加固建议

1. **输入验证**
   - 验证所有用户输入
   - 使用参数化查询
   - 限制输入长度

2. **输出编码**
   - HTML编码用户输入
   - JSON编码敏感数据
   - 避免直接输出用户数据

3. **访问控制**
   - 最小权限原则
   - 角色分离
   - 审计日志

4. **数据保护**
   - 加密敏感数据
   - 安全存储密钥
   - 定期轮换凭证
