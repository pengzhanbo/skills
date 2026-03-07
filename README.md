# Agent Skills

为 AI 编程助手提供可复用技能指令集，扩展其专业能力。

## 概述

Skills 是一套精心设计的技能包，为 AI 编程助手提供专业化的文档撰写能力。每个技能都定义在 `SKILL.md` 文件中，包含完整的指令集、工作流程和质量标准，帮助 AI 助手更高效地完成特定任务。

## 功能特性

### doc-writer

专业技术文档撰写者技能，提供以下能力：

- **文档撰写**：支持 API 文档、README、贡献指南、用户指南等多种文档类型
- **文档编辑**：更新和优化现有文档内容
- **文档审阅**：检查文档质量，识别问题和改进建议
- **质量保证**：内置完整的质量检查清单，确保文档准确、清晰、一致

### collaborative-doc-writer

协作式文档创建技能，提供结构化的三阶段工作流程：

- **背景收集阶段**：全面收集文档所需的背景信息
- **优化与结构阶段**：通过迭代式写作构建文档内容
- **读者测试阶段**：使用全新视角测试文档可读性

## 安装

使用 [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI 工具安装技能：

```bash
# 安装所有技能
npx skills add https://github.com/pengzhanbo/skills

# 安装特定技能
npx skills add https://github.com/pengzhanbo/skills --skill doc-writer

# 安装到全局目录
npx skills add https://github.com/pengzhanbo/skills -g
```

## 使用方法

### 安装后自动激活

技能安装后，当您向 AI 助手发出相关指令时会自动激活：

```txt
用户：帮我写一份 API 文档
```

此时 `doc-writer` 技能会自动激活，AI 助手将按照技能中定义的标准和流程撰写文档。

### 手动指定技能

您也可以明确指定使用某个技能：

```txt
用户：使用 collaborative-doc-writer 技能帮我创建一份产品需求文档
```

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 相关链接

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - Skills CLI 工具
- [skills.sh](https://skills.sh) - 发现更多技能
