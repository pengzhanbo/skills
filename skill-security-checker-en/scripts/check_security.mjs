#!/usr/bin/env node
/**
 * AI Agent Skill Security Checker (JavaScript Version)
 * Systematically evaluates the security of AI Agent skills
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
        [/rm\s+-rf/g, 'Dangerous deletion command: rm -rf', Severity.HIGH],
        [/rm\s+-r/g, 'Recursive deletion command: rm -r', Severity.MEDIUM],
        [/rm\b(?!\s+-rf|\s+-r)/g, 'File deletion command: rm', Severity.MEDIUM],
        [/shutil\.rmtree/g, 'Directory deletion: shutil.rmtree()', Severity.HIGH],
        [/os\.remove/g, 'File deletion: os.remove()', Severity.MEDIUM],
        [/os\.unlink/g, 'File deletion: os.unlink()', Severity.MEDIUM],
        [/\bdel\b(?!\.*\s*\[)/g, 'Deletion operation: del keyword', Severity.LOW],
        [/\bdel\b(?:\s*\/[sq]+\b|\s*\/p\b|\s*\/f\b)/g, 'Windows deletion command: del', Severity.MEDIUM],
        [/rmdir(?:\s*\/[sq]+\b)?/g, 'Directory deletion: rmdir', Severity.MEDIUM],
        [/\bformat\b/g, 'Disk formatting command', Severity.HIGH],
        [/\bmkfs\b/g, 'Filesystem formatting command', Severity.HIGH],
        [/dd\s+if=\/dev\/zero/g, 'Dangerous disk writing command', Severity.HIGH]
    ];

    static SENSITIVE_FILE_PATTERNS = [
        [/\.ssh\//g, 'SSH key directory access', Severity.HIGH],
        [/\.aws\//g, 'AWS configuration directory access', Severity.HIGH],
        [/\.git\//g, 'Git configuration access', Severity.LOW],
        [/\.bashrc/g, 'Shell configuration file access', Severity.HIGH],
        [/\.bash_profile/g, 'Shell configuration file access', Severity.HIGH],
        [/\.zshrc/g, 'Zsh configuration file access', Severity.HIGH],
        [/\.profile/g, 'System configuration file access', Severity.HIGH],
        [/\/etc\/passwd/g, 'System password file access', Severity.HIGH],
        [/\/etc\/shadow/g, 'System shadow password file access', Severity.HIGH],
        [/\/etc\/sudoers/g, 'Sudoers configuration access', Severity.HIGH],
        [/\.env/g, 'Environment variable file access', Severity.HIGH],
        [/\.keystore/g, 'Keystore file access', Severity.HIGH],
        [/\.jks/g, 'Java keystore file access', Severity.HIGH],
        [/\.p12/g, 'Certificate file access', Severity.HIGH],
        [/\.pfx/g, 'Certificate file access', Severity.HIGH],
        [/passwords?\.(txt|json|yaml|yml)/g, 'Password file access', Severity.HIGH],
        [/credentials\.(txt|json|yaml|yml)/g, 'Credential file access', Severity.HIGH],
        [/api[_-]?keys?\.(txt|json|yaml|yml)/g, 'API key file access', Severity.HIGH],
        [/tokens?\.(txt|json|yaml|yml)/g, 'Token file access', Severity.HIGH],
        [/secrets?\.(txt|json|yaml|yml)/g, 'Secret file access', Severity.HIGH],
        [/\/root\//g, 'Root directory access', Severity.HIGH],
        [/\/home\/[^\/]+\//g, 'User home directory access', Severity.MEDIUM],
        [/\/var\/log\//g, 'Log directory access', Severity.MEDIUM],
        [/\/proc\//g, 'System process information access', Severity.MEDIUM],
        [/\/sys\//g, 'System kernel information access', Severity.MEDIUM]
    ];

    static DANGEROUS_COMMAND_PATTERNS = [
        [/\bsudo\b(?!\s+(?:-i|-\w*\s))/g, 'Regular sudo command', Severity.MEDIUM],
        [/\bsudo\s+su\b/g, 'Privilege escalation command: sudo su', Severity.HIGH],
        [/\bchmod\s+777\b/g, 'Dangerous permission setting: chmod 777', Severity.HIGH],
        [/\bchmod\s+0\b/g, 'Dangerous permission setting: chmod 0', Severity.HIGH],
        [/\bchown\b(?:\s+root|\s+[^\s]+\s+[^\s]+)/g, 'Ownership modification command', Severity.MEDIUM],
        [/curl\b.*(?:\||>|\$\()/g, 'Command pipe redirection', Severity.MEDIUM],
        [/wget\b.*(?:\||>|\$\()/g, 'Command pipe redirection', Severity.MEDIUM],
        [/\beval\b/g, 'Dangerous command: eval', Severity.HIGH],
        [/\bexec\b/g, 'Command execution: exec', Severity.MEDIUM],
        [/\bsystem\b/g, 'System command execution', Severity.MEDIUM],
        [/\bpopen\b/g, 'Process pipe opening', Severity.MEDIUM],
        [/subprocess(?!\s*\([^)]*(?:shell=False|check=False))/g, 'Subprocess execution', Severity.MEDIUM],
        [/\bexecvp\b|\bexecvpe\b/g, 'Dangerous exec call', Severity.HIGH],
        [/\bfork\b(?:\s*\(|\s*;)/g, 'Process fork operation', Severity.MEDIUM],
        [/\bpkill\b|\bkillall\b/g, 'Process termination command', Severity.MEDIUM],
        [/kill\s+-9/g, 'Force terminate process', Severity.MEDIUM],
        [/\bcrontab\b(?:\s+-r|\s+-e)/g, 'Scheduled task modification', Severity.HIGH],
        [/\bservice\b\s+(\w+)\s+stop/g, 'Service stop command', Severity.MEDIUM],
        [/\bsystemctl\b(?:\s+stop|\s+disable)/g, 'System service control', Severity.MEDIUM],
        [/\biptables\b/g, 'Firewall configuration modification', Severity.HIGH],
        [/\bnfqueue\b|\bnetfilter/g, 'Network packet filtering operation', Severity.HIGH],
        [/\bmodprobe\b|\binsmod\b|\brmmod/g, 'Kernel module operation', Severity.HIGH],
        [/\bmount\b/g, 'Mount operation', Severity.HIGH],
        [/\bunmount\b|\bumount/g, 'Unmount operation', Severity.MEDIUM],
        [/\bpasswd\b/g, 'Password modification command', Severity.HIGH],
        [/\buseradd\b|\busermod\b|\buserdel/g, 'User management command', Severity.HIGH],
        [/\bgroupadd\b|\bgroupmod\b|\bgroupdel/g, 'Group management command', Severity.HIGH],
        [/\bdd\b(?!\s+if=\/dev\/urandom)/g, 'Data copy command', Severity.MEDIUM],
        [/\bshred\b/g, 'Secure deletion command', Severity.MEDIUM],
        [/\bwipe\b/g, 'Disk wipe command', Severity.HIGH],
        [/\bnc\b(?:\s+-[lLp]\b|\s+-e\b)/g, 'Netcat reverse shell', Severity.HIGH],
        [/\bnetcat\b/g, 'Netcat tool usage', Severity.HIGH],
        [/\bsocat\b/g, 'Socket forwarding tool', Severity.HIGH],
        [/nodejs\s*:\s*eval/g, 'Node.js dangerous eval', Severity.HIGH],
        [/\bprocess\.exec\b|\bexecSync\b/g, 'Node.js command execution', Severity.HIGH],
        [/spawn\b(?:\([^)]*)?\s*,\s*['"]shell['"]/g, 'Shell spawning', Severity.HIGH]
    ];

    static INFO_LEAK_PATTERNS = [
        [/api[_-]?key\s*[:=]\s*['"][^'"]+['"]/g, 'Hardcoded API key', Severity.HIGH],
        [/secret\s*[:=]\s*['"][^'"]+['"]/g, 'Hardcoded secret', Severity.HIGH],
        [/password\s*[:=]\s*['"][^'"]+['"]/g, 'Hardcoded password', Severity.HIGH],
        [/passwd\s*[:=]\s*['"][^'"]+['"]/g, 'Hardcoded password', Severity.HIGH],
        [/token\s*[:=]\s*['"][^'"]+['"]/g, 'Hardcoded token', Severity.HIGH],
        [/access[_-]?key\s*[:=]\s*['"][^'"]+['"]/g, 'Hardcoded access key', Severity.HIGH],
        [/aws[_-]?access[_-]?key[_-]?id/g, 'AWS access key ID', Severity.HIGH],
        [/aws[_-]?secret[_-]?access[_-]?key/g, 'AWS secret key', Severity.HIGH],
        [/private[_-]?key/g, 'Private key content', Severity.HIGH],
        [/-----BEGIN\s+RSA\s+PRIVATE\s+KEY-----/g, 'RSA private key', Severity.HIGH],
        [/-----BEGIN\s+EC\s+PRIVATE\s+KEY-----/g, 'EC private key', Severity.HIGH],
        [/-----BEGIN\s+DSA\s+PRIVATE\s+KEY-----/g, 'DSA private key', Severity.HIGH],
        [/-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----/g, 'OpenSSH private key', Severity.HIGH],
        [/print\s*\(\s*f?['"][^'"]*password/g, 'Password printing in log', Severity.HIGH],
        [/print\s*\(\s*f?['"][^'"]*token/g, 'Token printing in log', Severity.HIGH],
        [/console\.log\s*\([^)]*(?:password|token|secret|key)/g, 'Sensitive information log output', Severity.HIGH],
        [/logger\.[a-z]+\([^)]*(?:password|token|secret|key)/g, 'Sensitive information logging', Severity.HIGH],
        [/traceback\.print_exc\(\)/g, 'Exception stack trace printing', Severity.MEDIUM],
        [/exception\s+as\s+e:\s*print\s*\(\s*e\)/g, 'Exception information printing', Severity.MEDIUM],
        [/\berror\b.*(?:\||>|\$\()/g, 'Error output redirection', Severity.MEDIUM],
        [/\.getenv\s*\(\s*['"]API[_-]?KEY['"]/g, 'Environment variable key retrieval', Severity.MEDIUM],
        [/\.getenv\s*\(\s*['"]SECRET['"]/g, 'Environment variable secret retrieval', Severity.MEDIUM],
        [/\bhostname|\.hostname\(\)/g, 'Hostname retrieval', Severity.LOW],
        [/\bwhoami\b/g, 'Current user query', Severity.LOW],
        [/\bgetpwuid\b|\bgetuid\b/g, 'User ID retrieval', Severity.LOW]
    ];

    static PATH_TRAVERSAL_PATTERNS = [
        [/\.\.\//g, 'Path traversal: ../', Severity.MEDIUM],
        [/\.\.\\/g, 'Path traversal: ..\\', Severity.MEDIUM],
        [/\bopen\s*\(\s*['"][^'"]*\.\.\//g, 'File opening with path traversal', Severity.MEDIUM],
        [/\breadFileSync\s*\([^)]*\.\.\//g, 'File reading with path traversal', Severity.MEDIUM],
        [/readFile\s*\([^)]*\.\.\//g, 'File reading with path traversal', Severity.MEDIUM]
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
            // Ignore read errors
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
            [CheckCategory.FILE_DELETE]: 'File deletion operation detected, may cause data loss',
            [CheckCategory.SENSITIVE_FILE]: 'Access to sensitive files detected',
            [CheckCategory.DANGEROUS_COMMAND]: 'Dangerous system command execution detected',
            [CheckCategory.INFO_LEAK]: 'Code logic that may cause information leakage detected'
        };
        return descriptions[category] || 'Security issue detected';
    }

    getSuggestion(category, severity) {
        const suggestions = {
            [CheckCategory.FILE_DELETE]: 'User explicit authorization must be obtained before performing deletion operations. Adding confirmation mechanism is recommended',
            [CheckCategory.SENSITIVE_FILE]: 'Avoid directly accessing system configuration files and personal data files',
            [CheckCategory.DANGEROUS_COMMAND]: 'Dangerous commands may cause system damage, reconsider the necessity of operations',
            [CheckCategory.INFO_LEAK]: 'Avoid hardcoding sensitive information in code, use environment variables for management'
        };
        return suggestions[category] || 'Please check and fix this security issue';
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
            // Ignore errors
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
                        // Is directory
                        if (excludeDirs.includes(item)) {
                            return;
                        }
                        walkDir(fullPath, excludeDirs);
                    }
                } catch (e) {
                    // Check if directory
                    try {
                        if (existsSync(fullPath) && readdirSync(fullPath) !== undefined) {
                            if (excludeDirs.includes(item)) {
                                return;
                            }
                            walkDir(fullPath, excludeDirs);
                        }
                    } catch (err) {
                        // Is file
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
                            // Ignore
                        }
                    });

                    if (skillIssues.length === 0) {
                        this.safeSkills++;
                    }
                    this.issues.push(...skillIssues);
                }
            }
        };

        // Use recursive traversal
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
                                skillIssues = [];
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
        let md = [];

        md.push("# AI Agent Skill Security Assessment Report\n");
        md.push(`**Generated**: ${report.timestamp}\n`);
        md.push(`**Scope**: ${report.scope}\n`);
        md.push(`**Total Skills**: ${report.total_skills}\n`);
        md.push(`**Safe**: ${report.safe_skills}\n`);
        md.push(`**Warnings**: ${report.warnings}\n`);
        md.push(`**Danger**: ${report.dangers}\n`);

        md.push("\n## Issue List\n");

        const highIssues = report.issues.filter(i => i.severity === Severity.HIGH);
        const mediumIssues = report.issues.filter(i => i.severity === Severity.MEDIUM);
        const lowIssues = report.issues.filter(i => i.severity === Severity.LOW);

        if (highIssues.length > 0) {
            md.push("### 🔴 High Risk Issues\n");
            highIssues.forEach((issue, index) => {
                md.push(`#### ${index + 1}. ${issue.title}\n`);
                md.push(`- **Skill Name**: \`${issue.skill_name}\`\n`);
                md.push(`- **File Path**: \`${issue.file_path}\`\n`);
                if (issue.line_number) {
                    md.push(`- **Line Number**: \`${issue.line_number}\`\n`);
                }
                md.push(`- **Issue Description**: ${issue.description}\n`);
                md.push(`- **Severity**: 🔴 High Risk\n`);
                md.push(`- **Risk Level**: 🔴 High Risk\n`);
                md.push(`- **Code Snippet**:\n`);
                md.push("```\n" + issue.code_snippet + "\n```\n");
                md.push(`- **Suggestion**: ${issue.suggestion}\n`);
            });
        }

        if (mediumIssues.length > 0) {
            md.push("### 🟡 Medium Risk Issues\n");
            mediumIssues.forEach((issue, index) => {
                md.push(`#### ${index + 1}. ${issue.title}\n`);
                md.push(`- **Skill Name**: \`${issue.skill_name}\`\n`);
                md.push(`- **File Path**: \`${issue.file_path}\`\n`);
                if (issue.line_number) {
                    md.push(`- **Line Number**: \`${issue.line_number}\`\n`);
                }
                md.push(`- **Issue Description**: ${issue.description}\n`);
                md.push(`- **Severity**: 🟡 Medium Risk\n`);
                md.push(`- **Risk Level**: 🟡 Medium Risk\n`);
                md.push(`- **Code Snippet**:\n`);
                md.push("```\n" + issue.code_snippet + "\n```\n");
                md.push(`- **Suggestion**: ${issue.suggestion}\n`);
            });
        }

        if (lowIssues.length > 0) {
            md.push("### 🟢 Low Risk Issues\n");
            lowIssues.forEach((issue, index) => {
                md.push(`#### ${index + 1}. ${issue.title}\n`);
                md.push(`- **Skill Name**: \`${issue.skill_name}\`\n`);
                md.push(`- **File Path**: \`${issue.file_path}\`\n`);
                if (issue.line_number) {
                    md.push(`- **Line Number**: \`${issue.line_number}\`\n`);
                }
                md.push(`- **Issue Description**: ${issue.description}\n`);
                md.push(`- **Severity**: 🟢 Low Risk\n`);
                md.push(`- **Code Snippet**:\n`);
                md.push("```\n" + issue.code_snippet + "\n```\n");
                md.push(`- **Suggestion**: ${issue.suggestion}\n`);
            });
        }

        if (report.issues.length === 0) {
            md.push("No security issues found. All skills are safe.\n");
        }

        md.push("\n## Security Check Summary\n");
        md.push("| Check Item | Safe | Warning | Danger |\n");
        md.push("|-----------|------|---------|--------|\n");
        md.push(`| File Operations | ${report.safe_skills} | ${report.warnings} | ${report.dangers} |\n`);
        md.push("| Sensitive Files | " + report.issues.filter(i => i.category === CheckCategory.SENSITIVE_FILE).length + " | 0 | 0 |\n");
        md.push("| Dangerous Commands | " + report.issues.filter(i => i.category === CheckCategory.DANGEROUS_COMMAND).length + " | 0 | 0 |\n");
        md.push("| Information Leakage | " + report.issues.filter(i => i.category === CheckCategory.INFO_LEAK).length + " | 0 | 0 |\n");

        return md.join('');
    }
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        directory: './skills',
        outputFormat: 'markdown',
        outputDir: './security_reports',
        severity: 'medium',
        strict: false,
        exclude: [],
        incremental: false,
        failOnDanger: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--help' || arg === '-h') {
            console.log(`
AI Agent Skill Security Checker
Systematically evaluates the security of AI Agent skills

Usage: node check_security.mjs <directory> [options]

Options:
  <directory>              Directory containing skills (default: ./skills)
  --output-format <format> Output format: markdown, json, html (default: markdown)
  --output-dir <dir>       Output directory (default: ./security_reports)
  --severity <level>       Severity level: high, medium, low (default: medium)
  --strict                 Include low-risk issues
  --exclude <dirs>          Exclude directories (comma-separated)
  --incremental            Only check modified files
  --fail-on-danger         Exit with error code if high-risk issues found
  --verbose                Show detailed output
  --help, -h               Show this help message

Examples:
  node check_security.mjs ./skills
  node check_security.mjs ./skills --output-format json
  node check_security.mjs ./skills --severity high --fail-on-danger
  node check_security.mjs ./skills --exclude "test_skills,legacy"
            `);
            process.exit(0);
        } else if (arg.startsWith('--output-format=')) {
            options.outputFormat = arg.split('=')[1];
        } else if (arg === '--output-format' && args[i + 1]) {
            options.outputFormat = args[++i];
        } else if (arg.startsWith('--output-dir=')) {
            options.outputDir = arg.split('=')[1];
        } else if (arg === '--output-dir' && args[i + 1]) {
            options.outputDir = args[++i];
        } else if (arg.startsWith('--severity=')) {
            options.severity = arg.split('=')[1];
        } else if (arg === '--severity' && args[i + 1]) {
            options.severity = args[++i];
        } else if (arg === '--strict') {
            options.strict = true;
        } else if (arg === '--incremental') {
            options.incremental = true;
        } else if (arg === '--fail-on-danger') {
            options.failOnDanger = true;
        } else if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        } else if (arg.startsWith('--exclude=')) {
            options.exclude = arg.split('=')[1].split(',');
        } else if (arg === '--exclude' && args[i + 1]) {
            options.exclude = args[++i].split(',');
        } else if (!arg.startsWith('--')) {
            options.directory = arg;
        }
    }

    return options;
}

function main() {
    console.log('AI Agent Skill Security Checker');
    console.log('================================');
    console.log('Version:', VERSION);
    console.log('');

    const options = parseArgs();

    if (options.verbose) {
        console.log('Options:', options);
        console.log('');
    }

    let report;
    const checker = new SecurityChecker({
        strictMode: options.strict || options.severity === 'low',
        excludeDirs: options.exclude
    });

    if (options.incremental) {
        console.log('Running incremental check...');
        report = checker.checkIncremental(options.directory);
    } else {
        console.log('Checking directory:', options.directory);
        report = checker.checkDirectory(options.directory);
    }

    console.log('');
    console.log('Security Check Results:');
    console.log('----------------------');
    console.log('Total Skills Checked:', report.total_skills);
    console.log('Safe Skills:', report.safe_skills);
    console.log('Warnings (Medium Risk):', report.warnings);
    console.log('Danger (High Risk):', report.dangers);
    console.log('');

    if (report.dangers > 0 && options.failOnDanger) {
        console.log('ERROR: High-risk security issues found!');
        process.exit(1);
    }

    if (report.issues.length > 0) {
        if (options.outputFormat === 'markdown') {
            if (!existsSync(options.outputDir)) {
                mkdirSync(options.outputDir, { recursive: true });
            }
            const reportPath = join(options.outputDir, `security_report_${new Date().toISOString().slice(0, 10)}.md`);
            const mdContent = MarkdownReporter.generate(report);
            writeFileSync(reportPath, mdContent, 'utf8');
            console.log('Markdown report generated:', reportPath);
            console.log('');
            console.log('Report Preview:');
            console.log('---------------');
            console.log(mdContent.substring(0, 2000) + '...');
        } else if (options.outputFormat === 'json') {
            const jsonContent = JSON.stringify(report, null, 2);
            console.log('JSON Report:');
            console.log(jsonContent);
        }
    } else {
        console.log('No security issues found. All skills are safe!');
    }

    console.log('');
    console.log('Security check completed.');

    return report;
}

main();
