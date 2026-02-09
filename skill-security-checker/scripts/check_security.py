#!/usr/bin/env python3
"""
AI Agent Skill Security Checker
系统性评估AI Agent技能的安全性
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum
import re


class Severity(Enum):
    """问题严重程度"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CheckCategory(Enum):
    """检查类别"""
    FILE_DELETE = "file_delete"
    SENSITIVE_FILE = "sensitive_file"
    DANGEROUS_COMMAND = "dangerous_command"
    INFO_LEAK = "info_leak"


@dataclass
class SecurityIssue:
    """安全问题数据类"""
    skill_name: str
    file_path: str
    category: CheckCategory
    severity: Severity
    title: str
    description: str
    code_snippet: str
    suggestion: str
    line_number: Optional[int] = None


@dataclass
class SecurityReport:
    """安全报告数据类"""
    timestamp: str
    scope: str
    total_skills: int
    safe_skills: int
    warnings: int
    dangers: int
    issues: List[SecurityIssue] = field(default_factory=list)


class SecurityPattern:
    """安全检查模式库"""
    
    # 文件删除相关模式
    FILE_DELETE_PATTERNS = [
        (r'\brm\s+-rf\b', '危险删除命令: rm -rf', Severity.HIGH),
        (r'\brm\s+-r\b', '递归删除命令: rm -r', Severity.MEDIUM),
        (r'\brm\b(?!\s+-rf|\s+-r)', '文件删除命令: rm', Severity.MEDIUM),
        (r'\bshutil\.rmtree\b', '目录删除: shutil.rmtree()', Severity.HIGH),
        (r'\bos\.remove\b', '文件删除: os.remove()', Severity.MEDIUM),
        (r'\bos\.unlink\b', '文件删除: os.unlink()', Severity.MEDIUM),
        (r'\bdel\b(?!\.*\s*\[)', '删除操作: del关键字', Severity.LOW),
        (r'\bdel\b(?:\s*/[sq]+\b|\s*/p\b|\s*/f\b)', 'Windows删除命令: del', Severity.MEDIUM),
        (r'\brmdir\b(?:\s*/[sq]+\b)?', '目录删除: rmdir', Severity.MEDIUM),
        (r'\bformat\b', '磁盘格式化命令', Severity.HIGH),
        (r'\bmkfs\b', '文件系统格式化命令', Severity.HIGH),
        (r'\bdd\s+if=/dev/zero\b', '危险磁盘写入命令', Severity.HIGH),
    ]
    
    # 敏感文件路径模式
    SENSITIVE_FILE_PATTERNS = [
        (r'\.ssh/', 'SSH密钥目录访问', Severity.HIGH),
        (r'\.aws/', 'AWS配置目录访问', Severity.HIGH),
        (r'\.git/', 'Git配置访问', Severity.LOW),
        (r'\.bashrc', 'Shell配置文件访问', Severity.HIGH),
        (r'\.bash_profile', 'Shell配置文件访问', Severity.HIGH),
        (r'\.zshrc', 'Zsh配置文件访问', Severity.HIGH),
        (r'\.profile', '系统配置文件访问', Severity.HIGH),
        (r'/etc/passwd', '系统密码文件访问', Severity.HIGH),
        (r'/etc/shadow', '系统影子密码文件访问', Severity.HIGH),
        (r'/etc/sudoers', 'Sudoers配置访问', Severity.HIGH),
        (r'\.env', '环境变量文件访问', Severity.HIGH),
        (r'\.keystore', '密钥库文件访问', Severity.HIGH),
        (r'\.jks', 'Java密钥库文件访问', Severity.HIGH),
        (r'\.p12', '证书文件访问', Severity.HIGH),
        (r'\.pfx', '证书文件访问', Severity.HIGH),
        (r'passwords?\.(txt|json|yaml|yml)', '密码文件访问', Severity.HIGH),
        (r'credentials\.(txt|json|yaml|yml)', '凭证文件访问', Severity.HIGH),
        (r'api[_-]?keys?\.(txt|json|yaml|yml)', 'API密钥文件访问', Severity.HIGH),
        (r'tokens?\.(txt|json|yaml|yml)', '令牌文件访问', Severity.HIGH),
        (r'secrets?\.(txt|json|yaml|yml)', '密钥文件访问', Severity.HIGH),
        (r'/root/', 'Root目录访问', Severity.HIGH),
        (r'/home/[^\/]+/', '用户主目录访问', Severity.MEDIUM),
        (r'/var/log/', '日志目录访问', Severity.MEDIUM),
        (r'/proc/', '系统进程信息访问', Severity.MEDIUM),
        (r'/sys/', '系统内核信息访问', Severity.MEDIUM),
    ]
    
    # 危险命令模式
    DANGEROUS_COMMAND_PATTERNS = [
        (r'\bsudo\b(?!\s+(?:-i|-\w*\s))', '普通sudo命令', Severity.MEDIUM),
        (r'\bsudo\s+su\b', '提权命令: sudo su', Severity.HIGH),
        (r'\bchmod\s+777\b', '危险权限设置: chmod 777', Severity.HIGH),
        (r'\bchmod\s+0\b', '危险权限设置: chmod 0', Severity.HIGH),
        (r'\bchown\b(?:\s+root|\s+[^\s]+\s+[^\s]+)', '所有权修改命令', Severity.MEDIUM),
        (r'\bmkdir\s+.*&&.*cd\b', '创建目录并进入', Severity.LOW),
        (r'\bcurl\b.*(?:\||>|\$\()', '命令管道重定向', Severity.MEDIUM),
        (r'\bwget\b.*(?:\||>|\$\()', '命令管道重定向', Severity.MEDIUM),
        (r'\beval\b', '危险命令: eval', Severity.HIGH),
        (r'\bexec\b', '命令执行: exec', Severity.MEDIUM),
        (r'\bsystem\b', '系统命令执行', Severity.MEDIUM),
        (r'\bpopen\b', '进程管道打开', Severity.MEDIUM),
        (r'\bsubprocess\b(?!\s*\([^)]*(?:shell=False|check=False))', '子进程执行', Severity.MEDIUM),
        (r'\bexecvp\b|\bexecvpe\b', '危险exec调用', Severity.HIGH),
        (r'\bfork\b(?:\s*\(|\s*;)', '进程fork操作', Severity.MEDIUM),
        (r'\bpkill\b|\bkillall\b', '进程终止命令', Severity.MEDIUM),
        (r'\bkill\s+-9\b', '强制终止进程', Severity.MEDIUM),
        (r'\bcrontab\b(?:\s+-r|\s+-e)', '定时任务修改', Severity.HIGH),
        (r'\bservice\b\s+(\w+)\s+stop', '服务停止命令', Severity.MEDIUM),
        (r'\bsystemctl\b(?:\s+stop|\s+disable)', '系统服务控制', Severity.MEDIUM),
        (r'\biptables\b', '防火墙配置修改', Severity.HIGH),
        (r'\bnfqueue\b|\bnetfilter', '网络包过滤操作', Severity.HIGH),
        (r'\bmodprobe\b|\binsmod\b|\brmmod', '内核模块操作', Severity.HIGH),
        (r'\bmount\b', '挂载操作', Severity.HIGH),
        (r'\bunmount\b|\bumount', '卸载操作', Severity.MEDIUM),
        (r'\bpasswd\b', '密码修改命令', Severity.HIGH),
        (r'\buseradd\b|\busermod\b|\buserdel', '用户管理命令', Severity.HIGH),
        (r'\bgroupadd\b|\bgroupmod\b|\bgroupdel', '组管理命令', Severity.HIGH),
        (r'\bdd\b(?!\s+if=/dev/urandom)', '数据复制命令', Severity.MEDIUM),
        (r'\bshred\b', '安全删除命令', Severity.MEDIUM),
        (r'\bwipe\b', '磁盘擦除命令', Severity.HIGH),
        (r'\bnc\b(?:\s+-[lLp]\b|\s+-e\b)', 'Netcat反向shell', Severity.HIGH),
        (r'\bnetcat\b', 'Netcat工具使用', Severity.HIGH),
        (r'\bsocat\b', 'Socket转发工具', Severity.HIGH),
        (r'\bnodejs\s*:\s*eval\b', 'Node.js危险eval', Severity.HIGH),
        (r'\bprocess\.exec\b|\bexecSync\b', 'Node.js命令执行', Severity.HIGH),
        (r'\bspawn\b(?:\([^)]*)?\s*,\s*[\'"]shell[\'"]', 'Shell spawning', Severity.HIGH),
    ]
    
    # 信息泄露模式
    INFO_LEAK_PATTERNS = [
        (r'api[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]', '硬编码API密钥', Severity.HIGH),
        (r'secret\s*[:=]\s*[\'"][^\'"]+[\'"]', '硬编码密钥', Severity.HIGH),
        (r'password\s*[:=]\s*[\'"][^\'"]+[\'"]', '硬编码密码', Severity.HIGH),
        (r'passwd\s*[:=]\s*[\'"][^\'"]+[\'"]', '硬编码密码', Severity.HIGH),
        (r'token\s*[:=]\s*[\'"][^\'"]+[\'"]', '硬编码令牌', Severity.HIGH),
        (r'access[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]', '硬编码访问密钥', Severity.HIGH),
        (r'aws[_-]?access[_-]?key[_-]?id', 'AWS访问密钥ID', Severity.HIGH),
        (r'aws[_-]?secret[_-]?access[_-]?key', 'AWS密钥', Severity.HIGH),
        (r'private[_-]?key', '私钥内容', Severity.HIGH),
        (r'-----BEGIN\s+RSA\s+PRIVATE\s+KEY-----', 'RSA私钥', Severity.HIGH),
        (r'-----BEGIN\s+EC\s+PRIVATE\s+KEY-----', 'EC私钥', Severity.HIGH),
        (r'-----BEGIN\s+DSA\s+PRIVATE\s+KEY-----', 'DSA私钥', Severity.HIGH),
        (r'-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----', 'OpenSSH私钥', Severity.HIGH),
        (r'print\s*\(\s*f?[\'"].*password', '密码打印日志', Severity.HIGH),
        (r'print\s*\(\s*f?[\'"].*token', '令牌打印日志', Severity.HIGH),
        (r'console\.log\s*\([^)]*(?:password|token|secret|key)', '敏感信息日志输出', Severity.HIGH),
        (r'logger\.[a-z]+\([^)]*(?:password|token|secret|key)', '敏感信息记录', Severity.HIGH),
        (r'traceback\.print_exc\(\)', '异常堆栈打印', Severity.MEDIUM),
        (r'exception\s+as\s+e:\s+print\s*\(\s*e\)', '异常信息打印', Severity.MEDIUM),
        (r'\berror\b.*(?:\||>|\$\()', '错误输出重定向', Severity.MEDIUM),
        (r'request\.headers\[[\'"]Authorization[\'"]\]', '认证头访问', Severity.MEDIUM),
        (r'\.getenv\s*\(\s*[\'"]API[_-]?KEY[\'"]', '环境变量密钥获取', Severity.MEDIUM),
        (r'\.getenv\s*\(\s*[\'"]SECRET[\'"]', '环境变量密钥获取', Severity.MEDIUM),
        (r'hostname|\.hostname\(\)', '主机名获取', Severity.LOW),
        (r'\bwhoami\b', '当前用户查询', Severity.LOW),
        (r'\bgetpwuid\b|\bgetuid\b', '用户ID获取', Severity.LOW),
    ]
    
    # 路径遍历模式
    PATH_TRAVERSAL_PATTERNS = [
        (r'\.\./', '路径遍历: ../', Severity.MEDIUM),
        (r'\.\.\\', '路径遍历: ..\\', Severity.MEDIUM),
        (r'\bopen\s*\(\s*[\'"][^\'"]*\.\./', '文件打开包含路径遍历', Severity.MEDIUM),
        (r'\breadFileSync\s*\([^)]*\.\./', '文件读取包含路径遍历', Severity.MEDIUM),
        (r'readFile\s*\([^)]*\.\./', '文件读取包含路径遍历', Severity.MEDIUM),
    ]


class SecurityChecker:
    """安全检查器主类"""
    
    def __init__(self, strict_mode: bool = False, exclude_dirs: Optional[List[str]] = None):
        self.strict_mode = strict_mode
        self.exclude_dirs = exclude_dirs or []
        self.issues: List[SecurityIssue] = []
        self.skills_checked = 0
        self.safe_skills = 0
        self.report = SecurityReport(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            scope="",
            total_skills=0,
            safe_skills=0,
            warnings=0,
            dangers=0
        )
        
    def check_file(self, file_path: str, skill_name: str) -> List[SecurityIssue]:
        """检查单个文件的安全性"""
        issues = []
        file_ext = Path(file_path).suffix.lower()
        
        # 检查所有文本文件类型，包括.md文件
        if file_ext in ['.py', '.js', '.ts', '.sh', '.bash', '.zsh', '.ps1', '.md', '.txt', '.json', '.yaml', '.yml']:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    lines = content.split('\n')
                    
                for line_num, line in enumerate(lines, 1):
                    line_issues = self._check_line(line, file_path, skill_name, line_num)
                    issues.extend(line_issues)
                    
            except Exception as e:
                pass
                
        return issues
    
    def _check_line(self, line: str, file_path: str, skill_name: str, 
                   line_number: int) -> List[SecurityIssue]:
        """检查单行代码"""
        issues = []
        
        # 检查所有模式类别
        patterns_to_check = [
            (SecurityPattern.FILE_DELETE_PATTERNS, CheckCategory.FILE_DELETE),
            (SecurityPattern.SENSITIVE_FILE_PATTERNS, CheckCategory.SENSITIVE_FILE),
            (SecurityPattern.DANGEROUS_COMMAND_PATTERNS, CheckCategory.DANGEROUS_COMMAND),
            (SecurityPattern.INFO_LEAK_PATTERNS, CheckCategory.INFO_LEAK),
            (SecurityPattern.PATH_TRAVERSAL_PATTERNS, CheckCategory.FILE_DELETE),
        ]
        
        for patterns, category in patterns_to_check:
            for pattern, description, severity in patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    if self._should_report(severity):
                        issue = self._create_issue(
                            skill_name, file_path, category, severity,
                            description, line, line_number
                        )
                        issues.append(issue)
                        
        return issues
    
    def _should_report(self, severity: Severity) -> bool:
        """判断是否应该报告该问题"""
        if self.strict_mode:
            return True
        return severity in [Severity.HIGH, Severity.MEDIUM]
    
    def _create_issue(self, skill_name: str, file_path: str, 
                     category: CheckCategory, severity: Severity,
                     title: str, code_snippet: str, line_number: int) -> SecurityIssue:
        """创建安全问题对象"""
        description = self._get_description(category, severity)
        suggestion = self._get_suggestion(category, severity)
        
        return SecurityIssue(
            skill_name=skill_name,
            file_path=file_path,
            category=category,
            severity=severity,
            title=title,
            description=description,
            code_snippet=code_snippet.strip()[:200],
            suggestion=suggestion,
            line_number=line_number
        )
    
    def _get_description(self, category: CheckCategory, severity: Severity) -> str:
        """获取问题描述"""
        descriptions = {
            CheckCategory.FILE_DELETE: "检测到文件删除操作，可能导致数据丢失",
            CheckCategory.SENSITIVE_FILE: "检测到对敏感文件的访问操作",
            CheckCategory.DANGEROUS_COMMAND: "检测到危险系统命令执行",
            CheckCategory.INFO_LEAK: "检测到可能导致信息泄露的代码逻辑",
        }
        return descriptions.get(category, "检测到安全问题")
    
    def _get_suggestion(self, category: CheckCategory, severity: Severity) -> str:
        """获取修复建议"""
        suggestions = {
            CheckCategory.FILE_DELETE: (
                "在执行删除操作前，必须获得用户的明确授权确认。建议添加确认机制："
                "if not user_confirmed: raise PermissionError('需要用户明确授权')"
            ),
            CheckCategory.SENSITIVE_FILE: (
                "避免直接访问系统配置文件和个人数据文件。如确需访问，"
                "应明确告知用户并获得授权"
            ),
            CheckCategory.DANGEROUS_COMMAND: (
                "危险命令可能导致系统损坏。建议重新评估操作必要性，"
                "或使用更安全的方式实现相同功能"
            ),
            CheckCategory.INFO_LEAK: (
                "避免在代码中硬编码敏感信息，使用环境变量或配置管理服务。"
                "不要在日志中输出敏感数据"
            ),
        }
        return suggestions.get(category, "请检查并修复此安全问题")
    
    def check_directory(self, directory: str) -> SecurityReport:
        """检查整个目录"""
        directory = os.path.abspath(directory)
        self.report.scope = directory
        
        for root, dirs, files in os.walk(directory):
            # 排除指定目录
            dirs[:] = [d for d in dirs if d not in self.exclude_dirs]
            
            # 查找SKILL.md确定技能名称
            if 'SKILL.md' in files:
                skill_name = self._extract_skill_name(os.path.join(root, 'SKILL.md'))
                if skill_name:
                    self.skills_checked += 1
                    skill_issues = []
                    
                    for file in files:
                        file_path = os.path.join(root, file)
                        issues = self.check_file(file_path, skill_name)
                        skill_issues.extend(issues)
                    
                    if not skill_issues:
                        self.safe_skills += 1
                    
                    self.issues.extend(skill_issues)
        
        self.report.total_skills = self.skills_checked
        self.report.safe_skills = self.safe_skills
        self.report.warnings = sum(1 for i in self.issues if i.severity == Severity.MEDIUM)
        self.report.dangers = sum(1 for i in self.issues if i.severity == Severity.HIGH)
        self.report.issues = self.issues
        
        return self.report
    
    def _extract_skill_name(self, skill_md_path: str) -> Optional[str]:
        """从SKILL.md提取技能名称"""
        try:
            with open(skill_md_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.startswith('---'):
                    yaml_end = content.find('---', 3)
                    if yaml_end != -1:
                        yaml_content = content[3:yaml_end]
                        for line in yaml_content.split('\n'):
                            if line.startswith('name:'):
                                return line.split(':', 1)[1].strip()
        except Exception:
            pass
        return None
    
    def check_incremental(self, directory: str, last_commit: str = None) -> SecurityReport:
        """增量检查，只检查修改过的文件"""
        import subprocess
        
        try:
            result = subprocess.run(
                ['git', 'diff', '--name-only', last_commit or 'HEAD'],
                cwd=directory,
                capture_output=True,
                text=True
            )
            modified_files = result.stdout.strip().split('\n')
        except Exception:
            modified_files = []
        
        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in self.exclude_dirs]
            
            if 'SKILL.md' in files:
                skill_name = self._extract_skill_name(os.path.join(root, 'SKILL.md'))
                if skill_name:
                    self.skills_checked += 1
                    skill_issues = []
                    
                    for file in files:
                        file_path = os.path.join(root, file)
                        
                        # 如果是增量模式，检查文件是否被修改
                        rel_path = os.path.relpath(file_path, directory)
                        if rel_path not in modified_files:
                            continue
                        
                        issues = self.check_file(file_path, skill_name)
                        skill_issues.extend(issues)
                    
                    if not skill_issues:
                        self.safe_skills += 1
                    
                    self.issues.extend(skill_issues)
        
        return self.check_directory(directory)


class MarkdownReporter:
    """Markdown报告生成器"""
    
    @staticmethod
    def generate(report: SecurityReport) -> str:
        """生成Markdown格式的报告"""
        md = []
        
        md.append("# AI Agent 技能安全评估报告\n")
        md.append(f"**生成时间**: {report.timestamp}\n")
        md.append(f"**检查范围**: {report.scope}\n")
        md.append(f"**总计技能**: {report.total_skills}\n")
        md.append(f"**安全**: {report.safe_skills}\n")
        md.append(f"**警告**: {report.warnings}\n")
        md.append(f"**危险**: {report.dangers}\n")
        
        md.append("\n## 问题清单\n")
        
        # 按严重程度分组
        high_issues = [i for i in report.issues if i.severity == Severity.HIGH]
        medium_issues = [i for i in report.issues if i.severity == Severity.MEDIUM]
        low_issues = [i for i in report.issues if i.severity == Severity.LOW]
        
        # 高危问题
        if high_issues:
            md.append("### 🔴 高危问题\n")
            for i, issue in enumerate(high_issues, 1):
                md.append(f"#### {i}. {issue.title}\n")
                md.append(f"- **技能名称**: `{issue.skill_name}`\n")
                md.append(f"- **文件路径**: `{issue.file_path}`\n")
                if issue.line_number:
                    md.append(f"- **行号**: `{issue.line_number}`\n")
                md.append(f"- **问题描述**: {issue.description}\n")
                md.append(f"- **严重程度**: 🔴 高危\n")
                md.append(f"- **风险等级**: 🔴 高危\n")
                md.append(f"- **代码片段**:\n")
                md.append(f"```\n{issue.code_snippet}\n```\n")
                md.append(f"- **修复建议**: {issue.suggestion}\n")
                md.append("\n---\n")
        
        # 中等问题
        if medium_issues:
            md.append("### 🟡 中等问题\n")
            for i, issue in enumerate(medium_issues, 1):
                md.append(f"#### {i}. {issue.title}\n")
                md.append(f"- **技能名称**: `{issue.skill_name}`\n")
                md.append(f"- **文件路径**: `{issue.file_path}`\n")
                if issue.line_number:
                    md.append(f"- **行号**: `{issue.line_number}`\n")
                md.append(f"- **问题描述**: {issue.description}\n")
                md.append(f"- **严重程度**: 🟡 中等\n")
                md.append(f"- **风险等级**: 🟡 中等\n")
                md.append(f"- **代码片段**:\n")
                md.append(f"```\n{issue.code_snippet}\n```\n")
                md.append(f"- **修复建议**: {issue.suggestion}\n")
                md.append("\n---\n")
        
        # 低风险问题
        if low_issues:
            md.append("### 🟢 低风险问题\n")
            for i, issue in enumerate(low_issues, 1):
                md.append(f"#### {i}. {issue.title}\n")
                md.append(f"- **技能名称**: `{issue.skill_name}`\n")
                md.append(f"- **文件路径**: `{issue.file_path}`\n")
                if issue.line_number:
                    md.append(f"- **行号**: `{issue.line_number}`\n")
                md.append(f"- **问题描述**: {issue.description}\n")
                md.append(f"- **严重程度**: 🟢 低\n")
                md.append(f"- **代码片段**:\n")
                md.append(f"```\n{issue.code_snippet}\n```\n")
                md.append(f"- **修复建议**: {issue.suggestion}\n")
                md.append("\n---\n")
        
        # 统计摘要
        md.append("\n## 安全检查摘要\n")
        md.append("| 检查项目 | 安全 | 警告 | 危险 |\n")
        md.append("|---------|------|------|------|\n")
        md.append(f"| 文件操作 | {report.safe_skills} | {report.warnings} | {report.dangers} |\n")
        
        return ''.join(md)


def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='AI Agent Skill Security Checker - 系统性评估AI Agent技能的安全性'
    )
    parser.add_argument('directory', nargs='?', default='./skills',
                        help='要检查的技能目录（默认: ./skills）')
    parser.add_argument('--output-dir', '-o', default='./security_reports',
                        help='报告输出目录（默认: ./security_reports）')
    parser.add_argument('--strict', '-s', action='store_true',
                        help='严格模式，包含低风险问题')
    parser.add_argument('--exclude', '-e', default='',
                        help='排除的目录，用逗号分隔')
    parser.add_argument('--incremental', '-i', action='store_true',
                        help='增量检查模式')
    parser.add_argument('--format', '-f', default='markdown',
                        choices=['markdown', 'json'],
                        help='输出格式')
    parser.add_argument('--severity', '-v', default=None,
                        choices=['high', 'medium', 'low'],
                        help='仅显示指定严重程度的问题')
    
    return parser.parse_args()


def main():
    """主函数"""
    args = parse_args()
    
    exclude_dirs = args.exclude.split(',') if args.exclude else []
    
    checker = SecurityChecker(strict_mode=args.strict, exclude_dirs=exclude_dirs)
    
    if args.incremental:
        report = checker.check_incremental(args.directory)
    else:
        report = checker.check_directory(args.directory)
    
    # 过滤指定严重程度的问题
    if args.severity:
        severity_map = {
            'high': Severity.HIGH,
            'medium': Severity.MEDIUM,
            'low': Severity.LOW
        }
        target_severity = severity_map[args.severity]
        report.issues = [i for i in report.issues if i.severity == target_severity]
    
    # 生成报告
    if args.format == 'markdown':
        report_content = MarkdownReporter.generate(report)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f'ai_agent_skill_security_report_{timestamp}.md'
    else:
        report_content = json.dumps({
            'timestamp': report.timestamp,
            'scope': report.scope,
            'total_skills': report.total_skills,
            'safe_skills': report.safe_skills,
            'warnings': report.warnings,
            'dangers': report.dangers,
            'issues': [
                {
                    'skill_name': i.skill_name,
                    'file_path': i.file_path,
                    'category': i.category.value,
                    'severity': i.severity.value,
                    'title': i.title,
                    'description': i.description,
                    'code_snippet': i.code_snippet,
                    'suggestion': i.suggestion,
                    'line_number': i.line_number
                }
                for i in report.issues
            ]
        }, ensure_ascii=False, indent=2)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f'ai_agent_skill_security_report_{timestamp}.json'
    
    # 保存报告
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    # 打印摘要
    print(f"\n安全检查完成！")
    print(f"总计技能: {report.total_skills}")
    print(f"安全: {report.safe_skills}")
    print(f"警告: {report.warnings}")
    print(f"危险: {report.dangers}")
    print(f"\n报告已保存至: {output_path}")
    
    return 0 if report.dangers == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
