#!/usr/bin/env python3
"""
AI Agent Skill Security Checker
Systematically evaluates the security of AI Agent skills
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
    """Issue severity levels"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CheckCategory(Enum):
    """Check categories"""
    FILE_DELETE = "file_delete"
    SENSITIVE_FILE = "sensitive_file"
    DANGEROUS_COMMAND = "dangerous_command"
    INFO_LEAK = "info_leak"


@dataclass
class SecurityIssue:
    """Security issue data class"""
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
    """Security report data class"""
    timestamp: str
    scope: str
    total_skills: int
    safe_skills: int
    warnings: int
    dangers: int
    issues: List[SecurityIssue] = field(default_factory=list)


class SecurityPattern:
    """Security check pattern library"""
    
    # File deletion related patterns
    FILE_DELETE_PATTERNS = [
        (r'\brm\s+-rf\b', 'Dangerous deletion command: rm -rf', Severity.HIGH),
        (r'\brm\s+-r\b', 'Recursive deletion command: rm -r', Severity.MEDIUM),
        (r'\brm\b(?!\s+-rf|\s+-r)', 'File deletion command: rm', Severity.MEDIUM),
        (r'\bshutil\.rmtree\b', 'Directory deletion: shutil.rmtree()', Severity.HIGH),
        (r'\bos\.remove\b', 'File deletion: os.remove()', Severity.MEDIUM),
        (r'\bos\.unlink\b', 'File deletion: os.unlink()', Severity.MEDIUM),
        (r'\bdel\b(?!\.*\s*\[)', 'Deletion operation: del keyword', Severity.LOW),
        (r'\bdel\b(?:\s*/[sq]+\b|\s*/p\b|\s*/f\b)', 'Windows deletion command: del', Severity.MEDIUM),
        (r'\brmdir\b(?:\s*/[sq]+\b)?', 'Directory deletion: rmdir', Severity.MEDIUM),
        (r'\bformat\b', 'Disk formatting command', Severity.HIGH),
        (r'\bmkfs\b', 'Filesystem formatting command', Severity.HIGH),
        (r'\bdd\s+if=/dev/zero\b', 'Dangerous disk writing command', Severity.HIGH),
    ]
    
    # Sensitive file path patterns
    SENSITIVE_FILE_PATTERNS = [
        (r'\.ssh/', 'SSH key directory access', Severity.HIGH),
        (r'\.aws/', 'AWS configuration directory access', Severity.HIGH),
        (r'\.git/', 'Git configuration access', Severity.LOW),
        (r'\.bashrc', 'Shell configuration file access', Severity.HIGH),
        (r'\.bash_profile', 'Shell configuration file access', Severity.HIGH),
        (r'\.zshrc', 'Zsh configuration file access', Severity.HIGH),
        (r'\.profile', 'System configuration file access', Severity.HIGH),
        (r'/etc/passwd', 'System password file access', Severity.HIGH),
        (r'/etc/shadow', 'System shadow password file access', Severity.HIGH),
        (r'/etc/sudoers', 'Sudoers configuration access', Severity.HIGH),
        (r'\.env', 'Environment variable file access', Severity.HIGH),
        (r'\.keystore', 'Keystore file access', Severity.HIGH),
        (r'\.jks', 'Java keystore file access', Severity.HIGH),
        (r'\.p12', 'Certificate file access', Severity.HIGH),
        (r'\.pfx', 'Certificate file access', Severity.HIGH),
        (r'passwords?\.(txt|json|yaml|yml)', 'Password file access', Severity.HIGH),
        (r'credentials\.(txt|json|yaml|yml)', 'Credential file access', Severity.HIGH),
        (r'api[_-]?keys?\.(txt|json|yaml|yml)', 'API key file access', Severity.HIGH),
        (r'tokens?\.(txt|json|yaml|yml)', 'Token file access', Severity.HIGH),
        (r'secrets?\.(txt|json|yaml|yml)', 'Secret file access', Severity.HIGH),
        (r'/root/', 'Root directory access', Severity.HIGH),
        (r'/home/[^\/]+/', 'User home directory access', Severity.MEDIUM),
        (r'/var/log/', 'Log directory access', Severity.MEDIUM),
        (r'/proc/', 'System process information access', Severity.MEDIUM),
        (r'/sys/', 'System kernel information access', Severity.MEDIUM),
    ]
    
    # Dangerous command patterns
    DANGEROUS_COMMAND_PATTERNS = [
        (r'\bsudo\b(?!\s+(?:-i|-\w*\s))', 'Regular sudo command', Severity.MEDIUM),
        (r'\bsudo\s+su\b', 'Privilege escalation command: sudo su', Severity.HIGH),
        (r'\bchmod\s+777\b', 'Dangerous permission setting: chmod 777', Severity.HIGH),
        (r'\bchmod\s+0\b', 'Dangerous permission setting: chmod 0', Severity.HIGH),
        (r'\bchown\b(?:\s+root|\s+[^\s]+\s+[^\s]+)', 'Ownership modification command', Severity.MEDIUM),
        (r'\bmkdir\s+.*&&.*cd\b', 'Create directory and enter', Severity.LOW),
        (r'\bcurl\b.*(?:\||>|\$\()', 'Command pipe redirection', Severity.MEDIUM),
        (r'\bwget\b.*(?:\||>|\$\()', 'Command pipe redirection', Severity.MEDIUM),
        (r'\beval\b', 'Dangerous command: eval', Severity.HIGH),
        (r'\bexec\b', 'Command execution: exec', Severity.MEDIUM),
        (r'\bsystem\b', 'System command execution', Severity.MEDIUM),
        (r'\bpopen\b', 'Process pipe opening', Severity.MEDIUM),
        (r'\bsubprocess\b(?!\s*\([^)]*(?:shell=False|check=False))', 'Subprocess execution', Severity.MEDIUM),
        (r'\bexecvp\b|\bexecvpe\b', 'Dangerous exec call', Severity.HIGH),
        (r'\bfork\b(?:\s*\(|\s*;)', 'Process fork operation', Severity.MEDIUM),
        (r'\bpkill\b|\bkillall\b', 'Process termination command', Severity.MEDIUM),
        (r'\bkill\s+-9\b', 'Force terminate process', Severity.MEDIUM),
        (r'\bcrontab\b(?:\s+-r|\s+-e)', 'Scheduled task modification', Severity.HIGH),
        (r'\bservice\b\s+(\w+)\s+stop', 'Service stop command', Severity.MEDIUM),
        (r'\bsystemctl\b(?:\s+stop|\s+disable)', 'System service control', Severity.MEDIUM),
        (r'\biptables\b', 'Firewall configuration modification', Severity.HIGH),
        (r'\bnfqueue\b|\bnetfilter', 'Network packet filtering operation', Severity.HIGH),
        (r'\bmodprobe\b|\binsmod\b|\brmmod', 'Kernel module operation', Severity.HIGH),
        (r'\bmount\b', 'Mount operation', Severity.HIGH),
        (r'\bunmount\b|\bumount', 'Unmount operation', Severity.MEDIUM),
        (r'\bpasswd\b', 'Password modification command', Severity.HIGH),
        (r'\buseradd\b|\busermod\b|\buserdel', 'User management command', Severity.HIGH),
        (r'\bgroupadd\b|\bgroupmod\b|\bgroupdel', 'Group management command', Severity.HIGH),
        (r'\bdd\b(?!\s+if=/dev/urandom)', 'Data copy command', Severity.MEDIUM),
        (r'\bshred\b', 'Secure deletion command', Severity.MEDIUM),
        (r'\bwipe\b', 'Disk wipe command', Severity.HIGH),
        (r'\bnc\b(?:\s+-[lLp]\b|\s+-e\b)', 'Netcat reverse shell', Severity.HIGH),
        (r'\bnetcat\b', 'Netcat tool usage', Severity.HIGH),
        (r'\bsocat\b', 'Socket forwarding tool', Severity.HIGH),
        (r'\bnodejs\s*:\s*eval\b', 'Node.js dangerous eval', Severity.HIGH),
        (r'\bprocess\.exec\b|\bexecSync\b', 'Node.js command execution', Severity.HIGH),
        (r'\bspawn\b(?:\([^)]*)?\s*,\s*[\'"]shell[\'"]', 'Shell spawning', Severity.HIGH),
    ]
    
    # Information leakage patterns
    INFO_LEAK_PATTERNS = [
        (r'api[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]', 'Hardcoded API key', Severity.HIGH),
        (r'secret\s*[:=]\s*[\'"][^\'"]+[\'"]', 'Hardcoded secret', Severity.HIGH),
        (r'password\s*[:=]\s*[\'"][^\'"]+[\'"]', 'Hardcoded password', Severity.HIGH),
        (r'passwd\s*[:=]\s*[\'"][^\'"]+[\'"]', 'Hardcoded password', Severity.HIGH),
        (r'token\s*[:=]\s*[\'"][^\'"]+[\'"]', 'Hardcoded token', Severity.HIGH),
        (r'access[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]', 'Hardcoded access key', Severity.HIGH),
        (r'aws[_-]?access[_-]?key[_-]?id', 'AWS access key ID', Severity.HIGH),
        (r'aws[_-]?secret[_-]?access[_-]?key', 'AWS secret key', Severity.HIGH),
        (r'private[_-]?key', 'Private key content', Severity.HIGH),
        (r'-----BEGIN\s+RSA\s+PRIVATE\s+KEY-----', 'RSA private key', Severity.HIGH),
        (r'-----BEGIN\s+EC\s+PRIVATE\s+KEY-----', 'EC private key', Severity.HIGH),
        (r'-----BEGIN\s+DSA\s+PRIVATE\s+KEY-----', 'DSA private key', Severity.HIGH),
        (r'-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----', 'OpenSSH private key', Severity.HIGH),
        (r'print\s*\(\s*f?[\'"].*password', 'Password printing in log', Severity.HIGH),
        (r'print\s*\(\s*f?[\'"].*token', 'Token printing in log', Severity.HIGH),
        (r'console\.log\s*\([^)]*(?:password|token|secret|key)', 'Sensitive information log output', Severity.HIGH),
        (r'logger\.[a-z]+\([^)]*(?:password|token|secret|key)', 'Sensitive information logging', Severity.HIGH),
        (r'traceback\.print_exc\(\)', 'Exception stack trace printing', Severity.MEDIUM),
        (r'exception\s+as\s+e:\s*print\s*\(\s*e\)', 'Exception information printing', Severity.MEDIUM),
        (r'\berror\b.*(?:\||>|\$\()', 'Error output redirection', Severity.MEDIUM),
        (r'request\.headers\[[\'"]Authorization[\'"]\]', 'Authorization header access', Severity.MEDIUM),
        (r'\.getenv\s*\(\s*[\'"]API[_-]?KEY[\'"]', 'Environment variable key retrieval', Severity.MEDIUM),
        (r'\.getenv\s*\(\s*[\'"]SECRET[\'"]', 'Environment variable secret retrieval', Severity.MEDIUM),
        (r'hostname|\.hostname\(\)', 'Hostname retrieval', Severity.LOW),
        (r'\bwhoami\b', 'Current user query', Severity.LOW),
        (r'\bgetpwuid\b|\bgetuid\b', 'User ID retrieval', Severity.LOW),
    ]
    
    # Path traversal patterns
    PATH_TRAVERSAL_PATTERNS = [
        (r'\.\./', 'Path traversal: ../', Severity.MEDIUM),
        (r'\.\.\\', 'Path traversal: ..\\', Severity.MEDIUM),
        (r'\bopen\s*\(\s*[\'"][^\'"]*\.\./', 'File opening with path traversal', Severity.MEDIUM),
        (r'\breadFileSync\s*\([^)]*\.\./', 'File reading with path traversal', Severity.MEDIUM),
        (r'readFile\s*\([^)]*\.\./', 'File reading with path traversal', Severity.MEDIUM),
    ]


class SecurityChecker:
    """Main security checker class"""
    
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
        """Check the security of a single file"""
        issues = []
        file_ext = Path(file_path).suffix.lower()
        
        # Check all text file types including .md files
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
        """Check a single line of code"""
        issues = []
        
        # Check all pattern categories
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
        """Determine if the issue should be reported"""
        if self.strict_mode:
            return True
        return severity in [Severity.HIGH, Severity.MEDIUM]
    
    def _create_issue(self, skill_name: str, file_path: str, 
                     category: CheckCategory, severity: Severity,
                     title: str, code_snippet: str, line_number: int) -> SecurityIssue:
        """Create a security issue object"""
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
        """Get issue description"""
        descriptions = {
            CheckCategory.FILE_DELETE: "File deletion operation detected, may cause data loss",
            CheckCategory.SENSITIVE_FILE: "Access to sensitive files detected",
            CheckCategory.DANGEROUS_COMMAND: "Dangerous system command execution detected",
            CheckCategory.INFO_LEAK: "Code logic that may cause information leakage detected",
        }
        return descriptions.get(category, "Security issue detected")
    
    def _get_suggestion(self, category: CheckCategory, severity: Severity) -> str:
        """Get remediation suggestion"""
        suggestions = {
            CheckCategory.FILE_DELETE: (
                "User explicit authorization must be obtained before performing deletion operations. "
                "Adding confirmation mechanism is recommended: "
                "if not user_confirmed: raise PermissionError('User explicit authorization required')"
            ),
            CheckCategory.SENSITIVE_FILE: (
                "Avoid directly accessing system configuration files and personal data files. "
                "If access is necessary, clearly inform the user and obtain authorization"
            ),
            CheckCategory.DANGEROUS_COMMAND: (
                "Dangerous commands may cause system damage. Reconsider the necessity of operations "
                "or use a safer way to achieve the same functionality"
            ),
            CheckCategory.INFO_LEAK: (
                "Avoid hardcoding sensitive information in code, use environment variables or "
                "configuration management services. Do not output sensitive data in logs"
            ),
        }
        return suggestions.get(category, "Please check and fix this security issue")
    
    def check_directory(self, directory: str) -> SecurityReport:
        """Check the entire directory"""
        directory = os.path.abspath(directory)
        self.report.scope = directory
        
        for root, dirs, files in os.walk(directory):
            # Exclude specified directories
            dirs[:] = [d for d in dirs if d not in self.exclude_dirs]
            
            # Find SKILL.md to determine skill name
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
        """Extract skill name from SKILL.md"""
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
        """Incremental check, only check modified files"""
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
                        
                        # If incremental mode, check if file was modified
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
    """Markdown report generator"""
    
    @staticmethod
    def generate(report: SecurityReport) -> str:
        """Generate Markdown format report"""
        md = []
        
        md.append("# AI Agent Skill Security Assessment Report\n")
        md.append(f"**Generated**: {report.timestamp}\n")
        md.append(f"**Scope**: {report.scope}\n")
        md.append(f"**Total Skills**: {report.total_skills}\n")
        md.append(f"**Safe**: {report.safe_skills}\n")
        md.append(f"**Warnings**: {report.warnings}\n")
        md.append(f"**Danger**: {report.dangers}\n")
        
        md.append("\n## Issue List\n")
        
        # Group by severity
        high_issues = [i for i in report.issues if i.severity == Severity.HIGH]
        medium_issues = [i for i in report.issues if i.severity == Severity.MEDIUM]
        low_issues = [i for i in report.issues if i.severity == Severity.LOW]
        
        # High risk issues
        if high_issues:
            md.append("### 🔴 High Risk Issues\n")
            for i, issue in enumerate(high_issues, 1):
                md.append(f"#### {i}. {issue.title}\n")
                md.append(f"- **Skill Name**: `{issue.skill_name}`\n")
                md.append(f"- **File Path**: `{issue.file_path}`\n")
                if issue.line_number:
                    md.append(f"- **Line Number**: `{issue.line_number}`\n")
                md.append(f"- **Issue Description**: {issue.description}\n")
                md.append(f"- **Severity**: 🔴 High Risk\n")
                md.append(f"- **Risk Level**: 🔴 High Risk\n")
                md.append(f"- **Code Snippet**:\n")
                md.append(f"```\n{issue.code_snippet}\n```\n")
                md.append(f"- **Suggestion**: {issue.suggestion}\n")
        
        # Medium risk issues
        if medium_issues:
            md.append("### 🟡 Medium Risk Issues\n")
            for i, issue in enumerate(medium_issues, 1):
                md.append(f"#### {i}. {issue.title}\n")
                md.append(f"- **Skill Name**: `{issue.skill_name}`\n")
                md.append(f"- **File Path**: `{issue.file_path}`\n")
                if issue.line_number:
                    md.append(f"- **Line Number**: `{issue.line_number}`\n")
                md.append(f"- **Issue Description**: {issue.description}\n")
                md.append(f"- **Severity**: 🟡 Medium Risk\n")
                md.append(f"- **Risk Level**: 🟡 Medium Risk\n")
                md.append(f"- **Code Snippet**:\n")
                md.append(f"```\n{issue.code_snippet}\n```\n")
                md.append(f"- **Suggestion**: {issue.suggestion}\n")
        
        # Low risk issues
        if low_issues:
            md.append("### 🟢 Low Risk Issues\n")
            for i, issue in enumerate(low_issues, 1):
                md.append(f"#### {i}. {issue.title}\n")
                md.append(f"- **Skill Name**: `{issue.skill_name}`\n")
                md.append(f"- **File Path**: `{issue.file_path}`\n")
                if issue.line_number:
                    md.append(f"- **Line Number**: `{issue.line_number}`\n")
                md.append(f"- **Issue Description**: {issue.description}\n")
                md.append(f"- **Severity**: 🟢 Low Risk\n")
                md.append(f"- **Code Snippet**:\n")
                md.append(f"```\n{issue.code_snippet}\n```\n")
                md.append(f"- **Suggestion**: {issue.suggestion}\n")
        
        if not report.issues:
            md.append("No security issues found. All skills are safe.\n")
        
        md.append("\n## Security Check Summary\n")
        md.append("| Check Item | Safe | Warning | Danger |\n")
        md.append("|-----------|------|---------|--------|\n")
        md.append(f"| File Operations | {report.safe_skills} | {report.warnings} | {report.dangers} |\n")
        sensitive_issues = len([i for i in report.issues if i.category == CheckCategory.SENSITIVE_FILE])
        dangerous_issues = len([i for i in report.issues if i.category == CheckCategory.DANGEROUS_COMMAND])
        info_leak_issues = len([i for i in report.issues if i.category == CheckCategory.INFO_LEAK])
        md.append(f"| Sensitive Files | {sensitive_issues} | 0 | 0 |\n")
        md.append(f"| Dangerous Commands | {dangerous_issues} | 0 | 0 |\n")
        md.append(f"| Information Leakage | {info_leak_issues} | 0 | 0 |\n")
        
        return ''.join(md)
    
    @staticmethod
    def save(report: SecurityReport, output_path: str):
        """Save report to file"""
        md_content = MarkdownReporter.generate(report)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"Report saved to: {output_path}")


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="AI Agent Skill Security Checker - Systematically evaluates the security of AI Agent skills",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python check_security.py ./skills
  python check_security.py ./skills --output-format json
  python check_security.py ./skills --severity high --fail-on-danger
  python check_security.py ./skills --exclude "test_skills,legacy"
        """
    )
    
    parser.add_argument('directory', nargs='?', default='./skills',
                       help='Directory containing skills (default: ./skills)')
    parser.add_argument('--output-format', choices=['markdown', 'json', 'html'], 
                       default='markdown', help='Output format (default: markdown)')
    parser.add_argument('--output-dir', default='./security_reports',
                       help='Output directory (default: ./security_reports)')
    parser.add_argument('--severity', choices=['high', 'medium', 'low'], 
                       default='medium', help='Minimum severity level to report (default: medium)')
    parser.add_argument('--strict', action='store_true',
                       help='Include low-risk issues')
    parser.add_argument('--exclude', default='',
                       help='Exclude directories (comma-separated)')
    parser.add_argument('--incremental', action='store_true',
                       help='Only check modified files')
    parser.add_argument('--fail-on-danger', action='store_true',
                       help='Exit with error code if high-risk issues found')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Show detailed output')
    
    return parser.parse_args()


def main():
    """Main function"""
    print("AI Agent Skill Security Checker")
    print("=" * 40)
    
    args = parse_args()
    
    if args.verbose:
        print("Arguments:", args)
        print()
    
    checker = SecurityChecker(
        strict_mode=args.strict or args.severity == 'low',
        exclude_dirs=[d.strip() for d in args.exclude.split(',')] if args.exclude else []
    )
    
    if args.incremental:
        print("Running incremental check...")
        report = checker.check_incremental(args.directory)
    else:
        print(f"Checking directory: {args.directory}")
        report = checker.check_directory(args.directory)
    
    print()
    print("Security Check Results:")
    print("-" * 30)
    print(f"Total Skills Checked: {report.total_skills}")
    print(f"Safe Skills: {report.safe_skills}")
    print(f"Warnings (Medium Risk): {report.warnings}")
    print(f"Danger (High Risk): {report.dangers}")
    print()
    
    if report.dangers > 0 and args.fail_on_danger:
        print("ERROR: High-risk security issues found!")
        sys.exit(1)
    
    if report.issues:
        if args.output_format == 'markdown':
            output_dir = args.output_dir
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"security_report_{datetime.now().strftime('%Y-%m-%d')}.md")
            MarkdownReporter.save(report, output_path)
            print()
            print("Report Preview:")
            print("-" * 15)
            print(MarkdownReporter.generate(report)[:2000] + "...")
        elif args.output_format == 'json':
            print("JSON Report:")
            print(json.dumps(report.__dict__, indent=2, ensure_ascii=False, default=str))
    else:
        print("No security issues found. All skills are safe!")
    
    print()
    print("Security check completed.")
    
    return report


if __name__ == '__main__':
    main()
