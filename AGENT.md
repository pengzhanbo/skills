# Agent Operation Guidelines

This document defines the operational specifications and workflows for AI agents working within this skills repository. All agents must strictly follow these guidelines when creating, updating, or managing skills.

---

## Overview

This repository is a collection of reusable skill instruction sets for AI coding assistants. Each skill is defined in a `SKILL.md` file containing complete instruction sets, workflows, and quality standards. Agents use the `skill-creator` tool to add or update skills.

---

## 1. Skill Creation and Update Specifications

### 1.1 Language Priority

All new or updated skills must be developed and output in **English first**.

- English is the primary language for all skill content
- English skill files serve as the authoritative source for translations
- All technical terms, descriptions, and instructions must be complete in English before any localization

### 1.2 File Location and Naming

English skill files must be saved to the `skills/` directory following these conventions:

```
skills/
├── skill-name/
│   └── SKILL.md
```

**Naming Conventions**:

- Use lowercase letters with hyphens (kebab-case): `doc-writer`, `code-commentator`
- Names should be descriptive and concise
- Avoid abbreviations unless widely recognized
- Each skill must have its own directory

### 1.3 File Format and Structure

Skill files must maintain consistency with existing skills in the repository. Each `SKILL.md` file must include:

**Frontmatter (YAML)**:

```yaml
---
name: skill-name
description: Brief description of the skill's purpose and trigger conditions
license: MIT
metadata:
  version: "1.0.0"
---
```

**Content Structure**:

1. **Title**: Skill name as main heading
2. **Introduction**: Brief overview of the skill
3. **Trigger Conditions**: When to activate this skill
4. **Phases/Sections**: Detailed instructions organized by workflow phases
5. **Quality Checklist**: Self-verification items
6. **Examples**: Workflow examples if applicable
7. **Notes**: Important considerations

---

## 2. Localization and Translation Requirements

### 2.1 Translation Timing

After completing the English skill creation or update, agents **must immediately translate** it to Simplified Chinese.

- Do not delay translation for later
- Translation is a mandatory step, not optional
- Both versions must be committed together

### 2.2 Chinese File Location

Chinese translations must be saved to the `skills_zh-CN/` directory:

```
skills_zh-CN/
├── skill-name/
│   └── SKILL.md
```

**Requirements**:

- Directory name must match the English version exactly
- File name must be `SKILL.md` (same as English version)
- Maintain the same directory structure as `skills/`

### 2.3 Translation Quality Standards

Translations must accurately reflect the original English content:

| Aspect | Requirement |
|--------|-------------|
| **Accuracy** | Faithful to the original meaning |
| **Terminology** | Use industry-standard Chinese translations |
| **Consistency** | Same terms must be translated consistently |
| **Completeness** | All sections must be translated, including frontmatter |
| **Format** | Maintain identical markdown structure |

**Common Term Translations**:

| English | Chinese |
|---------|---------|
| skill | 技能 |
| trigger conditions | 触发条件 |
| workflow | 工作流程 |
| checklist | 检查清单 |
| phase | 阶段 |
| documentation | 文档 |

**Special Notes**:

- Keep code examples unchanged (do not translate code)
- Keep URLs, file paths, and command examples unchanged
- Use Chinese punctuation in Chinese text (`""` instead of `""`, `。` instead of `.`)

---

## 3. Documentation Update Requirements

### 3.1 README Update Trigger

After each skill creation or update, agents **must synchronously update** the README.md file.

### 3.2 README Update Content

Updates must include:

1. **Feature Section**: Add or update the skill's description
2. **Capabilities List**: List main features/capabilities
3. **Usage Examples**: How to use the skill
4. **Links**: Related links if applicable

### 3.3 README Update Format

Follow the existing README structure:

```markdown
### skill-name

Brief description of the skill, providing the following capabilities:

- **Capability 1**: Description
- **Capability 2**: Description
- **Capability 3**: Description
```

### 3.4 Bilingual README Updates

Both README files must be updated:

- `README.md` (English version)
- `README.zh-CN.md` (Chinese version)

Ensure both versions contain equivalent information.

### 3.5 Statistics and Lists

Maintain accurate skill counts and categorizations:

- Update the total number of skills if changed
- Ensure the skill list is alphabetically ordered
- Verify all links point to correct locations

---

## 4. Version Control and Commit Standards

### 4.1 Commit Message Format

Use standardized commit messages following these patterns:

| Type | Format | Example |
|------|--------|---------|
| New Skill | `feat: add [skill-name] skill` | `feat: add code-commentator skill` |
| Update Skill | `update: improve [skill-name] skill` | `update: improve doc-writer skill` |
| Fix Skill | `fix: correct [skill-name] description` | `fix: correct i18n-doc-translator description` |
| Documentation | `docs: update README for [skill-name]` | `docs: update README for doc-writer` |

### 4.2 Commit Scope

Each commit should include:

1. English skill file (`skills/skill-name/SKILL.md`)
2. Chinese skill file (`skills_zh-CN/skill-name/SKILL.md`)
3. Updated README files (`README.md`, `README.zh-CN.md`)

**Example**:

```bash
git add skills/new-skill/SKILL.md
git add skills_zh-CN/new-skill/SKILL.md
git add README.md README.zh-CN.md
git commit -m "feat: add new-skill skill"
```

### 4.3 Commit Timing

- Commit after completing all related changes
- Do not commit partial changes
- Verify all files are included before committing

---

## 5. Operation Workflow

### 5.1 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SKILL CREATION WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Create English Skill                                   │
│  ─────────────────────────────                                  │
│  • Use skill-creator tool                                       │
│  • Develop content in English                                   │
│  • Follow existing skill format                                 │
│  • Save to skills/skill-name/SKILL.md                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Translate to Chinese                                   │
│  ─────────────────────────────                                  │
│  • Translate all content to Simplified Chinese                  │
│  • Maintain identical structure                                 │
│  • Use industry-standard terminology                            │
│  • Save to skills_zh-CN/skill-name/SKILL.md                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Update Documentation                                   │
│  ─────────────────────────────                                  │
│  • Update README.md (English)                                   │
│  • Update README.zh-CN.md (Chinese)                             │
│  • Add skill description and features                           │
│  • Verify links and statistics                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Quality Verification                                   │
│  ─────────────────────────────                                  │
│  • Run pnpm lint                                                │
│  • Verify file structure                                        │
│  • Check translation completeness                               │
│  • Validate README consistency                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Commit Changes                                         │
│  ─────────────────────────────                                  │
│  • Stage all related files                                      │
│  • Use standardized commit message                              │
│  • Verify commit includes all changes                           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Step-by-Step Instructions

#### Step 1: Create English Skill

1. Invoke the `skill-creator` skill using the Skill tool
2. Develop the skill content following these guidelines:
   - Define clear trigger conditions
   - Structure content in logical phases
   - Include practical examples
   - Add quality checklists
3. Save the file to `skills/[skill-name]/SKILL.md`
4. Ensure frontmatter includes: name, description, license, metadata.version

#### Step 2: Translate to Chinese

1. Read the English skill file completely
2. Translate all content maintaining:
   - Identical markdown structure
   - Same heading hierarchy
   - Equivalent code examples (unchanged)
   - Translated frontmatter
3. Save to `skills_zh-CN/[skill-name]/SKILL.md`
4. Verify translation quality against standards

#### Step 3: Update Documentation

1. Read current README.md and README.zh-CN.md
2. Add new skill section in alphabetical order
3. Include:
   - Skill name as subheading
   - Brief description
   - Bullet list of capabilities
4. Update skill count if applicable
5. Verify all internal links

#### Step 4: Quality Verification

1. Run `pnpm lint` to check formatting
2. Verify directory structure:
   ```
   skills/
   └── [skill-name]/
       └── SKILL.md
   skills_zh-CN/
   └── [skill-name]/
       └── SKILL.md
   ```
3. Check translation completeness
4. Validate README consistency

#### Step 5: Commit Changes

1. Stage all files:
   ```bash
   git add skills/[skill-name]/SKILL.md
   git add skills_zh-CN/[skill-name]/SKILL.md
   git add README.md README.zh-CN.md
   ```
2. Commit with standardized message:
   ```bash
   git commit -m "feat: add [skill-name] skill"
   ```

---

## 6. Quality Checklist

Before completing any skill operation, verify:

### File Structure

- [ ] English skill file exists in `skills/[skill-name]/SKILL.md`
- [ ] Chinese skill file exists in `skills_zh-CN/[skill-name]/SKILL.md`
- [ ] Both files have identical directory names
- [ ] Both files are named `SKILL.md`

### Content Quality

- [ ] English content is complete and accurate
- [ ] Chinese translation is accurate and complete
- [ ] Frontmatter is present in both files
- [ ] Version numbers match in both files

### Documentation

- [ ] README.md is updated with new skill
- [ ] README.zh-CN.md is updated with new skill
- [ ] Skill descriptions are consistent
- [ ] Links are valid

### Code Quality

- [ ] `pnpm lint` passes without errors
- [ ] Markdown formatting is consistent
- [ ] No broken links

### Commit

- [ ] All related files are staged
- [ ] Commit message follows standard format
- [ ] Commit includes both language versions

---

## 7. Common Scenarios

### Scenario 1: Creating a New Skill

```
User: Create a skill for API testing

Agent Actions:
1. Invoke skill-creator
2. Create skills/api-testing/SKILL.md (English)
3. Create skills_zh-CN/api-testing/SKILL.md (Chinese)
4. Update README.md
5. Update README.zh-CN.md
6. Run pnpm lint
7. Commit: "feat: add api-testing skill"
```

### Scenario 2: Updating an Existing Skill

```
User: Add error handling section to doc-writer skill

Agent Actions:
1. Read skills/doc-writer/SKILL.md
2. Update skills/doc-writer/SKILL.md (English)
3. Update skills_zh-CN/doc-writer/SKILL.md (Chinese)
4. Update README.md if description changes
5. Update README.zh-CN.md if description changes
6. Run pnpm lint
7. Commit: "update: improve doc-writer skill"
```

### Scenario 3: Fixing a Translation Error

```
User: Fix the Chinese translation in code-commentator

Agent Actions:
1. Read skills/code-commentator/SKILL.md (English)
2. Read skills_zh-CN/code-commentator/SKILL.md (Chinese)
3. Identify and fix translation errors
4. Verify consistency with English version
5. Run pnpm lint
6. Commit: "fix: correct code-commentator Chinese translation"
```

---

## 8. Error Handling

### Missing Chinese Translation

If a skill exists in English but not in Chinese:

1. Create the Chinese translation immediately
2. Ensure it matches the English version
3. Update README.zh-CN.md if needed
4. Commit with: `fix: add missing Chinese translation for [skill-name]`

### Inconsistent README

If README files are out of sync with skills:

1. Audit all skills in `skills/` directory
2. Verify each skill has entry in README.md
3. Verify each skill has entry in README.zh-CN.md
4. Update statistics and descriptions
5. Commit with: `docs: sync README with current skills`

### Format Errors

If `pnpm lint` reports errors:

1. Read the error messages carefully
2. Fix formatting issues in affected files
3. Re-run `pnpm lint` to verify
4. Commit fixes with: `style: fix formatting in [file-names]`

---

## 9. Reference

### Directory Structure

```
skills/
├── skills/
│   ├── code-commentator/
│   │   └── SKILL.md
│   ├── collaborative-doc-writer/
│   │   └── SKILL.md
│   ├── doc-writer/
│   │   └── SKILL.md
│   └── i18n-doc-translator/
│       └── SKILL.md
├── skills_zh-CN/
│   ├── code-commentator/
│   │   └── SKILL.md
│   ├── collaborative-doc-writer/
│   │   └── SKILL.md
│   ├── doc-writer/
│   │   └── SKILL.md
│   └── i18n-doc-translator/
│       └── SKILL.md
├── LICENSE
├── README.md
├── README.zh-CN.md
└── AGENT.md
```

### Related Tools

- **skill-creator**: Use to create or update skills
- **find-skills**: Use to discover available skills

### Related Documentation

- [README.md](./README.md) - Project overview and skill list
- [README.zh-CN.md](./README.zh-CN.md) - Chinese project overview
- [LICENSE](./LICENSE) - MIT License

---

## 10. Summary

| Phase | Action | Output |
|-------|--------|--------|
| Create | Develop English skill | `skills/[name]/SKILL.md` |
| Translate | Create Chinese version | `skills_zh-CN/[name]/SKILL.md` |
| Document | Update READMEs | `README.md`, `README.zh-CN.md` |
| Verify | Run quality checks | Lint passes, structure correct |
| Commit | Submit changes | Standardized commit message |

**Remember**: Every skill operation must complete all five phases. Partial completion is not acceptable.
