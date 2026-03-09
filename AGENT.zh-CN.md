# Agent 操作规范

本文档定义了 AI agent 在此技能仓库中工作的操作规范和工作流程。所有 agent 在创建、更新或管理技能时必须严格遵循本规范。

---

## 概述

本仓库是 AI 编码助手可复用技能指令集的集合。每个技能定义在 `SKILL.md` 文件中，包含完整的指令集、工作流程和质量标准。Agent 使用 `skill-creator` 工具来添加或更新技能。

---

## 1. 技能创建与更新规范

### 1.1 语言优先级

所有新建或更新的技能必须**首先以英文**开发和输出。

- 英文是所有技能内容的主要语言
- 英文技能文件作为翻译的权威来源
- 所有技术术语、描述和说明在本地化之前必须在英文版本中完整

### 1.2 文件位置与命名

英文技能文件必须保存到 `skills/` 目录，遵循以下约定：

```
skills/
├── skill-name/
│   └── SKILL.md
```

**命名规范**：

- 使用小写字母加连字符（kebab-case）：`doc-writer`、`code-commentator`
- 名称应具有描述性且简洁
- 避免使用缩写，除非广泛认可
- 每个技能必须有独立的目录

### 1.3 文件格式与结构

技能文件必须与仓库中现有技能保持一致。每个 `SKILL.md` 文件必须包含：

**Frontmatter（YAML）**：

```yaml
---
name: skill-name
description: 技能用途和触发条件的简要描述
license: MIT
metadata:
  version: "1.0.0"
---
```

**内容结构**：

1. **标题**：技能名称作为主标题
2. **简介**：技能的简要概述
3. **触发条件**：何时激活此技能
4. **阶段/章节**：按工作流程阶段组织的详细说明
5. **质量检查清单**：自检项目
6. **示例**：如适用，提供工作流程示例
7. **注意事项**：重要说明

---

## 2. 本地化与翻译要求

### 2.1 翻译时机

完成英文技能创建或更新后，agent **必须立即将其翻译**为简体中文。

- 不要延迟翻译
- 翻译是必选步骤，不可跳过
- 两个版本必须一起提交

### 2.2 中文文件位置

中文翻译必须保存到 `skills_zh-CN/` 目录：

```
skills_zh-CN/
├── skill-name/
│   └── SKILL.md
```

**要求**：

- 目录名必须与英文版本完全一致
- 文件名必须为 `SKILL.md`（与英文版本相同）
- 保持与 `skills/` 相同的目录结构

### 2.3 翻译质量标准

翻译必须准确反映原始英文内容：

| 方面 | 要求 |
|------|------|
| **准确性** | 忠实于原文含义 |
| **术语** | 使用行业通用的中文译法 |
| **一致性** | 相同术语必须翻译一致 |
| **完整性** | 所有章节都必须翻译，包括 frontmatter |
| **格式** | 保持相同的 markdown 结构 |

**常用术语翻译**：

| 英文 | 中文 |
|------|------|
| skill | 技能 |
| trigger conditions | 触发条件 |
| workflow | 工作流程 |
| checklist | 检查清单 |
| phase | 阶段 |
| documentation | 文档 |

**特别说明**：

- 保持代码示例不变（不翻译代码）
- 保持 URL、文件路径和命令示例不变
- 中文文本使用中文标点（使用 `“”` 而非 `""`，使用 `。` 而非 `.`）

---

## 3. 文档更新要求

### 3.1 README 更新触发

每次技能创建或更新后，agent **必须同步更新** README.md 文件。

### 3.2 README 更新内容

更新必须包括：

1. **特性章节**：添加或更新技能描述
2. **能力列表**：列出主要功能/能力
3. **使用示例**：如何使用该技能
4. **链接**：相关链接（如适用）

### 3.3 README 更新格式

遵循现有 README 结构：

```markdown
### skill-name

技能的简要描述，提供以下能力：

- **能力 1**：描述
- **能力 2**：描述
- **能力 3**：描述
```

### 3.4 双语 README 更新

两个 README 文件都必须更新：

- `README.md`（英文版本）
- `README.zh-CN.md`（中文版本）

确保两个版本包含等效的信息。

### 3.5 统计与列表

维护准确的技能数量和分类：

- 如有变化，更新技能总数
- 确保技能列表按字母顺序排列
- 验证所有链接指向正确位置

---

## 4. 版本控制与提交规范

### 4.1 提交信息格式

使用标准化的提交信息，遵循以下模式：

| 类型 | 格式 | 示例 |
|------|------|------|
| 新技能 | `feat: add [skill-name] skill` | `feat: add code-commentator skill` |
| 更新技能 | `update: improve [skill-name] skill` | `update: improve doc-writer skill` |
| 修复技能 | `fix: correct [skill-name] description` | `fix: correct i18n-doc-translator description` |
| 文档 | `docs: update README for [skill-name]` | `docs: update README for doc-writer` |

### 4.2 提交范围

每次提交应包括：

1. 英文技能文件（`skills/skill-name/SKILL.md`）
2. 中文技能文件（`skills_zh-CN/skill-name/SKILL.md`）
3. 更新的 README 文件（`README.md`、`README.zh-CN.md`）

**示例**：

```bash
git add skills/new-skill/SKILL.md
git add skills_zh-CN/new-skill/SKILL.md
git add README.md README.zh-CN.md
git commit -m "feat: add new-skill skill"
```

### 4.3 提交时机

- 完成所有相关更改后提交
- 不要提交部分更改
- 提交前验证所有文件都已包含

---

## 5. 操作工作流程

### 5.1 完整工作流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                    技能创建工作流程                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  步骤 1：创建英文技能                                           │
│  ─────────────────────────────                                  │
│  • 使用 skill-creator 工具                                      │
│  • 以英文开发内容                                               │
│  • 遵循现有技能格式                                             │
│  • 保存至 skills/skill-name/SKILL.md                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  步骤 2：翻译为中文                                             │
│  ─────────────────────────────                                  │
│  • 将所有内容翻译为简体中文                                     │
│  • 保持相同的结构                                               │
│  • 使用行业通用术语                                             │
│  • 保存至 skills_zh-CN/skill-name/SKILL.md                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  步骤 3：更新文档                                               │
│  ─────────────────────────────                                  │
│  • 更新 README.md（英文）                                       │
│  • 更新 README.zh-CN.md（中文）                                 │
│  • 添加技能描述和功能                                           │
│  • 验证链接和统计信息                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  步骤 4：质量验证                                               │
│  ─────────────────────────────                                  │
│  • 运行 pnpm lint                                               │
│  • 验证文件结构                                                 │
│  • 检查翻译完整性                                               │
│  • 验证 README 一致性                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  步骤 5：提交变更                                               │
│  ─────────────────────────────                                  │
│  • 暂存所有相关文件                                             │
│  • 使用标准化提交信息                                           │
│  • 验证提交包含所有更改                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 分步说明

#### 步骤 1：创建英文技能

1. 使用 Skill 工具调用 `skill-creator` 技能
2. 按以下指南开发技能内容：
   - 定义清晰的触发条件
   - 按逻辑阶段组织内容
   - 包含实际示例
   - 添加质量检查清单
3. 将文件保存至 `skills/[skill-name]/SKILL.md`
4. 确保 frontmatter 包含：name、description、license、metadata.version

#### 步骤 2：翻译为中文

1. 完整阅读英文技能文件
2. 翻译所有内容，保持：
   - 相同的 markdown 结构
   - 相同的标题层级
   - 等效的代码示例（保持不变）
   - 翻译后的 frontmatter
3. 保存至 `skills_zh-CN/[skill-name]/SKILL.md`
4. 按标准验证翻译质量

#### 步骤 3：更新文档

1. 阅读当前 README.md 和 README.zh-CN.md
2. 按字母顺序添加新技能章节
3. 包含：
   - 技能名称作为子标题
   - 简要描述
   - 能力列表
4. 如适用，更新技能数量
5. 验证所有内部链接

#### 步骤 4：质量验证

1. 运行 `pnpm lint` 检查格式
2. 验证目录结构：
   ```
   skills/
   └── [skill-name]/
       └── SKILL.md
   skills_zh-CN/
   └── [skill-name]/
       └── SKILL.md
   ```
3. 检查翻译完整性
4. 验证 README 一致性

#### 步骤 5：提交变更

1. 暂存所有文件：
   ```bash
   git add skills/[skill-name]/SKILL.md
   git add skills_zh-CN/[skill-name]/SKILL.md
   git add README.md README.zh-CN.md
   ```
2. 使用标准化信息提交：
   ```bash
   git commit -m "feat: add [skill-name] skill"
   ```

---

## 6. 质量检查清单

完成任何技能操作前，验证：

### 文件结构

- [ ] 英文技能文件存在于 `skills/[skill-name]/SKILL.md`
- [ ] 中文技能文件存在于 `skills_zh-CN/[skill-name]/SKILL.md`
- [ ] 两个文件的目录名相同
- [ ] 两个文件都命名为 `SKILL.md`

### 内容质量

- [ ] 英文内容完整准确
- [ ] 中文翻译准确完整
- [ ] 两个文件都有 frontmatter
- [ ] 两个文件的版本号一致

### 文档

- [ ] README.md 已更新新技能
- [ ] README.zh-CN.md 已更新新技能
- [ ] 技能描述一致
- [ ] 链接有效

### 代码质量

- [ ] `pnpm lint` 通过无错误
- [ ] Markdown 格式一致
- [ ] 无损坏链接

### 提交

- [ ] 所有相关文件已暂存
- [ ] 提交信息遵循标准格式
- [ ] 提交包含两个语言版本

---

## 7. 常见场景

### 场景一：创建新技能

```
用户：创建一个 API 测试技能

Agent 操作：
1. 调用 skill-creator
2. 创建 skills/api-testing/SKILL.md（英文）
3. 创建 skills_zh-CN/api-testing/SKILL.md（中文）
4. 更新 README.md
5. 更新 README.zh-CN.md
6. 运行 pnpm lint
7. 提交："feat: add api-testing skill"
```

### 场景二：更新现有技能

```
用户：给 doc-writer 技能添加错误处理章节

Agent 操作：
1. 阅读 skills/doc-writer/SKILL.md
2. 更新 skills/doc-writer/SKILL.md（英文）
3. 更新 skills_zh-CN/doc-writer/SKILL.md（中文）
4. 如描述有变化，更新 README.md
5. 如描述有变化，更新 README.zh-CN.md
6. 运行 pnpm lint
7. 提交："update: improve doc-writer skill"
```

### 场景三：修复翻译错误

```
用户：修复 code-commentator 的中文翻译

Agent 操作：
1. 阅读 skills/code-commentator/SKILL.md（英文）
2. 阅读 skills_zh-CN/code-commentator/SKILL.md（中文）
3. 识别并修复翻译错误
4. 验证与英文版本一致
5. 运行 pnpm lint
6. 提交："fix: correct code-commentator Chinese translation"
```

---

## 8. 错误处理

### 缺失中文翻译

如果技能存在英文版本但没有中文版本：

1. 立即创建中文翻译
2. 确保与英文版本匹配
3. 如需要，更新 README.zh-CN.md
4. 提交信息：`fix: add missing Chinese translation for [skill-name]`

### README 不同步

如果 README 文件与技能不同步：

1. 审计 `skills/` 目录中的所有技能
2. 验证每个技能在 README.md 中有条目
3. 验证每个技能在 README.zh-CN.md 中有条目
4. 更新统计和描述
5. 提交信息：`docs: sync README with current skills`

### 格式错误

如果 `pnpm lint` 报告错误：

1. 仔细阅读错误信息
2. 修复受影响文件的格式问题
3. 重新运行 `pnpm lint` 验证
4. 提交修复：`style: fix formatting in [file-names]`

---

## 9. 参考

### 目录结构

```
skills/
├── skills/
│   ├── code-commentator/
│   │   └── SKILL.md
│   ├── collaborative-doc-writer/
│   │   └── SKILL.md
│   ├── doc-writer/
│   │   └── SKILL.md
│   └── i18n-doc-translator/
│       └── SKILL.md
├── skills_zh-CN/
│   ├── code-commentator/
│   │   └── SKILL.md
│   ├── collaborative-doc-writer/
│   │   └── SKILL.md
│   ├── doc-writer/
│   │   └── SKILL.md
│   └── i18n-doc-translator/
│       └── SKILL.md
├── LICENSE
├── README.md
├── README.zh-CN.md
└── AGENT.md
```

### 相关工具

- **skill-creator**：用于创建或更新技能
- **find-skills**：用于发现可用技能

### 相关文档

- [README.md](./README.md) - 项目概述和技能列表
- [README.zh-CN.md](./README.zh-CN.md) - 中文项目概述
- [LICENSE](./LICENSE) - MIT 许可证

---

## 10. 总结

| 阶段 | 操作 | 输出 |
|------|------|------|
| 创建 | 开发英文技能 | `skills/[name]/SKILL.md` |
| 翻译 | 创建中文版本 | `skills_zh-CN/[name]/SKILL.md` |
| 文档 | 更新 README | `README.md`、`README.zh-CN.md` |
| 验证 | 运行质量检查 | Lint 通过，结构正确 |
| 提交 | 提交变更 | 标准化提交信息 |

**请记住**：每次技能操作必须完成所有五个阶段。部分完成是不可接受的。
