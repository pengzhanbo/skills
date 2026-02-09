# AI Agent Skill Security Checker Detailed Rules

This document explains in detail the security check rules performed by the AI Agent Skill Security Checker.

## Security Check Principles

### 1. Principle of Least Privilege

Skills should:
- Request only the minimum permissions required to complete tasks
- Not access system resources unrelated to the task
- Not modify unnecessary system configurations

### 2. User Authorization Principle

Any operations that may affect the system or data must:
- Obtain explicit user authorization confirmation
- Provide clear operation instructions
- Allow users to cancel or rollback operations

### 3. Data Protection Principle

Skills should:
- Avoid processing sensitive data
- Not store unnecessary user data
- Clean up temporary files promptly

## Check Categories

### 1. File Deletion Operations

#### High-Risk Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| `rm -rf` | Recursive force deletion | 🔴 High Risk |
| `shutil.rmtree()` | Python directory deletion | 🔴 High Risk |
| `os.remove()` | File deletion | 🟡 Medium |
| `os.unlink()` | File deletion | 🟡 Medium |
| `del /s /f` | Windows force deletion | 🔴 High Risk |
| `format` | Disk formatting | 🔴 High Risk |
| `mkfs` | Filesystem formatting | 🔴 High Risk |
| `dd if=/dev/zero` | Dangerous disk writing | 🔴 High Risk |

#### Detection Logic

```python
# High Risk - Unauthorized deletion operation
if "rm -rf" in code and not user_confirmed:
    raise SecurityIssue("Unauthorized file deletion operation")

# Medium Risk - Regular deletion command
if re.search(r'\brm\b', code):
    flag_for_review()
```

#### Remediation Suggestions

```python
# Wrong Example
def cleanup(target_dir):
    shutil.rmtree(target_dir)  # No confirmation mechanism

# Correct Example
def cleanup(target_dir, user_confirmed=False):
    if not user_confirmed:
        raise PermissionError("User explicit authorization required to perform deletion operations")
    if not os.path.exists(target_dir):
        return
    shutil.rmtree(target_dir)
```

### 2. Sensitive File Access

#### High-Risk Path Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| `~/.ssh/` | SSH key directory | 🔴 High Risk |
| `~/.aws/` | AWS configuration directory | 🔴 High Risk |
| `~/.bashrc` | Shell configuration | 🔴 High Risk |
| `/etc/passwd` | System password file | 🔴 High Risk |
| `/etc/shadow` | Shadow password file | 🔴 High Risk |
| `.env` | Environment variable file | 🔴 High Risk |
| `*.keystore` | Keystore file | 🔴 High Risk |
| `passwords.txt` | Password file | 🔴 High Risk |
| `credentials.json` | Credential file | 🔴 High Risk |
| `api_keys.txt` | API key file | 🔴 High Risk |

#### Detection Logic

```python
# Detect sensitive file access
SENSITIVE_PATTERNS = [
    r'\.ssh/',      # SSH keys
    r'\.aws/',      # AWS configuration
    r'/etc/passwd', # System files
    r'\.env',       # Environment variables
]

def check_sensitive_access(code):
    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, code):
            raise SecurityIssue(f"Accessing sensitive file: {pattern}")
```

#### Remediation Suggestions

```python
# Wrong Example
def read_config():
    with open('/home/user/.aws/credentials') as f:
        return f.read()

# Correct Example - Using environment variables
def read_config():
    import os
    aws_key = os.environ.get('AWS_ACCESS_KEY')
    if not aws_key:
        raise ValueError("AWS access key needs to be configured")
    return aws_key
```

### 3. Dangerous Command Execution

#### System-Level Dangerous Commands

| Pattern | Description | Severity |
|---------|-------------|----------|
| `sudo su` | Privilege escalation to root | 🔴 High Risk |
| `chmod 777` | Dangerous permission setting | 🔴 High Risk |
| `chmod 0` | Remove all permissions | 🔴 High Risk |
| `iptables` | Firewall modification | 🔴 High Risk |
| `crontab -r` | Delete scheduled tasks | 🔴 High Risk |
| `modprobe` | Kernel module operation | 🔴 High Risk |
| `mount` | Mount operation | 🔴 High Risk |
| `passwd` | Password modification | 🔴 High Risk |
| `useradd/userdel` | User management | 🔴 High Risk |
| `nc -e` | Reverse shell | 🔴 High Risk |

#### Code Execution Dangerous Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| `eval()` | Dynamic code execution | 🔴 High Risk |
| `exec()` | Code execution | 🔴 High Risk |
| `subprocess` with shell | Shell execution | 🔴 High Risk |
| `process.exec()` | Node.js command execution | 🔴 High Risk |
| `os.system()` | System command execution | 🟡 Medium |

#### Remediation Suggestions

```python
# Dangerous Example
def run_command(cmd):
    os.system(cmd)  # Directly execute user input

# Safe Example
def run_command(cmd):
    allowed_commands = ['ls', 'cat', 'grep']
    if cmd.split()[0] not in allowed_commands:
        raise PermissionError("Command not allowed")
    subprocess.run(cmd.split(), shell=False)
```

### 4. Information Leakage

#### Hardcoded Sensitive Information

| Pattern | Description | Severity |
|---------|-------------|----------|
| `api_key = "..."` | API key | 🔴 High Risk |
| `password = "..."` | Password | 🔴 High Risk |
| `token = "..."` | Token | 🔴 High Risk |
| `AWS_ACCESS_KEY_ID` | AWS key ID | 🔴 High Risk |
| `-----BEGIN RSA PRIVATE KEY-----` | Private key | 🔴 High Risk |

#### Log Leakage

| Pattern | Description | Severity |
|---------|-------------|----------|
| `print(password)` | Password log | 🔴 High Risk |
| `console.log(token)` | Token log | 🔴 High Risk |
| `logger.info(user_data)` | User data log | 🟡 Medium |
| `traceback.print_exc()` | Stack trace | 🟡 Medium |

#### Remediation Suggestions

```python
# Dangerous Example
API_KEY = "sk-1234567890abcdef"

def get_api_key():
    return API_KEY  # Returns hardcoded key

# Safe Example
import os

def get_api_key():
    return os.environ.get('OPENAI_API_KEY')

def log_user_action(action):
    # Do not log sensitive information
    logger.info(f"User performed: {action}")
```

## Check Flow

```
Start Security Check
    ↓
Check File Types
    ├─ .py, .js, .ts, .sh, .bash → Continue Check
    └─ Other Files → Skip
    ↓
Line-by-Line Code Analysis
    ↓
Pattern Matching Check
    ├─ File Deletion Pattern → Category: FILE_DELETE
    ├─ Sensitive File Pattern → Category: SENSITIVE_FILE
    ├─ Dangerous Command Pattern → Category: DANGEROUS_COMMAND
    ├─ Information Leakage Pattern → Category: INFO_LEAK
    └─ Path Traversal Pattern → Category: PATH_TRAVERSAL
    ↓
Severity Assessment
    ↓
Generate Security Issue Report
    ↓
End
```

## Severity Classification Standards

### 🔴 High Risk (HIGH)

Issues that must be fixed immediately, including:
- Unauthorized file deletion operations
- Sensitive file access
- Dangerous system command execution
- Hardcoded keys and passwords
- Reverse shell and privilege escalation attempts

### 🟡 Medium Risk (MEDIUM)

Issues that should be fixed soon, including:
- Regular deletion commands
- Temporary file operations
- Path traversal risks
- Logging sensitive information
- Subprocess execution

### 🟢 Low Risk (LOW)

Issues recommended for optimization, including:
- Sensitive information in code comments
- Detailed error messages
- User information query commands

## False Positive Handling

### Known False Positive Scenarios

1. **Dangerous Commands in Test Code**
   - Deletion operations in unit tests
   - Dangerous commands in sandbox environments

2. **Documentation and Examples**
   - Command examples in README
   - Code snippets in comments

3. **Variable Names Containing Keywords**
   - Variables named "password" but not passwords
   - Functions named "delete" but not deletion operations

### Methods to Reduce False Positives

```python
# Use context analysis
def check_dangerous_pattern(code, context):
    # Check if in test function
    if context.get('is_test'):
        return False
    
    # Check for safety prefix
    if code.strip().startswith('#'):
        return False
    
    # Check if in string literal
    if in_string_literal(code):
        return False
    
    return True
```

## Configuration Files

### Custom Rules

```json
{
  "custom_patterns": [
    {
      "name": "Custom Dangerous Command",
      "pattern": "dangerous_command.*",
      "severity": "high",
      "description": "Detect custom dangerous command patterns",
      "category": "dangerous_command"
    }
  ],
  "ignore_patterns": [
    {
      "pattern": "# test",
      "description": "Ignore test code"
    }
  ],
  "severity_overrides": {
    "rm": "low"
  }
}
```

## Compliance Checklist

### Pre-Submission Checks

- [ ] No unauthorized file deletion operations
- [ ] No access to sensitive configuration files
- [ ] No dangerous system commands
- [ ] No hardcoded keys and passwords
- [ ] No sensitive information in logs
- [ ] Use environment variables for sensitive configuration
- [ ] Provide clear user authorization mechanism

### Security Hardening Suggestions

1. **Input Validation**
   - Validate all user input
   - Use parameterized queries
   - Limit input length

2. **Output Encoding**
   - HTML encode user input
   - JSON encode sensitive data
   - Avoid direct output of user data

3. **Access Control**
   - Principle of least privilege
   - Role separation
   - Audit logs

4. **Data Protection**
   - Encrypt sensitive data
   - Store keys securely
   - Rotate credentials regularly
