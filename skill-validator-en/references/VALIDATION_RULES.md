# Skill Validation Rules Details

This document provides detailed explanations of all validation rules performed by the AI Agent Skill Specification Validator.

## Directory Structure Rules

### Required Files

Each skill directory must contain:

```
skill-name/
└── SKILL.md              # Required file (the only mandatory item)
```

### Optional Directories

| Directory Name | Purpose | Contains |
| -------------- | ------- | -------- |
| `scripts/` | Executable scripts | Python (.py), Bash (.sh), JavaScript (.js) and other script files |
| `references/` | Reference documents | REFERENCE.md, FORMS.md, and domain-specific documents |
| `assets/` | Static assets | Template files, image resources, data files, etc. |

### Invalid Directory Detection

If other directory names are found, a warning will be generated:

```
⚠️ Unknown subdirectory 'docs' found, optional directories are: scripts, references, assets
```

## YAML Frontmatter Rules

### name Field (Required)

#### Length Limits

- **Minimum length**: 1 character
- **Maximum length**: 64 characters

#### Character Rules

**Allowed characters**:

- Lowercase letters (a-z)
- Numbers (0-9)
- Hyphens (-)

**Prohibited characters**:

- Uppercase letters (A-Z)
- Spaces
- Underscores (_)
- Other special characters

#### Format Rules

- Cannot start with a hyphen
- Cannot end with a hyphen
- Cannot contain consecutive hyphens (--)

#### Matching Rule

The `name` field value must exactly match the skill directory name.

#### Validation Examples

```yaml
# ✅ Correct Examples
name: pdf-processing
name: data-analysis-v2
name: test123

# ❌ Incorrect Examples
name: PDF-Processing     # Contains uppercase letters
name: -pdf               # Starts with hyphen
name: pdf-               # Ends with hyphen
name: pdf--processing    # Contains consecutive hyphens
name: pdf processing     # Contains spaces
```

### description Field (Required)

#### Length Limits

- **Minimum length**: 1 character
- **Maximum length**: 1024 characters

#### Content Requirements

The description must clearly explain:

1. The primary functionality of the skill
2. Applicable scenarios
3. Keywords (to help Agents identify when to use)

#### Recommended Format

```yaml
description: |
  This skill is used for [primary functionality description].
  Usage scenarios include: [scenario 1], [scenario 2], [scenario 3].
  Use this skill when users mention [keyword 1], [keyword 2].
```

#### Quality Assessment Standards

| Quality Level | Description Length | Assessment Result |
| -------------- | ------------------ | ----------------- |
| Excellent | ≥100 characters | Complete functionality description, clear usage scenarios, rich keywords |
| Good | 50-99 characters | Basic functionality description complete |
| Acceptable | 1-49 characters | Functionality description basically complete |
| Unacceptable | 0 characters | Missing description or empty |

#### Validation Examples

```yaml
# ✅ Good Example
description: Extracts text and tables from PDF files, supports form filling and document merging. Usage scenarios include: processing PDF documents, automating form filling, merging multiple PDFs. Use when users mention PDF, forms, documents.

# ❌ Too Short Example
description: Helps with PDFs.  # Only 23 characters

# ❌ Empty Value Example
description: ""  # Empty string
```

### license Field (Optional)

#### Length Limit

- **Maximum length**: 256 characters

#### Format Requirements

Can be:

- License name: `MIT`, `Apache-2.0`, `GPL-3.0`
- License file reference: `Proprietary. LICENSE.txt has complete terms`

#### Validation Examples

```yaml
# ✅ Correct Examples
license: MIT
license: Apache-2.0
license: Proprietary. LICENSE.txt has complete terms
```

### compatibility Field (Optional)

#### Length Limit

- **Maximum length**: 500 characters

#### Purpose Description

Used to explain the skill's environmental requirements:

- Target products (e.g., Claude Code)
- Required operating system packages
- Network access requirements
- Other dependency conditions

#### Validation Examples

```yaml
# ✅ Correct Examples
compatibility: Requires git, docker, jq, and access to the internet
compatibility: Designed for Claude Code (or similar products)
```

### metadata Field (Optional)

#### Format Requirements

Must be a valid YAML mapping (dictionary):

```yaml
metadata:
  author: example-org
  version: "1.0"
  tags: [pdf, document, extraction]
```

#### Restrictions

- Key names must be strings
- Values must be strings or string arrays

### allowed-tools Field (Optional)

#### Format Requirements

Must be a space-separated list of strings:

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

## Markdown Content Rules

### Basic Requirements

The Markdown content section of SKILL.md files should include:

#### Recommended Sections

1. **Function Description** - Primary functionality introduction of the skill
2. **Usage Scenarios** - Detailed explanation of when to use this skill
3. **Usage Methods** - Step-by-step usage guide
4. **Examples** - Input and output examples
5. **FAQ** - Frequently asked questions or notes

### Length Recommendations

| Content Type | Recommended Length |
| ------------ | ------------------ |
| Minimum content | 100+ characters |
| Recommended content | 500-5000 characters |
| Maximum content | Not recommended to exceed 5000 characters (progressive disclosure principle) |

### Progressive Disclosure Principle

According to official specifications, skill content should be organized in the following layers:

1. **Metadata** (~100 tokens): `name` and `description` fields
2. **Documentation** (<5000 tokens): Complete `SKILL.md` content
3. **Resource files** (loaded on demand): Files in `scripts/`, `references/`, `assets/`

### File Reference Rules

When referencing other files:

- Use relative paths: `references/REFERENCE.md`
- Maintain single-level reference depth
- Avoid deep nested reference chains

## Error Severity Classification

### High Priority (Errors)

The following issues are marked as ERROR level:

| Issue Type | Description |
| ---------- | ----------- |
| MISSING_FILE | Missing required SKILL.md file |
| MISSING_YAML | Missing YAML frontmatter |
| MISSING_NAME | Missing required name field |
| MISSING_DESCRIPTION | Missing required description field |
| INVALID_NAME_TYPE | Name field type error |
| INVALID_DESCRIPTION_TYPE | Description field type error |
| NAME_LENGTH_INVALID | Name field length exceeds limit |
| NAME_MISMATCH | Name does not match directory name |
| INVALID_NAME_FORMAT | Name field contains illegal characters |
| CONSECUTIVE_HYPHENS | Name field contains consecutive hyphens |
| DESCRIPTION_TOO_SHORT | Description field is too short |
| DESCRIPTION_EMPTY | Description field is empty |
| YAML_PARSE_ERROR | YAML parsing failed |

### Medium Priority (Warnings)

The following issues are marked as WARNING level:

| Issue Type | Description |
| ---------- | ----------- |
| INVALID_LICENSE_TYPE | License field type error |
| LICENSE_TOO_LONG | License field exceeds length limit |
| INVALID_COMPATIBILITY_TYPE | Compatibility field type error |
| COMPATIBILITY_TOO_LONG | Compatibility field exceeds length limit |
| INVALID_METADATA_TYPE | Metadata field type error |
| INVALID_ALLOWED_TOOLS_TYPE | Allowed-tools field type error |
| INVALID_SUBDIRECTORY | Unknown subdirectory found |
| DESCRIPTION_TOO_LONG | Description field exceeds length limit (strict mode) |
| DESCRIPTION_TOO_BRIEF | Description field too brief (strict mode) |

### Low Priority (Info)

The following issues are marked as INFO level:

| Issue Type | Description |
| ---------- | ----------- |
| EMPTY_CONTENT | Markdown content is empty |
| CONTENT_TOO_SHORT | Markdown content is brief (strict mode) |

## Validation Flowchart

```
Start Validation
    ↓
Does directory exist?
    ├─ No → Error: Directory does not exist
    └─ Yes ↓
Iterate all subdirectories
    ↓
For each subdirectory:
    ↓
Does SKILL.md exist?
    ├─ No → Add MISSING_FILE error
    └─ Yes ↓
Parse YAML frontmatter
    ↓
YAML parsing successful?
    ├─ No → Add YAML_PARSE_ERROR error
    └─ Yes ↓
Validate name field
    ↓
Validate description field
    ↓
Validate optional fields (license, compatibility, etc.)
    ↓
Validate directory structure
    ↓
Validate Markdown content
    ↓
Generate validation results
    ↓
Generate issue report
    ↓
End
```

## Common Fix Guides

### Issue 1: NAME_MISMATCH

**Symptoms**:

```
Name field value 'mySkill' does not match directory name 'myskill'
```

**Causes**:

- The name field in YAML does not match the directory name in case
- Directory was previously renamed but name field was not updated

**Fix Solutions**:

```bash
# Solution 1: Rename directory to match name field
mv myskill mySkill  # If directory name should be mySkill

# Solution 2: Modify name field to match directory name
# Edit SKILL.md, change name: mySkill to name: myskill
```

### Issue 2: INVALID_NAME_FORMAT

**Symptoms**:

```
Name field 'pdf_processing' contains illegal characters
```

**Causes**:

- Used underscores instead of hyphens

**Fix Solutions**:

```yaml
# Before modification
name: pdf_processing

# After modification
name: pdf-processing
```

### Issue 3: DESCRIPTION_TOO_SHORT

**Symptoms**:

```
Description field is only 23 characters, recommend at least 50 characters
```

**Fix Solutions**:

```yaml
# Before modification
description: Helps with PDFs.

# After modification
description: Extracts text and tables from PDF files, supports form filling and document merging. Usage scenarios include: processing PDF documents, automating form filling, merging multiple PDFs. Use when users mention PDF, forms, document extraction.
```

### Issue 4: MISSING_YAML

**Symptoms**:

```
SKILL.md missing YAML frontmatter
```

**Fix Solutions**:

```markdown
# Add at the beginning of SKILL.md file:
---
name: your-skill-name
description: This skill is used for [specific function]. Used when users need [usage scenario].
---

# Skill documentation content follows...
```
