#!/usr/bin/env python3
"""
AI Agent 技能规范验证器

Auto-validate AI Agent skills against official specification standards,
generate detailed markdown format issue reports and improvement suggestions.

Usage:
    python validate_skills.py ./skills [options]
    python validate_skills.py ./skills/pdf-processing [options]

NOTE: For optimal performance, AI Agents should check environment capabilities
and choose between this Python version or the JavaScript version (validate_skills.mjs)
based on available runtime. See SKILL.md for decision guidelines.
"""

import argparse
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum


class Severity(Enum):
    ERROR = "错误"
    WARNING = "警告"
    INFO = "信息"


@dataclass
class ValidationIssue:
    """验证问题数据类"""
    skill_name: str
    file_path: str
    issue_type: str
    description: str
    severity: Severity
    fix_suggestion: str
    line_number: Optional[int] = None


@dataclass
class SkillValidationResult:
    """技能验证结果数据类"""
    skill_name: str
    skill_path: str
    issues: List[ValidationIssue] = field(default_factory=list)
    passed: bool = True
    
    @property
    def error_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == Severity.ERROR)
    
    @property
    def warning_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == Severity.WARNING)


class SkillValidator:
    """AI Agent技能规范验证器"""
    
    VALID_NAME_PATTERN = re.compile(r'^[a-z][a-z0-9]*(-[a-z0-9]+)*$')
    MAX_NAME_LENGTH = 64
    MIN_NAME_LENGTH = 1
    MAX_DESCRIPTION_LENGTH = 1024
    MIN_DESCRIPTION_LENGTH = 1
    MAX_LICENSE_LENGTH = 256
    MAX_COMPATIBILITY_LENGTH = 500
    
    def __init__(self, strict_mode: bool = False, interactive: bool = False):
        self.strict_mode = strict_mode
        self.interactive = interactive
        self.all_results: List[SkillValidationResult] = []
    
    def validate_directory(self, skills_path: str) -> List[SkillValidationResult]:
        """验证指定目录下的所有技能"""
        skills_dir = Path(skills_path).resolve()
        
        if not skills_dir.exists():
            raise FileNotFoundError(f"目录不存在: {skills_path}")
        
        results = []
        
        if skills_dir.is_file():
            raise ValueError(f"路径是文件而非目录: {skills_path}")
        
        if (skills_dir / "SKILL.md").exists():
            result = self.validate_skill(skills_dir)
            results.append(result)
            self.all_results.append(result)
        else:
            for item in sorted(skills_dir.iterdir()):
                if item.is_dir():
                    result = self.validate_skill(item)
                    results.append(result)
                    self.all_results.append(result)
        
        return results
    
    def validate_skill(self, skill_path: Path) -> SkillValidationResult:
        """验证单个技能"""
        skill_name = skill_path.name
        result = SkillValidationResult(
            skill_name=skill_name,
            skill_path=str(skill_path)
        )
        
        skill_md_path = skill_path / "SKILL.md"
        
        if not skill_md_path.exists():
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(skill_md_path),
                issue_type="MISSING_FILE",
                description="技能目录中缺少必需的SKILL.md文件",
                severity=Severity.ERROR,
                fix_suggestion=f"在 {skill_path} 目录下创建SKILL.md文件，包含YAML前置元数据和技能说明文档。"
            ))
            result.passed = False
            return result
        
        try:
            import yaml
            with open(skill_md_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            yaml_content, markdown_content = self._parse_skill_md(content, skill_md_path)
            
            self._validate_yaml_frontmatter(skill_name, yaml_content, skill_md_path, result)
            self._validate_directory_structure(skill_path, skill_name, result)
            self._validate_markdown_content(markdown_content, skill_name, skill_md_path, result)
            
        except yaml.YAMLError as e:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(skill_md_path),
                issue_type="YAML_PARSE_ERROR",
                description=f"YAML解析错误: {str(e)}",
                severity=Severity.ERROR,
                fix_suggestion="检查SKILL.md中的YAML前置元数据语法，确保格式正确。"
            ))
            result.passed = False
        except Exception as e:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(skill_md_path),
                issue_type="READ_ERROR",
                description=f"读取文件时发生错误: {str(e)}",
                severity=Severity.ERROR,
                fix_suggestion="确保文件权限正确，文件未被其他程序锁定。"
            ))
            result.passed = False
        
        return result
    
    def _parse_skill_md(self, content: str, file_path: Path) -> Tuple[Optional[Dict], str]:
        """解析SKILL.md文件，分离YAML前置元数据和Markdown内容"""
        import yaml
        yaml_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n(.*)$', re.DOTALL)
        match = yaml_pattern.match(content)
        
        if match:
            yaml_text = match.group(1)
            markdown_content = match.group(2)
            try:
                yaml_data = yaml.safe_load(yaml_text)
                if yaml_data is None:
                    yaml_data = {}
                return yaml_data, markdown_content
            except yaml.YAMLError:
                return None, content
        else:
            return None, content
    
    def _validate_yaml_frontmatter(self, dir_name: str, yaml_data: Optional[Dict], 
                                   file_path: Path, result: SkillValidationResult):
        """验证YAML前置元数据"""
        skill_name = result.skill_name
        
        if yaml_data is None:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="MISSING_YAML",
                description="SKILL.md缺少YAML前置元数据（---分隔符）",
                severity=Severity.ERROR,
                fix_suggestion="在SKILL.md文件开头添加YAML前置元数据：\n---\nname: skill-name\ndescription: 技能描述\n---"
            ))
            result.passed = False
            return
        
        self._validate_name_field(skill_name, yaml_data, file_path, result)
        self._validate_description_field(skill_name, yaml_data, file_path, result)
        self._validate_license_field(skill_name, yaml_data, file_path, result)
        self._validate_compatibility_field(skill_name, yaml_data, file_path, result)
        self._validate_metadata_field(skill_name, yaml_data, file_path, result)
        self._validate_allowed_tools_field(skill_name, yaml_data, file_path, result)
    
    def _validate_name_field(self, skill_name: str, yaml_data: Dict, 
                            file_path: Path, result: SkillValidationResult):
        """验证name字段"""
        if 'name' not in yaml_data:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="MISSING_NAME",
                description="YAML前置元数据中缺少必需的name字段",
                severity=Severity.ERROR,
                fix_suggestion="添加name字段：\n---\nname: your-skill-name\ndescription: 技能描述\n---"
            ))
            result.passed = False
            return
        
        name = yaml_data['name']
        
        if not isinstance(name, str):
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="INVALID_NAME_TYPE",
                description="name字段必须是字符串类型",
                severity=Severity.ERROR,
                fix_suggestion="将name值改为字符串格式，如：name: pdf-processing"
            ))
            result.passed = False
            return
        
        if len(name) < self.MIN_NAME_LENGTH or len(name) > self.MAX_NAME_LENGTH:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="NAME_LENGTH_INVALID",
                description=f"name字段长度必须为1-64字符，当前长度为{len(name)}",
                severity=Severity.ERROR,
                fix_suggestion=f"将name长度调整至1-64字符范围内"
            ))
            result.passed = False
        
        if name != skill_name:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="NAME_MISMATCH",
                description=f"name字段值 '{name}' 与目录名称 '{skill_name}' 不匹配",
                severity=Severity.ERROR,
                fix_suggestion=f"将name字段改为 '{skill_name}'，或将目录重命名为 '{name}'"
            ))
            result.passed = False
        
        if not self.VALID_NAME_PATTERN.match(name):
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="INVALID_NAME_FORMAT",
                description=f"name字段 '{name}' 包含非法字符，仅允许小写字母、数字和连字符",
                severity=Severity.ERROR,
                fix_suggestion="使用小写字母、数字和连字符，例如：pdf-processing、data-analysis-v2"
            ))
            result.passed = False
        
        if '--' in name:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="CONSECUTIVE_HYPHENS",
                description=f"name字段 '{name}' 包含连续连字符",
                severity=Severity.ERROR,
                fix_suggestion="移除连续连字符，例如：将 'pdf--processing' 改为 'pdf-processing'"
            ))
            result.passed = False
    
    def _validate_description_field(self, skill_name: str, yaml_data: Dict,
                                   file_path: Path, result: SkillValidationResult):
        """验证description字段"""
        if 'description' not in yaml_data:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="MISSING_DESCRIPTION",
                description="YAML前置元数据中缺少必需的description字段",
                severity=Severity.ERROR,
                fix_suggestion="添加description字段：\n---\nname: skill-name\ndescription: 本技能用于[具体功能]。当用户需要[使用场景]时使用。\n---"
            ))
            result.passed = False
            return
        
        description = yaml_data['description']
        
        if not isinstance(description, str):
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="INVALID_DESCRIPTION_TYPE",
                description="description字段必须是字符串类型",
                severity=Severity.ERROR,
                fix_suggestion="将description值改为字符串格式"
            ))
            result.passed = False
            return
        
        desc_length = len(description)
        
        if desc_length < self.MIN_DESCRIPTION_LENGTH:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="DESCRIPTION_TOO_SHORT",
                description=f"description字段长度为{desc_length}，必须至少为1字符",
                severity=Severity.ERROR,
                fix_suggestion="扩展description字段，提供更详细的技能功能说明"
            ))
            result.passed = False
        
        if desc_length > self.MAX_DESCRIPTION_LENGTH:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="DESCRIPTION_TOO_LONG",
                description=f"description字段长度为{desc_length}，超过1024字符限制",
                severity=Severity.ERROR if self.strict_mode else Severity.WARNING,
                fix_suggestion="精简description字段，控制在1024字符以内"
            ))
            if self.strict_mode:
                result.passed = False
        
        if self.strict_mode and desc_length < 50:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="DESCRIPTION_TOO_BRIEF",
                description=f"description字段仅{desc_length}字符，建议扩展至至少50字符以提供清晰说明",
                severity=Severity.WARNING,
                fix_suggestion="建议的description格式：\ndescription: |-\n  本技能用于[主要功能]。\n  使用场景包括：[场景1]、[场景2]。\n  当用户提及[关键词]时使用。"
            ))
        
        if not description.strip():
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="DESCRIPTION_EMPTY",
                description="description字段为空或仅包含空白字符",
                severity=Severity.ERROR,
                fix_suggestion="提供非空的技能描述"
            ))
            result.passed = False
    
    def _validate_license_field(self, skill_name: str, yaml_data: Dict,
                               file_path: Path, result: SkillValidationResult):
        """验证license字段（可选）"""
        if 'license' not in yaml_data:
            return
        
        license_value = yaml_data['license']
        
        if not isinstance(license_value, str):
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="INVALID_LICENSE_TYPE",
                description="license字段必须是字符串类型",
                severity=Severity.WARNING,
                fix_suggestion="将license值改为字符串格式，如：license: MIT"
            ))
            return
        
        if len(license_value) > self.MAX_LICENSE_LENGTH:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="LICENSE_TOO_LONG",
                description=f"license字段超过{self.MAX_LICENSE_LENGTH}字符限制",
                severity=Severity.WARNING,
                fix_suggestion="建议使用简短的许可证名称，如：MIT、Apache-2.0、GPL-3.0"
            ))
    
    def _validate_compatibility_field(self, skill_name: str, yaml_data: Dict,
                                    file_path: Path, result: SkillValidationResult):
        """验证compatibility字段（可选）"""
        if 'compatibility' not in yaml_data:
            return
        
        compatibility = yaml_data['compatibility']
        
        if not isinstance(compatibility, str):
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="INVALID_COMPATIBILITY_TYPE",
                description="compatibility字段必须是字符串类型",
                severity=Severity.WARNING,
                fix_suggestion="将compatibility值改为字符串格式"
            ))
            return
        
        if len(compatibility) > self.MAX_COMPATIBILITY_LENGTH:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="COMPATIBILITY_TOO_LONG",
                description=f"compatibility字段超过{self.MAX_COMPATIBILITY_LENGTH}字符限制",
                severity=Severity.WARNING,
                fix_suggestion="精简compatibility描述，控制在500字符以内"
            ))
    
    def _validate_metadata_field(self, skill_name: str, yaml_data: Dict,
                               file_path: Path, result: SkillValidationResult):
        """验证metadata字段（可选）"""
        if 'metadata' not in yaml_data:
            return
        
        metadata = yaml_data['metadata']
        
        if not isinstance(metadata, dict):
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="INVALID_METADATA_TYPE",
                description="metadata字段必须是映射类型（字典）",
                severity=Severity.WARNING,
                fix_suggestion="将metadata改为字典格式：\nmetadata:\n  author: name\n  version: \"1.0\""
            ))
            return
    
    def _validate_allowed_tools_field(self, skill_name: str, yaml_data: Dict,
                                     file_path: Path, result: SkillValidationResult):
        """验证allowed-tools字段（可选）"""
        if 'allowed-tools' not in yaml_data:
            return
        
        allowed_tools = yaml_data['allowed-tools']
        
        if not isinstance(allowed_tools, str):
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="INVALID_ALLOWED_TOOLS_TYPE",
                description="allowed-tools字段必须是空格分隔的字符串",
                severity=Severity.WARNING,
                fix_suggestion="将allowed-tools改为字符串格式：\nallowed-tools: Bash(git:*) Read"
            ))
    
    def _validate_directory_structure(self, skill_path: Path, skill_name: str,
                                     result: SkillValidationResult):
        """验证目录结构"""
        valid_subdirs = ['scripts', 'references', 'assets']
        
        for item in skill_path.iterdir():
            if item.is_dir():
                if item.name not in valid_subdirs:
                    result.issues.append(ValidationIssue(
                        skill_name=skill_name,
                        file_path=str(item),
                        issue_type="INVALID_SUBDIRECTORY",
                        description=f"发现未知的子目录 '{item.name}'，可选目录为: scripts, references, assets",
                        severity=Severity.WARNING,
                        fix_suggestion=f"将 '{item.name}' 移至有效的子目录之一，或根据需要创建标准子目录"
                    ))
    
    def _validate_markdown_content(self, markdown_content: str, skill_name: str,
                                  file_path: Path, result: SkillValidationResult):
        """验证Markdown内容"""
        if not markdown_content or not markdown_content.strip():
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="EMPTY_CONTENT",
                description="SKILL.md缺少Markdown内容",
                severity=Severity.WARNING if self.strict_mode else Severity.INFO,
                fix_suggestion="添加技能说明、使用示例、使用场景等Markdown内容"
            ))
            return
        
        if len(markdown_content.strip()) < 100 and self.strict_mode:
            result.issues.append(ValidationIssue(
                skill_name=skill_name,
                file_path=str(file_path),
                issue_type="CONTENT_TOO_SHORT",
                description="Markdown内容较少，建议提供更详细的使用说明",
                severity=Severity.INFO,
                fix_suggestion="建议包含：功能说明、使用方法、示例代码、常见问题等章节"
            ))
    
    def generate_report(self, results: List[SkillValidationResult], 
                       output_format: str = "markdown") -> str:
        """生成验证报告"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        total_skills = len(results)
        passed_skills = sum(1 for r in results if r.passed)
        failed_skills = total_skills - passed_skills
        
        total_errors = sum(r.error_count for r in results)
        total_warnings = sum(r.warning_count for r in results)
        
        if output_format == "markdown":
            return self._generate_markdown_report(
                results, timestamp, total_skills, passed_skills, 
                failed_skills, total_errors, total_warnings
            )
        elif output_format == "json":
            return self._generate_json_report(results, timestamp)
        else:
            return self._generate_text_report(results, timestamp)
    
    def _generate_markdown_report(self, results: List[SkillValidationResult],
                                  timestamp: str, total_skills: int,
                                  passed_skills: int, failed_skills: int,
                                  total_errors: int, total_warnings: int) -> str:
        """生成Markdown格式报告"""
        report = f"""# AI Agent 技能规范验证报告

**生成时间**: {timestamp}
**验证范围**: {', '.join(set(r.skill_path for r in results))}

## 验证摘要

| 指标 | 数值 |
|------|------|
| 总计技能 | {total_skills} |
| 通过验证 | {passed_skills} |
| 存在问题 | {failed_skills} |
| 错误数 | {total_errors} |
| 警告数 | {total_warnings} |

## 验证统计

| 技能名称 | 状态 | 错误 | 警告 |
|---------|------|------|------|
"""
        
        for result in sorted(results, key=lambda x: (-x.error_count, -x.warning_count)):
            status = "✅ 通过" if result.passed else "❌ 未通过"
            report += f"| {result.skill_name} | {status} | {result.error_count} | {result.warning_count} |\n"
        
        error_results = [r for r in results if r.issues]
        
        if error_results:
            report += "\n## 详细问题清单\n\n"
            
            error_issues = [i for r in results for i in r.issues if i.severity == Severity.ERROR]
            warning_issues = [i for r in results for i in r.issues if i.severity == Severity.WARNING]
            
            if error_issues:
                report += "### ❌ 错误\n\n"
                for idx, issue in enumerate(error_issues, 1):
                    report += f"""#### {idx}. {issue.issue_type.replace('_', ' ').title()}

- **技能名称**: `{issue.skill_name}`
- **文件路径**: `{issue.file_path}`
- **问题描述**: {issue.description}
- **严重程度**: {issue.severity.value}
- **修复建议**: 
{self._indent_text(issue.fix_suggestion, 6)}

"""
            
            if warning_issues:
                report += "### ⚠️ 警告\n\n"
                for idx, issue in enumerate(warning_issues, 1):
                    report += f"""#### {idx}. {issue.issue_type.replace('_', ' ').title()}

- **技能名称**: `{issue.skill_name}`
- **文件路径**: `{issue.file_path}`
- **问题描述**: {issue.description}
- **严重程度**: {issue.severity.value}
- **修复建议**: 
{self._indent_text(issue.fix_suggestion, 6)}

"""
        
        if not any(r.issues for r in results):
            report += "\n## ✅ 所有技能均通过验证\n\n没有发现任何问题，所有技能都符合官方编写规范。"
        
        return report
    
    def _generate_json_report(self, results: List[SkillValidationResult], timestamp: str) -> str:
        """生成JSON格式报告"""
        import json
        
        report_data = {
            "timestamp": timestamp,
            "summary": {
                "total_skills": len(results),
                "passed": sum(1 for r in results if r.passed),
                "failed": sum(1 for r in results if not r.passed),
                "total_errors": sum(r.error_count for r in results),
                "total_warnings": sum(r.warning_count for r in results)
            },
            "results": []
        }
        
        for result in results:
            skill_result = {
                "skill_name": result.skill_name,
                "skill_path": result.skill_path,
                "passed": result.passed,
                "issues_count": {
                    "error": result.error_count,
                    "warning": result.warning_count
                },
                "issues": []
            }
            
            for issue in result.issues:
                skill_result["issues"].append({
                    "type": issue.issue_type,
                    "file_path": issue.file_path,
                    "description": issue.description,
                    "severity": issue.severity.value,
                    "fix_suggestion": issue.fix_suggestion
                })
            
            report_data["results"].append(skill_result)
        
        return json.dumps(report_data, ensure_ascii=False, indent=2)
    
    def _generate_text_report(self, results: List[SkillValidationResult], timestamp: str) -> str:
        """生成纯文本格式报告"""
        report = f"""AI Agent 技能规范验证报告
{'=' * 50}
生成时间: {timestamp}

验证摘要:
  总计技能: {len(results)}
  通过验证: {sum(1 for r in results if r.passed)}
  存在问题: {sum(1 for r in results if not r.passed)}
  错误数: {sum(r.error_count for r in results)}
  警告数: {sum(r.warning_count for r in results)}

详细问题:
"""
        
        for result in sorted(results, key=lambda x: -x.error_count):
            if not result.passed or result.warning_count > 0:
                report += f"\n[{result.skill_name}]\n"
                for issue in result.issues:
                    icon = "❌" if issue.severity == Severity.ERROR else "⚠️"
                    report += f"  {icon} [{issue.issue_type}] {issue.description}\n"
                    report += f"     位置: {issue.file_path}\n"
                    report += f"     建议: {issue.fix_suggestion[:100]}...\n"
        
        return report
    
    def _indent_text(self, text: str, spaces: int) -> str:
        """缩进文本"""
        indent = " " * spaces
        return "\n".join(indent + line for line in text.split("\n"))
    
    def interactive_fix(self, results: List[SkillValidationResult]):
        """交互式修复模式"""
        print("\n" + "=" * 60)
        print("交互式修复模式")
        print("=" * 60)
        
        all_issues = [i for r in results for i in r.issues if i.severity == Severity.ERROR]
        
        if not all_issues:
            print("\n✅ 没有发现需要修复的错误。")
            return
        
        print(f"\n发现 {len(all_issues)} 个错误需要修复。")
        print("\n可用命令:")
        print("  [数字] - 查看具体问题详情")
        print("  [a] - 显示所有问题")
        print("  [q] - 退出交互模式")
        print("  [r] - 重新验证")
        
        while True:
            try:
                cmd = input("\n请输入命令: ").strip().lower()
                
                if cmd == 'q':
                    print("\n退出交互模式。")
                    break
                elif cmd == 'a':
                    for idx, issue in enumerate(all_issues, 1):
                        print(f"\n[{idx}] {issue.issue_type}")
                        print(f"    技能: {issue.skill_name}")
                        print(f"    文件: {issue.file_path}")
                        print(f"    问题: {issue.description}")
                        print(f"    建议: {issue.fix_suggestion[:200]}...")
                elif cmd == 'r':
                    print("\n请重新运行验证脚本。")
                    break
                elif cmd.isdigit():
                    idx = int(cmd)
                    if 1 <= idx <= len(all_issues):
                        issue = all_issues[idx - 1]
                        self._show_fix_details(issue)
                    else:
                        print(f"无效数字，请输入 1-{len(all_issues)}")
                else:
                    print("未知命令，请输入 [数字]、[a]、[q] 或 [r]")
            except KeyboardInterrupt:
                print("\n\n退出交互模式。")
                break
    
    def _show_fix_details(self, issue: ValidationIssue):
        """显示问题详情和修复步骤"""
        print(f"\n{'=' * 60}")
        print(f"问题详情 #{issue.issue_type}")
        print(f"{'=' * 60}")
        print(f"\n技能名称: {issue.skill_name}")
        print(f"文件路径: {issue.file_path}")
        print(f"\n问题描述:")
        print(f"{self._indent_text(issue.description, 4)}")
        print(f"\n修复建议:")
        print(f"{self._indent_text(issue.fix_suggestion, 4)}")
        print(f"\n{'=' * 60}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="AI Agent 技能规范验证器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python validate_skills.py ./skills
  python validate_skills.py ./skills --output-format detailed
  python validate_skills.py ./skills --strict
  python validate_skills.py ./skills --interactive
        """
    )
    
    parser.add_argument(
        'path',
        nargs='?',
        default='./skills',
        help='技能目录路径（默认: ./skills）'
    )
    
    parser.add_argument(
        '--output-format',
        choices=['markdown', 'json', 'text'],
        default='markdown',
        help='输出格式（默认: markdown）'
    )
    
    parser.add_argument(
        '--output-file',
        type=str,
        help='输出报告到文件'
    )
    
    parser.add_argument(
        '--strict',
        action='store_true',
        help='严格模式，包含所有警告'
    )
    
    parser.add_argument(
        '--interactive',
        action='store_true',
        help='交互式修复模式'
    )
    
    parser.add_argument(
        '--fail-on-error',
        action='store_true',
        help='发现错误时以非零状态码退出'
    )
    
    args = parser.parse_args()
    
    import yaml
    validator = SkillValidator(strict_mode=args.strict, interactive=args.interactive)
    results = validator.validate_directory(args.path)
    
    report = validator.generate_report(results, args.output_format)
    
    if args.output_file:
        with open(args.output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"报告已保存至: {args.output_file}")
    else:
        print(report)
    
    if args.interactive:
        validator.interactive_fix(results)
    
    has_errors = any(r.error_count > 0 for r in results)
    
    if has_errors and args.fail_on_error:
        sys.exit(1)
    
    exit_code = 1 if has_errors else 0
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
