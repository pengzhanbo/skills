# AI Skills Collection

This repository contains a collection of AI Agent skills that enhance your coding agent's capabilities.

## Available Skills

| Skill | Description | Languages |
|-------|-------------|-----------|
| [skill-security-checker](skill-security-checker/) | Systematically evaluates AI Agent skill security | 中文 |
| [skill-security-checker-en](skill-security-checker-en/) | English version of security checker | English |
| [skill-validator](skill-validator/) | Validates AI Agent skills for compliance | 中文 |
| [skill-validator-en](skill-validator-en/) | English version of skill validator | English |

## Quick Start

### Install Skills Using npx skills

This project supports installation via the [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI tool.

#### Install from GitHub

```bash
# Install all skills from this repository
npx skills add pengzhanbo/skills

# Install specific skill
npx skills add pengzhanbo/skills --skill skill-security-checker

# Install to specific agents
npx skills add pengzhanbo/skills -a claude-code -a cursor
```

#### Install from Local Path

```bash
# Install from local repository
npx skills add ./path/to/your/skills

# Install specific skill
npx skills add ./skill-security-checker
```

#### Interactive Installation

```bash
# List available skills
npx skills add pengzhanbo/skills --list

# Install interactively
npx skills add pengzhanbo/skills
```

#### Global Installation

```bash
# Install to global scope (available across all projects)
npx skills add ./skill-security-checker --global
```

### Available Commands

```bash
# List installed skills
npx skills list

# Search for skills
npx skills find security

# Remove a skill
npx skills remove skill-security-checker

# Check for updates
npx skills check

# Update all skills
npx skills update
```

## Skill Descriptions

### skill-security-checker / skill-security-checker-en

**Purpose**: Systematically evaluates the security of AI Agent skills.

**Features**:

- Detects unauthorized file deletion operations
- Identifies sensitive file access patterns
- Detects dangerous system commands
- Finds hardcoded secrets and credentials
- Generates detailed Markdown security reports

**Languages**:

- skill-security-checker: Chinese documentation
- skill-security-checker-en: English documentation

**Usage**:

```bash
# Check all skills
python scripts/check_security.py ./skills

# Check with detailed output
python scripts/check_security.py ./skills --output-format detailed

# Check specific skill
python scripts/check_security.py ./skills/pdf-processing --severity high
```

### skill-validator / skill-validator-en

**Purpose**: Validates AI Agent skills for compliance with standards.

**Features**:

- Validates SKILL.md structure and frontmatter
- Checks documentation completeness
- Verifies script file organization
- Ensures references directory structure
- Generates validation reports

**Languages**:

- skill-validator: Chinese documentation
- skill-validator-en: English documentation

**Usage**:

```bash
# Validate all skills
python scripts/validate_skills.py ./skills

# Validate with detailed output
python scripts/validate_skills.py ./skills --output-format detailed

# Validate specific skill
python scripts/validate_skills.py ./skills/pdf-processing --severity high
```

## Project Structure

```txt
skills/
├── README.md                    # This file
├── agent-skills-guide.md         # Skills development guide
├── skill-security-checker/       # Security checker (Chinese)
│   ├── SKILL.md
│   ├── references/
│   │   └── SECURITY_RULES.md
│   └── scripts/
│       ├── check_security.py
│       └── check_security.mjs
├── skill-security-checker-en/   # Security checker (English)
│   ├── SKILL.md
│   ├── references/
│   │   └── SECURITY_RULES.md
│   └── scripts/
│       ├── check_security.py
│       └── check_security.mjs
├── skill-validator/             # Skill validator (Chinese)
│   ├── SKILL.md
│   ├── references/
│   │   └── VALIDATION_RULES.md
│   └── scripts/
│       ├── validate_skills.py
│       └── validate_skills.mjs
└── skill-validator-en/          # Skill validator (English)
    ├── SKILL.md
    ├── references/
    │   └── VALIDATION_RULES.md
    └── scripts/
        ├── validate_skills.py
        └── validate_skills.mjs
```

## For Contributors

### Adding New Skills

1. Create a new directory following the skill structure
2. Add SKILL.md with proper frontmatter
3. Create scripts/ directory with implementation
4. Add references/ directory with documentation
5. Update this README.md with skill description

### Running Validations

Before submitting, validate your skill:

```bash
# Run skill validator
cd /path/to/skill
python ../skill-validator/scripts/validate_skills.py .

# Run security checker
python ../skill-security-checker/scripts/check_security.py .
```

## Related Resources

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - Official skills CLI
- [skills.sh](https://skills.sh) - Discover more agent skills
- [Agent Skills Guide](agent-skills-guide.md) - Development guide

## License

MIT
