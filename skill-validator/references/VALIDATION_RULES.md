# 技能验证规则详解

本文档详细说明AI Agent技能规范验证器所执行的各项检查规则。

## 目录结构规则

### 必需文件

每个技能目录必须包含：

```
skill-name/
└── SKILL.md              # 必需文件（唯一必需项）
```

### 可选目录

| 目录名称 | 用途 | 包含内容 |
|---------|------|---------|
| `scripts/` | 可执行脚本 | Python (.py)、Bash (.sh)、JavaScript (.js) 等脚本文件 |
| `references/` | 参考文档 | REFERENCE.md、FORMS.md、以及领域特定文档 |
| `assets/` | 静态资源 | 模板文件、图片资源、数据文件等 |

### 无效目录检测

如果发现其他目录名称，将产生警告：

```
⚠️ 发现未知的子目录 'docs'，可选目录为: scripts, references, assets
```

## YAML前置元数据规则

### name字段（必需）

#### 长度限制

- **最小长度**: 1字符
- **最大长度**: 64字符

#### 字符规则

**允许的字符**：

- 小写字母（a-z）
- 数字（0-9）
- 连字符（-）

**禁止的字符**：

- 大写字母（A-Z）
- 空格
- 下划线（_）
- 其他特殊字符

#### 格式规则

- 不能以连字符开头
- 不能以连字符结尾
- 不能包含连续连字符（--）

#### 匹配规则

`name`字段值必须与技能目录名称完全一致。

#### 验证示例

```yaml
# ✅ 正确示例
name: pdf-processing
name: data-analysis-v2
name: test123

# ❌ 错误示例
name: PDF-Processing     # 包含大写字母
name: -pdf               # 以连字符开头
name: pdf-               # 以连字符结尾
name: pdf--processing    # 包含连续连字符
name: pdf processing     # 包含空格
```

### description字段（必需）

#### 长度限制

- **最小长度**: 1字符
- **最大长度**: 1024字符

#### 内容要求

描述必须清晰说明：

1. 技能的主要功能
2. 适用场景
3. 关键词（帮助Agent识别何时使用）

#### 推荐格式

```yaml
description: |
  本技能用于[主要功能描述]。
  使用场景包括：[场景1]、[场景2]、[场景3]。
  当用户提及[关键词1]、[关键词2]时使用本技能。
```

#### 质量评估标准

| 质量等级 | 描述长度 | 评估结果 |
|---------|---------|---------|
| 优秀 | ≥100字符 | 功能描述完整，使用场景清晰，关键词丰富 |
| 良好 | 50-99字符 | 基本功能描述完整 |
| 合格 | 1-49字符 | 功能描述基本完整 |
| 不合格 | 0字符 | 缺少描述或为空 |

#### 验证示例

```yaml
# ✅ 良好示例
description: 从PDF文件中提取文本和表格，支持表单填写和文档合并。使用场景包括：处理PDF文档、自动化表单填写、多PDF合并等。当用户提及PDF、表单、文档时使用。

# ❌ 过短示例
description: Helps with PDFs.  # 仅23字符

# ❌ 空值示例
description: ""  # 空字符串
```

### license字段（可选）

#### 长度限制

- **最大长度**: 256字符

#### 格式要求

可以是：

- 许可证名称：`MIT`、`Apache-2.0`、`GPL-3.0`
- 许可证文件引用：`Proprietary. LICENSE.txt has complete terms`

#### 验证示例

```yaml
# ✅ 正确示例
license: MIT
license: Apache-2.0
license: Proprietary. LICENSE.txt has complete terms
```

### compatibility字段（可选）

#### 长度限制

- **最大长度**: 500字符

#### 用途说明

用于说明技能的环境要求：

- 目标产品（如Claude Code）
- 必需的操作系统包
- 网络访问需求
- 其他依赖条件

#### 验证示例

```yaml
# ✅ 正确示例
compatibility: Requires git, docker, jq, and access to the internet
compatibility: Designed for Claude Code (or similar products)
```

### metadata字段（可选）

#### 格式要求

必须是有效的YAML映射（字典）：

```yaml
metadata:
  author: example-org
  version: "1.0"
  tags: [pdf, document, extraction]
```

#### 限制

- 键名必须为字符串
- 值必须为字符串或字符串数组

### allowed-tools字段（可选）

#### 格式要求

必须是空格分隔的字符串列表：

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

## Markdown内容规则

### 基本要求

SKILL.md文件的Markdown内容部分应包含：

#### 推荐章节

1. **功能说明** - 技能的主要功能介绍
2. **使用场景** - 详细说明何时应该使用此技能
3. **使用方法** - 逐步使用指南
4. **示例** - 输入输出示例
5. **常见问题** - FAQ或注意事项

### 长度建议

| 内容类型 | 建议长度 |
|---------|---------|
| 最小内容 | 100字符以上 |
| 推荐内容 | 500-5000字符 |
| 最大内容 | 建议不超过5000字符（渐进式披露原则） |

### 渐进式披露原则

根据官方规范，技能内容应按以下层次组织：

1. **元数据**（~100 tokens）：`name`和`description`字段
2. **说明文档**（<5000 tokens）：完整的`SKILL.md`内容
3. **资源文件**（按需加载）：`scripts/`、`references/`、`assets/`中的文件

### 文件引用规则

引用其他文件时：

- 使用相对路径：`references/REFERENCE.md`
- 保持一级引用深度
- 避免深层嵌套引用链

## 错误严重程度分类

### 高优先级（错误）

以下问题标记为ERROR级别：

| 问题类型 | 说明 |
|---------|------|
| MISSING_FILE | 缺少必需的SKILL.md文件 |
| MISSING_YAML | 缺少YAML前置元数据 |
| MISSING_NAME | 缺少必需的name字段 |
| MISSING_DESCRIPTION | 缺少必需的description字段 |
| INVALID_NAME_TYPE | name字段类型错误 |
| INVALID_DESCRIPTION_TYPE | description字段类型错误 |
| NAME_LENGTH_INVALID | name字段长度超出限制 |
| NAME_MISMATCH | name与目录名不匹配 |
| INVALID_NAME_FORMAT | name字段包含非法字符 |
| CONSECUTIVE_HYPHENS | name字段包含连续连字符 |
| DESCRIPTION_TOO_SHORT | description字段过短 |
| DESCRIPTION_EMPTY | description字段为空 |
| YAML_PARSE_ERROR | YAML解析失败 |

### 中优先级（警告）

以下问题标记为WARNING级别：

| 问题类型 | 说明 |
|---------|------|
| INVALID_LICENSE_TYPE | license字段类型错误 |
| LICENSE_TOO_LONG | license字段超出长度限制 |
| INVALID_COMPATIBILITY_TYPE | compatibility字段类型错误 |
| COMPATIBILITY_TOO_LONG | compatibility字段超出长度限制 |
| INVALID_METADATA_TYPE | metadata字段类型错误 |
| INVALID_ALLOWED_TOOLS_TYPE | allowed-tools字段类型错误 |
| INVALID_SUBDIRECTORY | 发现未知子目录 |
| DESCRIPTION_TOO_LONG | description字段超出长度限制（在严格模式下） |
| DESCRIPTION_TOO_BRIEF | description字段过于简略（严格模式） |

### 低优先级（信息）

以下问题标记为INFO级别：

| 问题类型 | 说明 |
|---------|------|
| EMPTY_CONTENT | Markdown内容为空 |
| CONTENT_TOO_SHORT | Markdown内容较少（严格模式） |

## 验证流程图

```
开始验证
    ↓
检查目录是否存在？
    ├─ 否 → 报错：目录不存在
    └─ 是 ↓
遍历所有子目录
    ↓
每个子目录：
    ↓
SKILL.md是否存在？
    ├─ 否 → 添加MISSING_FILE错误
    └─ 是 ↓
解析YAML前置元数据
    ↓
YAML解析成功？
    ├─ 否 → 添加YAML_PARSE_ERROR错误
    └─ 是 ↓
验证name字段
    ↓
验证description字段
    ↓
验证可选字段（license、compatibility等）
    ↓
验证目录结构
    ↓
验证Markdown内容
    ↓
生成验证结果
    ↓
生成问题报告
    ↓
结束
```

## 常见修复指南

### 问题1: NAME_MISMATCH

**症状**:

```
name字段值 'mySkill' 与目录名称 'myskill' 不匹配
```

**原因**:

- YAML中name字段与目录名大小写不一致
- 之前重命名了目录但未更新name字段

**修复方案**:

```bash
# 方案1: 重命名目录以匹配name字段
mv myskill mySkill  # 如果目录名应该是 mySkill

# 方案2: 修改name字段以匹配目录名
# 编辑 SKILL.md，将 name: mySkill 改为 name: myskill
```

### 问题2: INVALID_NAME_FORMAT

**症状**:

```
name字段 'pdf_processing' 包含非法字符
```

**原因**:

- 使用了下划线而不是连字符

**修复方案**:

```yaml
# 修改前
name: pdf_processing

# 修改后
name: pdf-processing
```

### 问题3: DESCRIPTION_TOO_SHORT

**症状**:

```
description字段仅23字符，建议至少50字符
```

**修复方案**:

```yaml
# 修改前
description: Helps with PDFs.

# 修改后
description: 从PDF文件中提取文本和表格，支持表单填写和文档合并。使用场景包括：处理PDF文档、自动化表单填写、多PDF合并等。当用户提及PDF、表单、文档提取时使用本技能。
```

### 问题4: MISSING_YAML

**症状**:

```
SKILL.md缺少YAML前置元数据
```

**修复方案**:

```markdown
# 在SKILL.md文件开头添加：
---
name: your-skill-name
description: 本技能用于[具体功能]。当用户需要[使用场景]时使用。
---

# 以下是技能说明内容...
```
