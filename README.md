# Agent Skills

[简体中文](./README.zh-CN.md) | English

Reusable skill instruction sets for AI coding assistants to extend their professional capabilities.

## Overview

Skills is a carefully designed skill package collection. Each skill is defined in a `SKILL.md` file, containing complete instruction sets, workflows, and quality standards to help AI assistants complete specific tasks more efficiently.

## Features

### doc-writer

Professional technical document writer skill, providing the following capabilities:

- **Document Writing**: Supports various document types including API documentation, README, contribution guidelines, user guides, and more
- **Document Editing**: Update and optimize existing document content
- **Document Review**: Check document quality, identify issues and improvement suggestions
- **Quality Assurance**: Built-in complete quality checklists to ensure documents are accurate, clear, and consistent

### collaborative-doc-writer

Collaborative document creation skill, providing a structured three-phase workflow:

- **Background Collection Phase**: Comprehensively collect background information needed for documents
- **Optimization and Structure Phase**: Build document content through iterative writing
- **Reader Testing Phase**: Test document readability using a fresh perspective

### code-commentator

Code annotation supplementation and standardization expert, providing the following capabilities:

- **Automatic Language Detection**: Supports multiple programming languages including JavaScript, TypeScript, Python, Java, Go, Rust, and more
- **Bilingual Comments**: All comments include both Chinese and English descriptions
- **Standardized Format**: Automatically applies language-specific comment styles (JSDoc, docstring, etc.)
- **Completeness Guarantee**: Add complete comments for functions, classes, properties, enums, and other code elements

### i18n-doc-translator

Professional multilingual documentation translator for projects, providing the following capabilities:

- **Configuration Detection**: Automatically detect documentation tool configurations for VitePress, Hugo, Jekyll, Hexo, Docusaurus, and more
- **Structure Synchronization**: Automatically create directory structure consistent with source language
- **High-Quality Translation**: Follow "faithfulness, expressiveness, and elegance" translation standards, preserving technical terms and code examples
- **Incremental Updates**: Intelligently identify translations that need updating based on file modification times

## Installation

Install skills using the [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI tool:

```bash
# Install all skills
npx skills add https://github.com/pengzhanbo/skills

# Install a specific skill
npx skills add https://github.com/pengzhanbo/skills --skill doc-writer

# Install to global directory
npx skills add https://github.com/pengzhanbo/skills -g
```

## Usage

### Automatic Activation After Installation

After skills are installed, they will automatically activate when you issue relevant commands to the AI assistant:

```txt
User: Help me write API documentation
```

At this point, the `doc-writer` skill will automatically activate, and the AI assistant will write documentation following the standards and workflows defined in the skill.

### Manual Skill Specification

You can also explicitly specify which skill to use:

```txt
User: Use the collaborative-doc-writer skill to help me create a product requirements document
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Related Links

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - Skills CLI tool
- [skills.sh](https://skills.sh) - Discover more skills
