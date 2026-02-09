# AI 技能集合

此仓库包含一系列 AI Agent 技能，用于增强编码助手的能力。

## 可用技能

| 技能 | 描述 | 语言 |
|------|------|------|
| [skill-security-checker](skill-security-checker/) | 系统性评估 AI Agent 技能的安全性 | 中文 |
| [skill-security-checker-en](skill-security-checker-en/) | 安全检查器的英文版本 | English |
| [skill-validator](skill-validator/) | 验证 AI Agent 技能的规范性 | 中文 |
| [skill-validator-en](skill-validator-en/) | 技能验证器的英文版本 | English |

## 快速开始

### 使用 npx skills 安装技能

本项目支持通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI 工具进行安装。

#### 从 GitHub 安装

```bash
# 从此仓库安装所有技能
npx skills add pengzhanbo/skills

# 安装特定技能
npx skills add pengzhanbo/skills --skill skill-security-checker

# 安装到指定的 Agent
npx skills add pengzhanbo/skills -a claude-code -a cursor
```

#### 从本地路径安装

```bash
# 从本地仓库安装
npx skills add ./path/to/your/skills

# 安装特定技能
npx skills add ./skill-security-checker
```

#### 交互式安装

```bash
# 列出可用的技能
npx skills add pengzhanbo/skills --list

# 交互式安装
npx skills add pengzhanbo/skills
```

#### 全局安装

```bash
# 安装到全局范围（所有项目可用）
npx skills add ./skill-security-checker --global
```

### 常用命令

```bash
# 列出已安装的技能
npx skills list

# 搜索技能
npx skills find security

# 移除技能
npx skills remove skill-security-checker

# 检查更新
npx skills check

# 更新所有技能
npx skills update
```

## 技能说明

### skill-security-checker / skill-security-checker-en

**用途**: 系统性评估 AI Agent 技能的安全性

**功能**:
- 检测未授权的文件删除操作
- 识别敏感文件访问模式
- 检测危险系统命令
- 发现硬编码的密钥和凭证
- 生成详细的 Markdown 安全报告

**语言版本**:
- skill-security-checker: 中文文档
- skill-security-checker-en: 英文文档

**使用方法**:
```bash
# 检查所有技能
python scripts/check_security.py ./skills

# 生成详细报告
python scripts/check_security.py ./skills --output-format detailed

# 检查特定技能
python scripts/check_security.py ./skills/pdf-processing --severity high
```

### skill-validator / skill-validator-en

**用途**: 验证 AI Agent 技能的规范性

**功能**:
- 验证 SKILL.md 结构和前置元数据
- 检查文档完整性
- 验证脚本文件组织
- 确保 references 目录结构
- 生成验证报告

**语言版本**:
- skill-validator: 中文文档
- skill-validator-en: 英文文档

**使用方法**:
```bash
# 验证所有技能
python scripts/validate_skills.py ./skills

# 生成详细报告
python scripts/validate_skills.py ./skills --output-format detailed

# 验证特定技能
python scripts/validate_skills.py ./skills/pdf-processing --severity high
```

## 项目结构

```txt
.
├── README.md                    # 本文件
├── agent-skills-guide.md         # 技能开发指南
├── skill-security-checker/       # 安全检查器（中文）
│   ├── SKILL.md
│   ├── references/
│   │   └── SECURITY_RULES.md
│   └── scripts/
│       ├── check_security.py
│       └── check_security.mjs
├── skill-security-checker-en/   # 安全检查器（英文）
│   ├── SKILL.md
│   ├── references/
│   │   └── SECURITY_RULES.md
│   └── scripts/
│       ├── check_security.py
│       └── check_security.mjs
├── skill-validator/             # 技能验证器（中文）
│   ├── SKILL.md
│   ├── references/
│   │   └── VALIDATION_RULES.md
│   └── scripts/
│       ├── validate_skills.py
│       └── validate_skills.mjs
└── skill-validator-en/          # 技能验证器（英文）
    ├── SKILL.md
    ├── references/
    │   └── VALIDATION_RULES.md
    └── scripts/
        ├── validate_skills.py
        └── validate_skills.mjs
```

## 贡献者指南

### 添加新技能

1. 按照技能结构创建新目录
2. 添加带有正确前置元数据的 SKILL.md
3. 创建包含实现的 scripts/ 目录
4. 添加包含文档的 references/ 目录
5. 更新本 README.md 添加技能说明

### 运行验证

提交前验证您的技能：

```bash
# 运行技能验证器
cd /path/to/skill
python ../skill-validator/scripts/validate_skills.py .

# 运行安全检查器
python ../skill-security-checker/scripts/check_security.py .
```

## 相关资源

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - 官方技能 CLI
- [skills.sh](https://skills.sh) - 发现更多 Agent 技能
- [Agent Skills 指南](agent-skills-guide.md) - 开发指南

## 许可证

MIT
