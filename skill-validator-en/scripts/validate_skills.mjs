#!/usr/bin/env node
/**
 * AI Agent 技能规范验证器（JavaScript版本）
 * 
 * 自动验证AI Agent技能是否符合官方编写规范，
 * 生成详细的Markdown格式问题报告和改进建议。
 * 
 * 使用方式:
 *   node validate_skills.mjs ./skills [选项]
 *   node validate_skills.mjs ./skills/pdf-processing [选项]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Severity {
    static ERROR = new Severity('错误', 'ERROR');
    static WARNING = new Severity('警告', 'WARNING');
    static INFO = new Severity('信息', 'INFO');
    
    constructor(label, key) {
        this.label = label;
        this.key = key;
    }
    
    toString() {
        return this.label;
    }
}

class ValidationIssue {
    constructor(skillName, filePath, issueType, description, severity, fixSuggestion, lineNumber = null) {
        this.skillName = skillName;
        this.filePath = filePath;
        this.issueType = issueType;
        this.description = description;
        this.severity = severity;
        this.fixSuggestion = fixSuggestion;
        this.lineNumber = lineNumber;
    }
}

class SkillValidationResult {
    constructor(skillName, skillPath) {
        this.skillName = skillName;
        this.skillPath = skillPath;
        this.issues = [];
        this.passed = true;
    }
    
    get errorCount() {
        return this.issues.filter(i => i.severity === Severity.ERROR).length;
    }
    
    get warningCount() {
        return this.issues.filter(i => i.severity === Severity.WARNING).length;
    }
}

class SkillValidator {
    constructor(options = {}) {
        this.strictMode = options.strictMode || false;
        this.interactive = options.interactive || false;
        this.allResults = [];
        
        this.VALID_NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
        this.MAX_NAME_LENGTH = 64;
        this.MIN_NAME_LENGTH = 1;
        this.MAX_DESCRIPTION_LENGTH = 1024;
        this.MIN_DESCRIPTION_LENGTH = 1;
        this.MAX_LICENSE_LENGTH = 256;
        this.MAX_COMPATIBILITY_LENGTH = 500;
    }
    
    async validateDirectory(skillsPath) {
        const skillsDir = path.resolve(skillsPath);
        
        if (!fs.existsSync(skillsPath)) {
            throw new Error(`目录不存在: ${skillsPath}`);
        }
        
        const results = [];
        const stats = fs.statSync(skillsPath);
        
        if (stats.isFile()) {
            throw new Error(`路径是文件而非目录: ${skillsPath}`);
        }
        
        const skillMdPath = path.join(skillsPath, 'SKILL.md');
        if (fs.existsSync(skillMdPath)) {
            const result = await this.validateSkill(skillsPath);
            results.push(result);
            this.allResults.push(result);
        } else {
            const entries = fs.readdirSync(skillsPath, { withFileTypes: true });
            for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
                if (entry.isDirectory()) {
                    const result = await this.validateSkill(path.join(skillsPath, entry.name));
                    results.push(result);
                    this.allResults.push(result);
                }
            }
        }
        
        return results;
    }
    
    async validateSkill(skillPath) {
        const skillName = path.basename(skillPath);
        const result = new SkillValidationResult(skillName, skillPath);
        
        const skillMdPath = path.join(skillPath, 'SKILL.md');
        
        if (!fs.existsSync(skillMdPath)) {
            result.issues.push(new ValidationIssue(
                skillName,
                skillMdPath,
                'MISSING_FILE',
                '技能目录中缺少必需的SKILL.md文件',
                Severity.ERROR,
                `在 ${skillPath} 目录下创建SKILL.md文件，包含YAML前置元数据和技能说明文档。`
            ));
            result.passed = false;
            return result;
        }
        
        try {
            const content = fs.readFileSync(skillMdPath, 'utf-8');
            const { yamlContent, markdownContent } = this.parseSkillMd(content, skillMdPath);
            
            this.validateYamlFrontmatter(skillName, yamlContent, skillMdPath, result);
            this.validateDirectoryStructure(skillPath, skillName, result);
            this.validateMarkdownContent(markdownContent, skillName, skillMdPath, result);
            
        } catch (e) {
            if (e.message.includes('YAML')) {
                result.issues.push(new ValidationIssue(
                    skillName,
                    skillMdPath,
                    'YAML_PARSE_ERROR',
                    `YAML解析错误: ${e.message}`,
                    Severity.ERROR,
                    '检查SKILL.md中的YAML前置元数据语法，确保格式正确。'
                ));
            } else {
                result.issues.push(new ValidationIssue(
                    skillName,
                    skillMdPath,
                    'READ_ERROR',
                    `读取文件时发生错误: ${e.message}`,
                    Severity.ERROR,
                    '确保文件权限正确，文件未被其他程序锁定。'
                ));
            }
            result.passed = false;
        }
        
        return result;
    }
    
    parseSkillMd(content, filePath) {
        const yamlPattern = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(yamlPattern);
        
        if (match) {
            const yamlText = match[1];
            const markdownContent = match[2];
            try {
                const yamlData = this.parseYaml(yamlText);
                return { yamlContent: yamlData || {}, markdownContent };
            } catch (e) {
                return { yamlContent: null, markdownContent: content };
            }
        }
        return { yamlContent: null, markdownContent: content };
    }
    
    parseYaml(yamlText) {
        const lines = yamlText.split('\n');
        const result = {};
        let i = 0;
        
        const parseBlock = (lines, startIndex, baseIndent = -1) => {
            const obj = {};
            i = startIndex;
            
            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();
                const indent = line.search(/\S/);
                
                if (!trimmed || trimmed.startsWith('#')) {
                    i++;
                    continue;
                }
                
                if (baseIndent >= 0 && indent <= baseIndent && trimmed) {
                    break;
                }
                
                if (trimmed.startsWith('- ')) {
                    if (!Array.isArray(obj._list)) {
                        obj._list = [];
                    }
                    obj._list.push(trimmed.substring(2).trim());
                    i++;
                    continue;
                }
                
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex > 0) {
                    const key = trimmed.substring(0, colonIndex).trim();
                    const valuePart = trimmed.substring(colonIndex + 1).trim();
                    
                    if (valuePart === '' || valuePart === '|' || valuePart === '|-') {
                        const nestedStart = i + 1;
                        const nestedResult = parseBlock(lines, nestedStart, indent);
                        if (Object.keys(nestedResult).length > 0) {
                            obj[key] = nestedResult;
                        } else {
                            obj[key] = '';
                        }
                        i = nestedResult._endIndex + 1 || i;
                    } else if (valuePart.startsWith('[') && valuePart.endsWith(']')) {
                        obj[key] = this.parseInlineList(valuePart);
                        i++;
                    } else if (valuePart.startsWith('"') && valuePart.endsWith('"')) {
                        obj[key] = valuePart.substring(1, valuePart.length - 1);
                        i++;
                    } else if (valuePart.startsWith("'") && valuePart.endsWith("'")) {
                        obj[key] = valuePart.substring(1, valuePart.length - 1);
                        i++;
                    } else {
                        obj[key] = valuePart;
                        i++;
                    }
                } else {
                    i++;
                }
            }
            
            obj._endIndex = i - 1;
            return obj;
        };
        
        const parsed = parseBlock(lines, 0, -1);
        
        for (const [key, value] of Object.entries(parsed)) {
            if (key !== '_list' && key !== '_endIndex') {
                result[key] = value;
            }
        }
        
        if (parsed._list && parsed._list.length > 0) {
             return parsed._list.length === 1 ? parsed._list[0] : parsed._list;
         }
         
         return result;
    }
    
    parseInlineList(str) {
        const content = str.substring(1, str.length - 1).trim();
        if (!content) return [];
        return content.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
    }
    
    validateYamlFrontmatter(dirName, yamlData, filePath, result) {
        const skillName = result.skillName;
        
        if (yamlData === null) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'MISSING_YAML',
                'SKILL.md缺少YAML前置元数据（---分隔符）',
                Severity.ERROR,
                '在SKILL.md文件开头添加YAML前置元数据：\n---\nname: skill-name\ndescription: 技能描述\n---'
            ));
            result.passed = false;
            return;
        }
        
        this.validateNameField(skillName, yamlData, filePath, result);
        this.validateDescriptionField(skillName, yamlData, filePath, result);
        this.validateLicenseField(skillName, yamlData, filePath, result);
        this.validateCompatibilityField(skillName, yamlData, filePath, result);
        this.validateMetadataField(skillName, yamlData, filePath, result);
        this.validateAllowedToolsField(skillName, yamlData, filePath, result);
    }
    
    validateNameField(skillName, yamlData, filePath, result) {
        if (!('name' in yamlData)) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'MISSING_NAME',
                'YAML前置元数据中缺少必需的name字段',
                Severity.ERROR,
                '添加name字段：\n---\nname: your-skill-name\ndescription: 技能描述\n---'
            ));
            result.passed = false;
            return;
        }
        
        const name = yamlData.name;
        
        if (typeof name !== 'string') {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'INVALID_NAME_TYPE',
                'name字段必须是字符串类型',
                Severity.ERROR,
                '将name值改为字符串格式，如：name: pdf-processing'
            ));
            result.passed = false;
            return;
        }
        
        if (name.length < this.MIN_NAME_LENGTH || name.length > this.MAX_NAME_LENGTH) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'NAME_LENGTH_INVALID',
                `name字段长度必须为1-64字符，当前长度为${name.length}`,
                Severity.ERROR,
                '将name长度调整至1-64字符范围内'
            ));
            result.passed = false;
        }
        
        if (name !== skillName) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'NAME_MISMATCH',
                `name字段值 '${name}' 与目录名称 '${skillName}' 不匹配`,
                Severity.ERROR,
                `将name字段改为 '${skillName}'，或将目录重命名为 '${name}'`
            ));
            result.passed = false;
        }
        
        if (!this.VALID_NAME_PATTERN.test(name)) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'INVALID_NAME_FORMAT',
                `name字段 '${name}' 包含非法字符，仅允许小写字母、数字和连字符`,
                Severity.ERROR,
                '使用小写字母、数字和连字符，例如：pdf-processing、data-analysis-v2'
            ));
            result.passed = false;
        }
        
        if (name.includes('--')) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'CONSECUTIVE_HYPHENS',
                `name字段 '${name}' 包含连续连字符`,
                Severity.ERROR,
                "移除连续连字符，例如：将 'pdf--processing' 改为 'pdf-processing'"
            ));
            result.passed = false;
        }
    }
    
    validateDescriptionField(skillName, yamlData, filePath, result) {
        if (!('description' in yamlData)) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'MISSING_DESCRIPTION',
                'YAML前置元数据中缺少必需的description字段',
                Severity.ERROR,
                '添加description字段：\n---\nname: skill-name\ndescription: 本技能用于[具体功能]。当用户需要[使用场景]时使用。\n---'
            ));
            result.passed = false;
            return;
        }
        
        const description = yamlData.description;
        
        if (typeof description !== 'string') {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'INVALID_DESCRIPTION_TYPE',
                'description字段必须是字符串类型',
                Severity.ERROR,
                '将description值改为字符串格式'
            ));
            result.passed = false;
            return;
        }
        
        const descLength = description.length;
        
        if (descLength < this.MIN_DESCRIPTION_LENGTH) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'DESCRIPTION_TOO_SHORT',
                `description字段长度为${descLength}，必须至少为1字符`,
                Severity.ERROR,
                '扩展description字段，提供更详细的技能功能说明'
            ));
            result.passed = false;
        }
        
        if (descLength > this.MAX_DESCRIPTION_LENGTH) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'DESCRIPTION_TOO_LONG',
                `description字段长度为${descLength}，超过1024字符限制`,
                this.strictMode ? Severity.ERROR : Severity.WARNING,
                '精简description字段，控制在1024字符以内'
            ));
            if (this.strictMode) result.passed = false;
        }
        
        if (this.strictMode && descLength < 50) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'DESCRIPTION_TOO_BRIEF',
                `description字段仅${descLength}字符，建议扩展至至少50字符以提供清晰说明`,
                Severity.WARNING,
                '建议的description格式：\ndescription: |-\n  本技能用于[主要功能]。\n  使用场景包括：[场景1]、[场景2]。\n  当用户提及[关键词]时使用。'
            ));
        }
        
        if (!description.trim()) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'DESCRIPTION_EMPTY',
                'description字段为空或仅包含空白字符',
                Severity.ERROR,
                '提供非空的技能描述'
            ));
            result.passed = false;
        }
    }
    
    validateLicenseField(skillName, yamlData, filePath, result) {
        if (!('license' in yamlData)) return;
        
        const licenseValue = yamlData.license;
        
        if (typeof licenseValue !== 'string') {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'INVALID_LICENSE_TYPE',
                'license字段必须是字符串类型',
                Severity.WARNING,
                '将license值改为字符串格式，如：license: MIT'
            ));
            return;
        }
        
        if (licenseValue.length > this.MAX_LICENSE_LENGTH) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'LICENSE_TOO_LONG',
                `license字段超过${this.MAX_LICENSE_LENGTH}字符限制`,
                Severity.WARNING,
                '建议使用简短的许可证名称，如：MIT、Apache-2.0、GPL-3.0'
            ));
        }
    }
    
    validateCompatibilityField(skillName, yamlData, filePath, result) {
        if (!('compatibility' in yamlData)) return;
        
        const compatibility = yamlData.compatibility;
        
        if (typeof compatibility !== 'string') {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'INVALID_COMPATIBILITY_TYPE',
                'compatibility字段必须是字符串类型',
                Severity.WARNING,
                '将compatibility值改为字符串格式'
            ));
            return;
        }
        
        if (compatibility.length > this.MAX_COMPATIBILITY_LENGTH) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'COMPATIBILITY_TOO_LONG',
                `compatibility字段超过${this.MAX_COMPATIBILITY_LENGTH}字符限制`,
                Severity.WARNING,
                '精简compatibility描述，控制在500字符以内'
            ));
        }
    }
    
    validateMetadataField(skillName, yamlData, filePath, result) {
        if (!('metadata' in yamlData)) return;
        
        const metadata = yamlData.metadata;
        
        if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'INVALID_METADATA_TYPE',
                'metadata字段必须是映射类型（字典）',
                Severity.WARNING,
                '将metadata改为字典格式：\nmetadata:\n  author: name\n  version: "1.0"'
            ));
            return;
        }
    }
    
    validateAllowedToolsField(skillName, yamlData, filePath, result) {
        if (!('allowed-tools' in yamlData)) return;
        
        const allowedTools = yamlData['allowed-tools'];
        
        if (typeof allowedTools !== 'string') {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'INVALID_ALLOWED_TOOLS_TYPE',
                'allowed-tools字段必须是空格分隔的字符串',
                Severity.WARNING,
                '将allowed-tools改为字符串格式：\nallowed-tools: Bash(git:*) Read'
            ));
        }
    }
    
    validateDirectoryStructure(skillPath, skillName, result) {
        const validSubdirs = ['scripts', 'references', 'assets'];
        
        if (!fs.existsSync(skillPath)) return;
        
        const entries = fs.readdirSync(skillPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (!validSubdirs.includes(entry.name)) {
                    result.issues.push(new ValidationIssue(
                        skillName,
                        path.join(skillPath, entry.name),
                        'INVALID_SUBDIRECTORY',
                        `发现未知的子目录 '${entry.name}'，可选目录为: scripts, references, assets`,
                        Severity.WARNING,
                        `将 '${entry.name}' 移至有效的子目录之一，或根据需要创建标准子目录`
                    ));
                }
            }
        }
    }
    
    validateMarkdownContent(markdownContent, skillName, filePath, result) {
        if (!markdownContent || !markdownContent.trim()) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'EMPTY_CONTENT',
                'SKILL.md缺少Markdown内容',
                this.strictMode ? Severity.WARNING : Severity.INFO,
                '添加技能说明、使用示例、使用场景等Markdown内容'
            ));
            return;
        }
        
        if (this.strictMode && markdownContent.trim().length < 100) {
            result.issues.push(new ValidationIssue(
                skillName,
                filePath,
                'CONTENT_TOO_SHORT',
                'Markdown内容较少，建议提供更详细的使用说明',
                Severity.INFO,
                '建议包含：功能说明、使用方法、示例代码、常见问题等章节'
            ));
        }
    }
    
    generateReport(results, outputFormat = 'markdown') {
        const timestamp = new Date().toLocaleString('zh-CN');
        
        const totalSkills = results.length;
        const passedSkills = results.filter(r => r.passed).length;
        const failedSkills = totalSkills - passedSkills;
        const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
        const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
        
        if (outputFormat === 'markdown') {
            return this.generateMarkdownReport(
                results, timestamp, totalSkills, passedSkills,
                failedSkills, totalErrors, totalWarnings
            );
        } else if (outputFormat === 'json') {
            return this.generateJsonReport(results, timestamp);
        } else {
            return this.generateTextReport(results, timestamp);
        }
    }
    
    generateMarkdownReport(results, timestamp, totalSkills, passedSkills,
                          failedSkills, totalErrors, totalWarnings) {
        const uniquePaths = [...new Set(results.map(r => r.skillPath))];
        let report = `# AI Agent 技能规范验证报告

**生成时间**: ${timestamp}
**验证范围**: ${uniquePaths.join(', ')}

## 验证摘要

| 指标 | 数值 |
|------|------|
| 总计技能 | ${totalSkills} |
| 通过验证 | ${passedSkills} |
| 存在问题 | ${failedSkills} |
| 错误数 | ${totalErrors} |
| 警告数 | ${totalWarnings} |

## 验证统计

| 技能名称 | 状态 | 错误 | 警告 |
|---------|------|------|------|
`;
        
        results.sort((a, b) => {
            if (a.errorCount !== b.errorCount) return b.errorCount - a.errorCount;
            return b.warningCount - a.warningCount;
        });
        
        for (const result of results) {
            const status = result.passed ? '✅ 通过' : '❌ 未通过';
            report += `| ${result.skillName} | ${status} | ${result.errorCount} | ${result.warningCount} |\n`;
        }
        
        const errorResults = results.filter(r => r.issues.length > 0);
        
        if (errorResults.length > 0) {
            report += '\n## 详细问题清单\n\n';
            
            const errorIssues = results.flatMap(r => r.issues.filter(i => i.severity === Severity.ERROR));
            const warningIssues = results.flatMap(r => r.issues.filter(i => i.severity === Severity.WARNING));
            
            if (errorIssues.length > 0) {
                report += '### ❌ 错误\n\n';
                errorIssues.forEach((issue, idx) => {
                    const issueTitle = issue.issueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    report += `#### ${idx + 1}. ${issueTitle}

- **技能名称**: \`${issue.skillName}\`
- **文件路径**: \`${issue.filePath}\`
- **问题描述**: ${issue.description}
- **严重程度**: ${issue.severity.toString()}
- **修复建议**: 
${this.indentText(issue.fixSuggestion, 6)}

`;
                });
            }
            
            if (warningIssues.length > 0) {
                report += '### ⚠️ 警告\n\n';
                warningIssues.forEach((issue, idx) => {
                    const issueTitle = issue.issueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    report += `#### ${idx + 1}. ${issueTitle}

- **技能名称**: \`${issue.skillName}\`
- **文件路径**: \`${issue.filePath}\`
- **问题描述**: ${issue.description}
- **严重程度**: ${issue.severity.toString()}
- **修复建议**: 
${this.indentText(issue.fixSuggestion, 6)}

`;
                });
            }
        }
        
        if (!errorResults.length) {
            report += '\n## ✅ 所有技能均通过验证\n\n没有发现任何问题，所有技能都符合官方编写规范。';
        }
        
        return report;
    }
    
    generateJsonReport(results, timestamp) {
        const report = {
            timestamp,
            summary: {
                total_skills: results.length,
                passed: results.filter(r => r.passed).length,
                failed: results.filter(r => !r.passed).length,
                total_errors: results.reduce((sum, r) => sum + r.errorCount, 0),
                total_warnings: results.reduce((sum, r) => sum + r.warningCount, 0)
            },
            results: results.map(result => ({
                skill_name: result.skillName,
                skill_path: result.skillPath,
                passed: result.passed,
                issues_count: {
                    error: result.errorCount,
                    warning: result.warningCount
                },
                issues: result.issues.map(issue => ({
                    type: issue.issueType,
                    file_path: issue.filePath,
                    description: issue.description,
                    severity: issue.severity.key,
                    fix_suggestion: issue.fixSuggestion
                }))
            }))
        };
        
        return JSON.stringify(report, null, 2);
    }
    
    generateTextReport(results, timestamp) {
        let report = `AI Agent 技能规范验证报告
${'='.repeat(50)}
生成时间: ${timestamp}

验证摘要:
  总计技能: ${results.length}
  通过验证: ${results.filter(r => r.passed).length}
  存在问题: ${results.filter(r => !r.passed).length}
  错误数: ${results.reduce((sum, r) => sum + r.errorCount, 0)}
  警告数: ${results.reduce((sum, r) => sum + r.warningCount, 0)}

详细问题:
`;
        
        results.sort((a, b) => b.errorCount - a.errorCount);
        
        for (const result of results) {
            if (!result.passed || result.warningCount > 0) {
                report += `\n[${result.skillName}]\n`;
                for (const issue of result.issues) {
                    const icon = issue.severity === Severity.ERROR ? '❌' : '⚠️';
                    report += `  ${icon} [${issue.issueType}] ${issue.description}\n`;
                    report += `     位置: ${issue.filePath}\n`;
                    report += `     建议: ${issue.fixSuggestion.substring(0, 100)}...\n`;
                }
            }
        }
        
        return report;
    }
    
    indentText(text, spaces) {
        const indent = ' '.repeat(spaces);
        return text.split('\n').map(line => indent + line).join('\n');
    }
    
    async interactiveFix(results) {
        console.log('\n' + '='.repeat(60));
        console.log('交互式修复模式');
        console.log('='.repeat(60));
        
        const allIssues = results.flatMap(r => r.issues.filter(i => i.severity === Severity.ERROR));
        
        if (allIssues.length === 0) {
            console.log('\n✅ 没有发现需要修复的错误。');
            return;
        }
        
        console.log(`\n发现 ${allIssues.length} 个错误需要修复。`);
        console.log('\n可用命令:');
        console.log('  [数字] - 查看具体问题详情');
        console.log('  [a] - 显示所有问题');
        console.log('  [q] - 退出交互模式');
        console.log('  [r] - 重新验证');
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const askQuestion = () => {
            rl.question('\n请输入命令: ', async (cmd) => {
                cmd = cmd.trim().toLowerCase();
                
                if (cmd === 'q') {
                    console.log('\n退出交互模式。');
                    rl.close();
                } else if (cmd === 'a') {
                    allIssues.forEach((issue, idx) => {
                        console.log(`\n[${idx + 1}] ${issue.issueType}`);
                        console.log(`    技能: ${issue.skillName}`);
                        console.log(`    文件: ${issue.filePath}`);
                        console.log(`    问题: ${issue.description}`);
                        console.log(`    建议: ${issue.fixSuggestion.substring(0, 200)}...`);
                    });
                    askQuestion();
                } else if (cmd === 'r') {
                    console.log('\n请重新运行验证脚本。');
                    rl.close();
                } else if (cmd && !isNaN(parseInt(cmd))) {
                    const idx = parseInt(cmd);
                    if (idx >= 1 && idx <= allIssues.length) {
                        this.showFixDetails(allIssues[idx - 1]);
                    } else {
                        console.log(`无效数字，请输入 1-${allIssues.length}`);
                    }
                    askQuestion();
                } else {
                    console.log('未知命令，请输入 [数字]、[a]、[q] 或 [r]');
                    askQuestion();
                }
            });
        };
        
        askQuestion();
    }
    
    showFixDetails(issue) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`问题详情 #${issue.issueType}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`\n技能名称: ${issue.skillName}`);
        console.log(`文件路径: ${issue.filePath}`);
        console.log(`\n问题描述:`);
        console.log(this.indentText(issue.description, 4));
        console.log(`\n修复建议:`);
        console.log(this.indentText(issue.fixSuggestion, 4));
        console.log(`\n${'='.repeat(60)}`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
AI Agent 技能规范验证器（JavaScript版本）

使用方式:
  node validate_skills.mjs ./skills [选项]
  node validate_skills.mjs ./skills/pdf-processing [选项]

选项:
  --output-format [格式]  输出格式：markdown、json、text（默认: markdown）
  --output-file [文件]    保存报告到文件
  --strict                严格模式，包含所有警告
  --interactive           交互式修复模式
  --fail-on-error         发现错误时以非零状态码退出
  --help, -h              显示帮助信息

示例:
  node validate_skills.mjs ./skills
  node validate_skills.mjs ./skills --output-format detailed
  node validate_skills.mjs ./skills --strict
  node validate_skills.mjs ./skills --interactive
`);
        process.exit(0);
    }
    
    let pathArg = './skills';
    let outputFormat = 'markdown';
    let outputFile = null;
    let strictMode = false;
    let interactive = false;
    let failOnError = false;
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const option = arg.substring(2);
            if (option === 'output-format' && i + 1 < args.length) {
                outputFormat = args[++i];
            } else if (option === 'output-file' && i + 1 < args.length) {
                outputFile = args[++i];
            } else if (option === 'strict') {
                strictMode = true;
            } else if (option === 'interactive') {
                interactive = true;
            } else if (option === 'fail-on-error') {
                failOnError = true;
            }
        } else if (!arg.startsWith('-')) {
            pathArg = arg;
        }
    }
    
    try {
        const validator = new SkillValidator({ strictMode, interactive });
        const results = await validator.validateDirectory(pathArg);
        const report = validator.generateReport(results, outputFormat);
        
        if (outputFile) {
            fs.writeFileSync(outputFile, report, 'utf-8');
            console.log(`报告已保存至: ${outputFile}`);
        } else {
            console.log(report);
        }
        
        if (interactive) {
            await validator.interactiveFix(results);
        }
        
        const hasErrors = results.some(r => r.errorCount > 0);
        
        if (hasErrors && failOnError) {
            process.exit(1);
        }
        
        process.exit(hasErrors ? 1 : 0);
        
    } catch (e) {
        if (e.message.includes('不存在')) {
            console.error(`错误: ${e.message}`);
            process.exit(2);
        } else if (e.message.includes('而非目录')) {
            console.error(`错误: ${e.message}`);
            process.exit(2);
        } else {
            console.error(`发生意外错误: ${e.message}`);
            console.error(e.stack);
            process.exit(3);
        }
    }
}

main().catch(e => {
    console.error(`运行时错误: ${e.message}`);
    process.exit(3);
});
