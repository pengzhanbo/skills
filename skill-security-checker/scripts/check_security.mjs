#!/usr/bin/env node
/**
 * AI Agent Skill Security Checker (JavaScript Version)
 * 系统性评估AI Agent技能的安全性
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, lstatSync } from 'fs';
import { join, relative, resolve, basename, dirname } from 'path';
import { cwd } from 'process';
import { execSync } from 'child_process';

const VERSION = '1.0.0';

const Severity = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

const CheckCategory = {
    FILE_DELETE: 'file_delete',
    SENSITIVE_FILE: 'sensitive_file',
    DANGEROUS_COMMAND: 'dangerous_command',
    INFO_LEAK: 'info_leak'
};

class SecurityPattern {
    static FILE_DELETE_PATTERNS = [
        [/rm\s+-rf/g, '危险删除命令: rm -rf', Severity.HIGH],
        [/rm\s+-r/g, '递归删除命令: rm -r', Severity.MEDIUM],
        [/rm\b(?!\s+-rf|\s+-r)/g, '文件删除命令: rm', Severity.MEDIUM],
        [/shutil\.rmtree/g, '目录删除: shutil.rmtree()', Severity.HIGH],
        [/os\.remove/g, '文件删除: os.remove()', Severity.MEDIUM],
        [/os\.unlink/g, '文件删除: os.unlink()', Severity.MEDIUM],
        [/\bdel\b(?!\.*\s*\[)/g, '删除操作: del关键字', Severity.LOW],
        [/\bdel\b(?:\s*\/[sq]+\b|\s*\/p\b|\s*\/f\b)/g, 'Windows删除命令: del', Severity.MEDIUM],
        [/rmdir(?:\s*\/[sq]+\b)?/g, '目录删除: rmdir', Severity.MEDIUM],
        [/\bformat\b/g, '磁盘格式化命令', Severity.HIGH],
        [/\bmkfs\b/g, '文件系统格式化命令', Severity.HIGH],
        [/dd\s+if=\/dev\/zero/g, '危险磁盘写入命令', Severity.HIGH]
    ];

    static SENSITIVE_FILE_PATTERNS = [
        [/\.ssh\//g, 'SSH密钥目录访问', Severity.HIGH],
        [/\.aws\//g, 'AWS配置目录访问', Severity.HIGH],
        [/\.git\//g, 'Git配置访问', Severity.LOW],
        [/\.bashrc/g, 'Shell配置文件访问', Severity.HIGH],
        [/\.bash_profile/g, 'Shell配置文件访问', Severity.HIGH],
        [/\.zshrc/g, 'Zsh配置文件访问', Severity.HIGH],
        [/\.profile/g, '系统配置文件访问', Severity.HIGH],
        [/\/etc\/passwd/g, '系统密码文件访问', Severity.HIGH],
        [/\/etc\/shadow/g, '系统影子密码文件访问', Severity.HIGH],
        [/\/etc\/sudoers/g, 'Sudoers配置访问', Severity.HIGH],
        [/\.env/g, '环境变量文件访问', Severity.HIGH],
        [/\.keystore/g, '密钥库文件访问', Severity.HIGH],
        [/\.jks/g, 'Java密钥库文件访问', Severity.HIGH],
        [/\.p12/g, '证书文件访问', Severity.HIGH],
        [/\.pfx/g, '证书文件访问', Severity.HIGH],
        [/passwords?\.(txt|json|yaml|yml)/g, '密码文件访问', Severity.HIGH],
        [/credentials\.(txt|json|yaml|yml)/g, '凭证文件访问', Severity.HIGH],
        [/api[_-]?keys?\.(txt|json|yaml|yml)/g, 'API密钥文件访问', Severity.HIGH],
        [/tokens?\.(txt|json|yaml|yml)/g, '令牌文件访问', Severity.HIGH],
        [/secrets?\.(txt|json|yaml|yml)/g, '密钥文件访问', Severity.HIGH],
        [/\/root\//g, 'Root目录访问', Severity.HIGH],
        [/\/home\/[^\/]+\//g, '用户主目录访问', Severity.MEDIUM],
        [/\/var\/log\//g, '日志目录访问', Severity.MEDIUM],
        [/\/proc\//g, '系统进程信息访问', Severity.MEDIUM],
        [/\/sys\//g, '系统内核信息访问', Severity.MEDIUM]
    ];

    static DANGEROUS_COMMAND_PATTERNS = [
        [/\bsudo\b(?!\s+(?:-i|-\w*\s))/g, '普通sudo命令', Severity.MEDIUM],
        [/\bsudo\s+su\b/g, '提权命令: sudo su', Severity.HIGH],
        [/\bchmod\s+777\b/g, '危险权限设置: chmod 777', Severity.HIGH],
        [/\bchmod\s+0\b/g, '危险权限设置: chmod 0', Severity.HIGH],
        [/\bchown\b(?:\s+root|\s+[^\s]+\s+[^\s]+)/g, '所有权修改命令', Severity.MEDIUM],
        [/curl\b.*(?:\||>|\$\()/g, '命令管道重定向', Severity.MEDIUM],
        [/wget\b.*(?:\||>|\$\()/g, '命令管道重定向', Severity.MEDIUM],
        [/\beval\b/g, '危险命令: eval', Severity.HIGH],
        [/\bexec\b/g, '命令执行: exec', Severity.MEDIUM],
        [/\bsystem\b/g, '系统命令执行', Severity.MEDIUM],
        [/\bpopen\b/g, '进程管道打开', Severity.MEDIUM],
        [/subprocess(?!\s*\([^)]*(?:shell=False|check=False))/g, '子进程执行', Severity.MEDIUM],
        [/\bexecvp\b|\bexecvpe\b/g, '危险exec调用', Severity.HIGH],
        [/\bfork\b(?:\s*\(|\s*;)/g, '进程fork操作', Severity.MEDIUM],
        [/\bpkill\b|\bkillall\b/g, '进程终止命令', Severity.MEDIUM],
        [/kill\s+-9/g, '强制终止进程', Severity.MEDIUM],
        [/\bcrontab\b(?:\s+-r|\s+-e)/g, '定时任务修改', Severity.HIGH],
        [/\bservice\b\s+(\w+)\s+stop/g, '服务停止命令', Severity.MEDIUM],
        [/\bsystemctl\b(?:\s+stop|\s+disable)/g, '系统服务控制', Severity.MEDIUM],
        [/\biptables\b/g, '防火墙配置修改', Severity.HIGH],
        [/\bnfqueue\b|\bnetfilter/g, '网络包过滤操作', Severity.HIGH],
        [/\bmodprobe\b|\binsmod\b|\brmmod/g, '内核模块操作', Severity.HIGH],
        [/\bmount\b/g, '挂载操作', Severity.HIGH],
        [/\bunmount\b|\bumount/g, '卸载操作', Severity.MEDIUM],
        [/\bpasswd\b/g, '密码修改命令', Severity.HIGH],
        [/\buseradd\b|\busermod\b|\buserdel/g, '用户管理命令', Severity.HIGH],
        [/\bgroupadd\b|\bgroupmod\b|\bgroupdel/g, '组管理命令', Severity.HIGH],
        [/\bdd\b(?!\s+if=\/dev\/urandom)/g, '数据复制命令', Severity.MEDIUM],
        [/\bshred\b/g, '安全删除命令', Severity.MEDIUM],
        [/\bwipe\b/g, '磁盘擦除命令', Severity.HIGH],
        [/\bnc\b(?:\s+-[lLp]\b|\s+-e\b)/g, 'Netcat反向shell', Severity.HIGH],
        [/\bnetcat\b/g, 'Netcat工具使用', Severity.HIGH],
        [/\bsocat\b/g, 'Socket转发工具', Severity.HIGH],
        [/nodejs\s*:\s*eval/g, 'Node.js危险eval', Severity.HIGH],
        [/\bprocess\.exec\b|\bexecSync\b/g, 'Node.js命令执行', Severity.HIGH],
        [/spawn\b(?:\([^)]*)?\s*,\s*['"]shell['"]/g, 'Shell spawning', Severity.HIGH]
    ];

    static INFO_LEAK_PATTERNS = [
        [/api[_-]?key\s*[:=]\s*['"][^'"]+['"]/g, '硬编码API密钥', Severity.HIGH],
        [/secret\s*[:=]\s*['"][^'"]+['"]/g, '硬编码密钥', Severity.HIGH],
        [/password\s*[:=]\s*['"][^'"]+['"]/g, '硬编码密码', Severity.HIGH],
        [/passwd\s*[:=]\s*['"][^'"]+['"]/g, '硬编码密码', Severity.HIGH],
        [/token\s*[:=]\s*['"][^'"]+['"]/g, '硬编码令牌', Severity.HIGH],
        [/access[_-]?key\s*[:=]\s*['"][^'"]+['"]/g, '硬编码访问密钥', Severity.HIGH],
        [/aws[_-]?access[_-]?key[_-]?id/g, 'AWS访问密钥ID', Severity.HIGH],
        [/aws[_-]?secret[_-]?access[_-]?key/g, 'AWS密钥', Severity.HIGH],
        [/private[_-]?key/g, '私钥内容', Severity.HIGH],
        [/-----BEGIN\s+RSA\s+PRIVATE\s+KEY-----/g, 'RSA私钥', Severity.HIGH],
        [/-----BEGIN\s+EC\s+PRIVATE\s+KEY-----/g, 'EC私钥', Severity.HIGH],
        [/-----BEGIN\s+DSA\s+PRIVATE\s+KEY-----/g, 'DSA私钥', Severity.HIGH],
        [/-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----/g, 'OpenSSH私钥', Severity.HIGH],
        [/print\s*\(\s*f?['"][^'"]*password/g, '密码打印日志', Severity.HIGH],
        [/print\s*\(\s*f?['"][^'"]*token/g, '令牌打印日志', Severity.HIGH],
        [/console\.log\s*\([^)]*(?:password|token|secret|key)/g, '敏感信息日志输出', Severity.HIGH],
        [/logger\.[a-z]+\([^)]*(?:password|token|secret|key)/g, '敏感信息记录', Severity.HIGH],
        [/traceback\.print_exc\(\)/g, '异常堆栈打印', Severity.MEDIUM],
        [/exception\s+as\s+e:\s*print\s*\(\s*e\)/g, '异常信息打印', Severity.MEDIUM],
        [/\berror\b.*(?:\||>|\$\()/g, '错误输出重定向', Severity.MEDIUM],
        [/\.getenv\s*\(\s*['"]API[_-]?KEY['"]/g, '环境变量密钥获取', Severity.MEDIUM],
        [/\.getenv\s*\(\s*['"]SECRET['"]/g, '环境变量密钥获取', Severity.MEDIUM],
        [/\bhostname|\.hostname\(\)/g, '主机名获取', Severity.LOW],
        [/\bwhoami\b/g, '当前用户查询', Severity.LOW],
        [/\bgetpwuid\b|\bgetuid\b/g, '用户ID获取', Severity.LOW]
    ];

    static PATH_TRAVERSAL_PATTERNS = [
        [/\.\.\//g, '路径遍历: ../', Severity.MEDIUM],
        [/\.\.\\/g, '路径遍历: ..\\', Severity.MEDIUM],
        [/\bopen\s*\(\s*['"][^'"]*\.\.\//g, '文件打开包含路径遍历', Severity.MEDIUM],
        [/\breadFileSync\s*\([^)]*\.\.\//g, '文件读取包含路径遍历', Severity.MEDIUM],
        [/readFile\s*\([^)]*\.\.\//g, '文件读取包含路径遍历', Severity.MEDIUM]
    ];
}

class SecurityIssue {
    constructor(skillName, filePath, category, severity, title, description, codeSnippet, suggestion, lineNumber = null) {
        this.skill_name = skillName;
        this.file_path = filePath;
        this.category = category;
        this.severity = severity;
        this.title = title;
        this.description = description;
        this.code_snippet = codeSnippet;
        this.suggestion = suggestion;
        this.line_number = lineNumber;
    }
}

class SecurityReport {
    constructor(timestamp, scope) {
        this.timestamp = timestamp;
        this.scope = scope;
        this.total_skills = 0;
        this.safe_skills = 0;
        this.warnings = 0;
        this.dangers = 0;
        this.issues = [];
    }
}

class SecurityChecker {
    constructor(options = {}) {
        this.strictMode = options.strictMode || false;
        this.excludeDirs = options.excludeDirs || [];
        this.issues = [];
        this.skillsChecked = 0;
        this.safeSkills = 0;
    }

    shouldReport(severity) {
        if (this.strictMode) {
            return true;
        }
        return severity === Severity.HIGH || severity === Severity.MEDIUM;
    }

    checkFile(filePath, skillName) {
        const issues = [];
        const ext = filePath.split('.').pop().toLowerCase();
        const executableExts = ['py', 'js', 'ts', 'sh', 'bash', 'zsh', 'ps1', 'md', 'txt', 'json', 'yaml', 'yml'];
        
        if (!executableExts.includes(ext)) {
            return issues;
        }

        try {
            const content = readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                const lineNum = index + 1;
                const lineIssues = this.checkLine(line, filePath, skillName, lineNum);
                issues.push(...lineIssues);
            });
        } catch (e) {
            // 忽略读取错误
        }

        return issues;
    }

    checkLine(line, filePath, skillName, lineNumber) {
        const issues = [];
        const patternsToCheck = [
            [SecurityPattern.FILE_DELETE_PATTERNS, CheckCategory.FILE_DELETE],
            [SecurityPattern.SENSITIVE_FILE_PATTERNS, CheckCategory.SENSITIVE_FILE],
            [SecurityPattern.DANGEROUS_COMMAND_PATTERNS, CheckCategory.DANGEROUS_COMMAND],
            [SecurityPattern.INFO_LEAK_PATTERNS, CheckCategory.INFO_LEAK],
            [SecurityPattern.PATH_TRAVERSAL_PATTERNS, CheckCategory.FILE_DELETE]
        ];

        patternsToCheck.forEach(([patterns, category]) => {
            patterns.forEach(([pattern, description, severity]) => {
                if (this.shouldReport(severity) && pattern.test(line)) {
                    const issue = this.createIssue(
                        skillName, filePath, category, severity,
                        description, line.trim().substring(0, 200), lineNumber
                    );
                    issues.push(issue);
                    pattern.lastIndex = 0;
                }
            });
        });

        return issues;
    }

    createIssue(skillName, filePath, category, severity, title, codeSnippet, lineNumber) {
        const description = this.getDescription(category, severity);
        const suggestion = this.getSuggestion(category, severity);

        return new SecurityIssue(
            skillName, filePath, category, severity, title, description, codeSnippet, suggestion, lineNumber
        );
    }

    getDescription(category, severity) {
        const descriptions = {
            [CheckCategory.FILE_DELETE]: '检测到文件删除操作，可能导致数据丢失',
            [CheckCategory.SENSITIVE_FILE]: '检测到对敏感文件的访问操作',
            [CheckCategory.DANGEROUS_COMMAND]: '检测到危险系统命令执行',
            [CheckCategory.INFO_LEAK]: '检测到可能导致信息泄露的代码逻辑'
        };
        return descriptions[category] || '检测到安全问题';
    }

    getSuggestion(category, severity) {
        const suggestions = {
            [CheckCategory.FILE_DELETE]: '在执行删除操作前，必须获得用户的明确授权确认。建议添加确认机制',
            [CheckCategory.SENSITIVE_FILE]: '避免直接访问系统配置文件和个人数据文件',
            [CheckCategory.DANGEROUS_COMMAND]: '危险命令可能导致系统损坏，建议重新评估操作必要性',
            [CheckCategory.INFO_LEAK]: '避免在代码中硬编码敏感信息，使用环境变量管理'
        };
        return suggestions[category] || '请检查并修复此安全问题';
    }

    extractSkillName(skillMdPath) {
        try {
            const content = readFileSync(skillMdPath, 'utf8');
            if (content.startsWith('---')) {
                const yamlEnd = content.indexOf('---', 3);
                if (yamlEnd !== -1) {
                    const yamlContent = content.substring(3, yamlEnd);
                    const nameMatch = yamlContent.match(/name:\s*(.+)/);
                    if (nameMatch) {
                        return nameMatch[1].trim();
                    }
                }
            }
        } catch (e) {
            // 忽略错误
        }
        return null;
    }

    checkDirectory(directory) {
        directory = resolve(directory);
        const report = new SecurityReport(new Date().toISOString().replace('T', ' ').substring(0, 19), directory);

        const walkDir = (dir, excludeDirs) => {
            let items;
            try {
                items = readdirSync(dir);
            } catch (e) {
                return;
            }

            items.forEach(item => {
                const fullPath = join(dir, item);
                
                try {
                    const stat = existsSync(fullPath) && readFileSync(fullPath, 'utf8');
                    if (existsSync(fullPath) && readFileSync(fullPath, 'utf8') !== undefined) {
                        // 是目录
                        if (excludeDirs.includes(item)) {
                            return;
                        }
                        walkDir(fullPath, excludeDirs);
                    }
                } catch (e) {
                    // 检查是否是目录
                    try {
                        if (existsSync(fullPath) && readdirSync(fullPath) !== undefined) {
                            if (excludeDirs.includes(item)) {
                                return;
                            }
                            walkDir(fullPath, excludeDirs);
                        }
                    } catch (err) {
                        // 是文件
                        this.processFile(fullPath, report);
                    }
                }
            });
        };

        const processFile = (filePath, report) => {
            const fileBasename = basename(filePath);
            if (fileBasename === 'SKILL.md') {
                const skillName = this.extractSkillName(filePath);
                if (skillName) {
                    this.skillsChecked++;
                    const skillDir = dirname(filePath);
                    let dir;
                    try {
                        dir = readdirSync(skillDir);
                    } catch (e) {
                        dir = [];
                    }
                    let skillIssues = [];
                    
                    dir.forEach(file => {
                        const fPath = join(skillDir, file);
                        try {
                            if (!lstatSync(fPath).isDirectory()) {
                                const issues = this.checkFile(fPath, skillName);
                                skillIssues.push(...issues);
                            }
                        } catch (e) {
                            // 忽略
                        }
                    });

                    if (skillIssues.length === 0) {
                        this.safeSkills++;
                    }
                    this.issues.push(...skillIssues);
                }
            }
        };

        // 使用递归遍历
        const traverseDir = (dir) => {
            let items;
            try {
                items = readdirSync(dir);
            } catch (e) {
                return;
            }

            items.forEach(item => {
                if (this.excludeDirs.includes(item)) {
                    return;
                }

                const fullPath = join(dir, item);
                let isDir = false;
                try {
                    readdirSync(fullPath);
                    isDir = true;
                } catch (e) {
                    isDir = false;
                }

                if (isDir) {
                    traverseDir(fullPath);
                } else {
                    processFile(fullPath, report);
                }
            });
        };

        traverseDir(directory);

        report.total_skills = this.skillsChecked;
        report.safe_skills = this.safeSkills;
        report.warnings = this.issues.filter(i => i.severity === Severity.MEDIUM).length;
        report.dangers = this.issues.filter(i => i.severity === Severity.HIGH).length;
        report.issues = this.issues;

        return report;
    }

    checkIncremental(directory, lastCommit = 'HEAD') {
        let modifiedFiles = [];
        try {
            const result = execSync(`git diff --name-only ${lastCommit}`, { 
                cwd: directory,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            modifiedFiles = result.trim().split('\n').filter(f => f);
        } catch (e) {
            modifiedFiles = [];
        }

        directory = resolve(directory);
        const report = new SecurityReport(new Date().toISOString().replace('T', ' ').substring(0, 19), directory);

        const traverseDir = (dir) => {
            let items;
            try {
                items = readdirSync(dir);
            } catch (e) {
                return;
            }

            items.forEach(item => {
                if (this.excludeDirs.includes(item)) {
                    return;
                }

                const fullPath = join(dir, item);
                let isDir = false;
                try {
                    if (lstatSync(fullPath).isDirectory()) {
                        isDir = true;
                    }
                } catch (e) {
                    isDir = false;
                }

                if (isDir) {
                    traverseDir(fullPath);
                } else {
                    const fileBasename = basename(fullPath);
                    if (fileBasename === 'SKILL.md') {
                        const skillName = this.extractSkillName(fullPath);
                        if (skillName) {
                            this.skillsChecked++;
                            const skillDir = dirname(fullPath);
                            let skillIssues = [];
                            
                            try {
                                const files = readdirSync(skillDir);
                                files.forEach(file => {
                                    const fPath = join(skillDir, file);
                                    try {
                                        if (!lstatSync(fPath).isDirectory()) {
                                            const issues = this.checkFile(fPath, skillName);
                                            skillIssues.push(...issues);
                                        }
                                    } catch (err) {
                                        const issues = this.checkFile(fPath, skillName);
                                        skillIssues.push(...issues);
                                    }
                                });
                            } catch (e) {
                                // 忽略
                            }

                            if (skillIssues.length === 0) {
                                this.safeSkills++;
                            }
                            this.issues.push(...skillIssues);
                        }
                    }
                }
            });
        };

        traverseDir(directory);

        report.total_skills = this.skillsChecked;
        report.safe_skills = this.safeSkills;
        report.warnings = this.issues.filter(i => i.severity === Severity.MEDIUM).length;
        report.dangers = this.issues.filter(i => i.severity === Severity.HIGH).length;
        report.issues = this.issues;

        return report;
    }
}

class MarkdownReporter {
    static generate(report) {
        const md = [];

        md.push('# AI Agent 技能安全评估报告\n');
        md.push(`**生成时间**: ${report.timestamp}\n`);
        md.push(`**检查范围**: ${report.scope}\n`);
        md.push(`**总计技能**: ${report.total_skills}\n`);
        md.push(`**安全**: ${report.safe_skills}\n`);
        md.push(`**警告**: ${report.warnings}\n`);
        md.push(`**危险**: ${report.dangers}\n`);

        md.push('\n## 问题清单\n');

        const highIssues = report.issues.filter(i => i.severity === Severity.HIGH);
        const mediumIssues = report.issues.filter(i => i.severity === Severity.MEDIUM);
        const lowIssues = report.issues.filter(i => i.severity === Severity.LOW);

        if (highIssues.length > 0) {
            md.push('### 🔴 高危问题\n');
            highIssues.forEach((issue, index) => {
                md.push(`#### ${index + 1}. ${issue.title}\n`);
                md.push(`- **技能名称**: \`${issue.skill_name}\`\n`);
                md.push(`- **文件路径**: \`${issue.file_path}\`\n`);
                if (issue.line_number) {
                    md.push(`- **行号**: \`${issue.line_number}\`\n`);
                }
                md.push(`- **问题描述**: ${issue.description}\n`);
                md.push(`- **严重程度**: 🔴 高危\n`);
                md.push(`- **风险等级**: 🔴 高危\n`);
                md.push(`- **代码片段**:\n`);
                md.push(`\`\`\`\n${issue.code_snippet}\n\`\`\`\n`);
                md.push(`- **修复建议**: ${issue.suggestion}\n`);
                md.push('\n---\n');
            });
        }

        if (mediumIssues.length > 0) {
            md.push('### 🟡 中等问题\n');
            mediumIssues.forEach((issue, index) => {
                md.push(`#### ${index + 1}. ${issue.title}\n`);
                md.push(`- **技能名称**: \`${issue.skill_name}\`\n`);
                md.push(`- **文件路径**: \`${issue.file_path}\`\n`);
                if (issue.line_number) {
                    md.push(`- **行号**: \`${issue.line_number}\`\n`);
                }
                md.push(`- **问题描述**: ${issue.description}\n`);
                md.push(`- **严重程度**: 🟡 中等\n`);
                md.push(`- **风险等级**: 🟡 中等\n`);
                md.push(`- **代码片段**:\n`);
                md.push(`\`\`\`\n${issue.code_snippet}\n\`\`\`\n`);
                md.push(`- **修复建议**: ${issue.suggestion}\n`);
                md.push('\n---\n');
            });
        }

        if (lowIssues.length > 0) {
            md.push('### 🟢 低风险问题\n');
            lowIssues.forEach((issue, index) => {
                md.push(`#### ${index + 1}. ${issue.title}\n`);
                md.push(`- **技能名称**: \`${issue.skill_name}\`\n`);
                md.push(`- **文件路径**: \`${issue.file_path}\`\n`);
                if (issue.line_number) {
                    md.push(`- **行号**: \`${issue.line_number}\`\n`);
                }
                md.push(`- **问题描述**: ${issue.description}\n`);
                md.push(`- **严重程度**: 🟢 低\n`);
                md.push(`- **代码片段**:\n`);
                md.push(`\`\`\`\n${issue.code_snippet}\n\`\`\`\n`);
                md.push(`- **修复建议**: ${issue.suggestion}\n`);
                md.push('\n---\n');
            });
        }

        md.push('\n## 安全检查摘要\n');
        md.push('| 检查项目 | 安全 | 警告 | 危险 |\n');
        md.push('|---------|------|------|------|\n');
        md.push(`| 文件操作 | ${report.safe_skills} | ${report.warnings} | ${report.dangers} |\n`);

        return md.join('');
    }
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        directory: './skills',
        outputDir: './security_reports',
        strict: false,
        exclude: '',
        incremental: false,
        format: 'markdown',
        severity: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '-o':
            case '--output-dir':
                options.outputDir = args[++i];
                break;
            case '-s':
            case '--strict':
                options.strict = true;
                break;
            case '-e':
            case '--exclude':
                options.exclude = args[++i];
                break;
            case '-i':
            case '--incremental':
                options.incremental = true;
                break;
            case '-f':
            case '--format':
                options.format = args[++i];
                break;
            case '-v':
            case '--severity':
                options.severity = args[++i];
                break;
            default:
                if (!arg.startsWith('-')) {
                    options.directory = arg;
                }
        }
    }

    return options;
}

async function main() {
    console.log(`AI Agent Skill Security Checker v${VERSION}\n`);
    
    const options = parseArgs();
    const excludeDirs = options.exclude ? options.exclude.split(',') : [];

    const checker = new SecurityChecker({
        strictMode: options.strict,
        excludeDirs: excludeDirs
    });

    let report;
    if (options.incremental) {
        report = checker.checkIncremental(options.directory);
    } else {
        report = checker.checkDirectory(options.directory);
    }

    // 过滤指定严重程度的问题
    if (options.severity) {
        report.issues = report.issues.filter(i => i.severity === options.severity);
    }

    // 生成报告
    let reportContent;
    let filename;

    if (options.format === 'markdown') {
        reportContent = MarkdownReporter.generate(report);
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
        filename = `ai_agent_skill_security_report_${timestamp}.md`;
    } else {
        reportContent = JSON.stringify({
            timestamp: report.timestamp,
            scope: report.scope,
            total_skills: report.total_skills,
            safe_skills: report.safe_skills,
            warnings: report.warnings,
            dangers: report.dangers,
            issues: report.issues.map(i => ({
                skill_name: i.skill_name,
                file_path: i.file_path,
                category: i.category,
                severity: i.severity,
                title: i.title,
                description: i.description,
                code_snippet: i.code_snippet,
                suggestion: i.suggestion,
                line_number: i.line_number
            }))
        }, null, 2);
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
        filename = `ai_agent_skill_security_report_${timestamp}.json`;
    }

    // 保存报告
    const outputDir = resolve(options.outputDir);
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, filename);

    writeFileSync(outputPath, reportContent, 'utf8');

    // 打印摘要
    console.log('安全检查完成！');
    console.log(`总计技能: ${report.total_skills}`);
    console.log(`安全: ${report.safe_skills}`);
    console.log(`警告: ${report.warnings}`);
    console.log(`危险: ${report.dangers}`);
    console.log(`\n报告已保存至: ${outputPath}`);

    return report.dangers === 0 ? 0 : 1;
}

main().then(code => {
    process.exit(code);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
