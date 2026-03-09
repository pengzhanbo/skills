---
name: i18n-doc-translator
description: Professional multilingual documentation translator for projects, automatically detecting project configuration, synchronizing directory structure, executing high-quality translation, and verifying completeness. Use this skill when users mention "translate documentation", "multilingual documentation", "i18n documentation", "i18n", "document localization", "translate documentation", or need to translate documents to other languages.
license: MIT
metadata:
  version: "1.0.0"
---

# Multilingual Documentation Translation Skill

This skill provides professional multilingual documentation translation capabilities for projects, automatically detecting project configuration, synchronizing directory structure, executing high-quality translation, and verifying completeness.

## Trigger Conditions

Activate this skill proactively when the following situations are detected:

- Users mention translating documents: "translate documentation", "multilingual documentation", "i18n documentation", "i18n", "document localization"
- Users mention specific translation needs: "translate documents to English", "generate Japanese version documentation"
- Users mention translation-related operations: "update translation", "sync multilingual documentation"
- English trigger words: "translate documentation", "i18n docs", "localize docs"

---

## Phase 1: Project Configuration Detection

Before executing translation, comprehensively detect the project's documentation configuration and structure.

### 1.1 Detect Static Site Generator

Check the documentation tool used by the project and identify configuration files:

| Tool | Configuration File | Default Language Configuration Location |
|------|-------------------|----------------------------------------|
| VitePress | `.vitepress/config.mts` or `config.ts` | `locales.root` or `defaultLang` |
| Hugo | `hugo.toml` / `config.toml` | `defaultContentLanguage` |
| Jekyll | `_config.yml` | `lang` or `defaults.lang` |
| Hexo | `_config.yml` | `language` |
| Docusaurus | `docusaurus.config.js` | `i18n.defaultLocale` |
| Next.js Nextra | `next.config.js` or theme config | `i18n.defaultLocale` |

**Detection Process**:

1. Check if the above configuration files exist in the project root directory
2. Parse configuration files and extract default language settings
3. Identify documentation directory structure pattern

### 1.2 Identify Documentation Directory Structure Pattern

Based on project configuration and existing documentation structure, identify multilingual directory patterns:

**Pattern 1: Subdirectory Pattern (Recommended)**

```
docs/
├── zh/           # Chinese documentation
│   ├── guide/
│   │   └── getting-started.md
│   └── index.md
├── en/           # English documentation
│   ├── guide/
│   │   └── getting-started.md
│   └── index.md
└── .vitepress/
    └── config.mts
```

**Pattern 2: Root Directory Pattern**

```
docs/
├── guide/
│   └── getting-started.md    # Default language
└── index.md
en/
├── guide/
│   └── getting-started.md    # English translation
└── index.md
```

**Pattern 3: Filename Suffix Pattern**

```
docs/
├── guide/
│   ├── getting-started.md      # Default language
│   ├── getting-started.en.md   # English translation
│   └── getting-started.ja.md   # Japanese translation
└── index.md
```

### 1.3 Determine Default Language

Determine the default language of documentation in the following priority:

1. Read default language settings from configuration file
2. Check existing documentation content and identify through language features
3. If unable to determine, ask user for confirmation

### 1.4 Determine Target Language

Determine target language through the following process:

1. User explicitly specifies target language in request → Use specified language
2. Read supported language list from project configuration → Confirm translation target
3. Unable to determine → Use AskUserQuestion tool to ask user

---

## Phase 2: Directory Structure Synchronization

Ensure target language directory structure is completely consistent with source language.

### 2.1 Scan Source Documentation Structure

Recursively scan default language directory and record all documentation files:

```markdown
## Source Documentation Structure

- Default Language: zh
- Documentation Directory: docs/zh
- Total Files: 15

### File List
1. docs/zh/index.md
2. docs/zh/guide/getting-started.md
3. docs/zh/guide/configuration.md
4. docs/zh/api/overview.md
...
```

### 2.2 Create Target Directory Structure

Create directory structure consistent with source language in target language directory:

**Execution Steps**:

1. Get relative paths of all files under source language directory
2. Create corresponding directory structure under target language directory
3. Ensure directory hierarchy is completely consistent

**Example**:

```
Source Language: zh, Target Language: en

Source Structure:                    Target Structure:
docs/zh/                             docs/en/
├── guide/                           ├── guide/
│   └── intro.md    →                │   └── intro.md (to be translated)
└── api/                             └── api/
    └── reference.md                     └── reference.md (to be translated)
```

### 2.3 Verify Directory Structure

After completing translation, verify directory structure completeness:

- Check if all source files have corresponding target language files
- Check if directory hierarchy is consistent
- Report missing files or directories

---

## Phase 3: Translation Execution

Execute high-quality documentation translation, ensuring "faithfulness, expressiveness, and elegance" translation standards.

### 3.1 Translation Principles

**Faithfulness**

- Accurately convey original meaning without adding or subtracting information
- Maintain accuracy of technical terminology
- Preserve code examples, links, images, and other elements from the original

**Expressiveness**

- Use natural expression methods of the target language
- Follow writing conventions of the target language
- Maintain professionalism and readability of documentation

**Elegance**

- Ensure translation is fluent and easy to understand
- Avoid translationese and stiff expressions
- Appropriately adjust sentence structure to conform to target language conventions

### 3.2 Translation Rules

**Technical Terminology Handling**

| Situation | Handling Method | Example |
|-----------|-----------------|---------|
| General technical terms | Keep English or use standard translation | API → API, Algorithm → Algorithm |
| Project-specific terms | Maintain consistency | Component names, configuration item names not translated |
| Code-related | Completely preserve | Variable names, function names, commands not translated |
| Link paths | Adjust as needed | Internal links may need path adjustment |

**Markdown Element Handling**

```markdown
# Heading Translation
## Heading Translation

Body content translation, maintaining **bold** and `code` formatting.

- List item translation
- Maintain list structure

> Blockquote translation

[Link text translation](url-unchanged)

![Image alt text translation](image-path.png)

| Header Translation | Header Translation |
|--------------------|--------------------|
| Content Translation | Content Translation |

```language
// Code blocks not translated, but comments can be translated
const example = "code"; // Example code
```

**Frontmatter Handling**

```yaml
---
title: Translated Title
description: Translated Description
lang: en  # Update language identifier
---
```

### 3.3 Incremental Translation Strategy

Perform incremental translation based on file modification times:

**Detection Process**:

1. Get last modification time of source file `source_mtime`
2. Get last modification time of target file `target_mtime`
3. Compare:
   - `source_mtime > target_mtime` → Translation update needed
   - Target file doesn't exist → New translation needed
   - `source_mtime <= target_mtime` → Skip (translation is up-to-date)

**Execution Strategy**:

```markdown
## Translation Plan

### New Translations Needed (3 files)
- docs/en/guide/new-feature.md
- docs/en/api/new-endpoint.md
- docs/en/changelog.md

### Translation Updates Needed (2 files)
- docs/en/index.md (source file updated)
- docs/en/guide/configuration.md (source file updated)

### Skip Translation (10 files)
- docs/en/guide/getting-started.md (already up-to-date)
- ...
```

### 3.4 Translation Execution Process

**Single File Translation Process**:

1. Read source file content
2. Parse Markdown structure
3. Translate content segment by segment (preserving code blocks, links, etc.)
4. Update language identifier in frontmatter
5. Write target file
6. Record translation log

**Batch Translation Process**:

1. Scan and categorize files (new/update/skip)
2. Display translation plan, confirm user intent
3. Execute translation in order
4. Report progress in real-time
5. Generate translation report after completion

---

## Phase 4: Translation Verification

After completing translation, perform comprehensive quality verification.

### 4.1 Structure Completeness Verification

Check if target language directory structure is complete:

**Verification Checklist**:

- [ ] All source files have corresponding target language files
- [ ] Directory hierarchy is completely consistent
- [ ] File naming conventions are consistent
- [ ] No missing files

**Verification Report Example**:

```markdown
## Structure Verification Report

### Passed Items
✅ Directory structure consistent
✅ File count matches (15/15)
✅ File naming conventions correct

### Missing Files
❌ docs/en/advanced/performance.md (source file exists, target file missing)

### Extra Files
⚠️ docs/en/deprecated/old-feature.md (source file deleted, target file still exists)
```

### 4.2 Content Completeness Verification

Check completeness of translated content:

**Verification Items**:

- [ ] Heading count consistent
- [ ] Paragraph count consistent
- [ ] Code block count consistent
- [ ] Link count consistent
- [ ] Image count consistent
- [ ] Table structure consistent

### 4.3 Translation Quality Check

**Basic Checks**:

- Are there untranslated paragraphs
- Are there translation errors or ambiguities
- Is technical terminology consistent
- Is formatting correct

**Terminology Consistency Check**:

Build a terminology table to ensure the same term is translated consistently across all documents:

| Source Term | Target Language Translation | Notes |
|-------------|----------------------------|-------|
| Component | Component | Unified use |
| Configuration | Configuration | Unified use |
| Hook | Hook | Unified use |

### 4.4 Link Validity Verification

Check links in translated documents:

- Internal links: Ensure corresponding files exist in target language version
- External links: Ensure links are still valid
- Anchor links: Ensure target headings exist

---

## Phase 5: Reporting and Delivery

Generate translation report summarizing translation results.

### 5.1 Translation Report Format

```markdown
# Documentation Translation Report

## Overview
- Source Language: Chinese (zh)
- Target Language: English (en)
- Translation Time: 2026-03-08 10:30:00
- Total Duration: 5 minutes

## Statistics

| Item | Count |
|------|-------|
| Total Source Files | 15 |
| New Translations | 3 |
| Updated Translations | 2 |
| Skipped Translations | 10 |
| Total Words Translated | Approximately 5,000 |

## File Details

### New Translations
1. docs/en/guide/new-feature.md
2. docs/en/api/new-endpoint.md
3. docs/en/changelog.md

### Updated Translations
1. docs/en/index.md
2. docs/en/guide/configuration.md

### Skipped Translations
1. docs/en/guide/getting-started.md
2. docs/en/guide/installation.md
...

## Verification Results

✅ Structure Completeness: Passed
✅ Content Completeness: Passed
✅ Link Validity: Passed
⚠️ Terminology Consistency: 1 inconsistency found (recorded)

## Notes
- Recommend manual review of newly translated content
- Some technical terms may need adjustment based on context
```

---

## Common Scenario Handling

### Scenario 1: First-time Translation of Entire Project

```
User: Translate this project's documentation to English

Agent:
1. Detect project configuration: Found using VitePress, default language is Chinese
2. Scan documentation directory: Found 20 documentation files
3. Create target directory: docs/en/
4. Confirm translation plan: Translate all 20 files
5. Execute translation
6. Verify completeness
7. Generate report
```

### Scenario 2: Incremental Translation Update

```
User: Update English documentation

Agent:
1. Detect project configuration
2. Compare modification times
3. Found 3 files need updating
4. Display update plan
5. Execute incremental translation
6. Verify and report
```

### Scenario 3: Translate Single File

```
User: Translate docs/zh/guide/getting-started.md to Japanese

Agent:
1. Read source file
2. Check if target directory exists
3. Execute translation
4. Write to docs/ja/guide/getting-started.md
5. Verify translation quality
```

### Scenario 4: Add New Language Support

```
User: Add Japanese documentation support

Agent:
1. Detect existing documentation structure
2. Create docs/ja/ directory
3. Copy directory structure
4. Translate all documents
5. Update project configuration file (e.g., VitePress config)
6. Verify and report
```

---

## Configuration File Updates

After translation is complete, update project configuration files as needed.

### VitePress Configuration Update

```typescript
// .vitepress/config.ts
export default defineConfig({
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh',
    },
    en: {
      label: 'English',
      lang: 'en-US',
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
    }
  }
})
```

### Hugo Configuration Update

```toml
# hugo.toml
defaultContentLanguage = 'zh'
languages:
  zh:
    title: 项目文档
    weight: 1
  en:
    title: Project Documentation
    weight: 2
```

---

## Quality Checklist

After completing translation, use the following checklist for self-check:

### Structure Check
- [ ] Is directory structure complete and consistent?
- [ ] Does file count match?
- [ ] Is file naming standardized?

### Content Check
- [ ] Are all paragraphs translated?
- [ ] Are code blocks preserved completely?
- [ ] Are links correct?
- [ ] Do images display properly?

### Quality Check
- [ ] Is translation accurate?
- [ ] Is expression natural and fluent?
- [ ] Is terminology consistent?
- [ ] Is formatting correct?

### Configuration Check
- [ ] Is project configuration updated?
- [ ] Are language identifiers correct?
- [ ] Is navigation menu updated?

---

## Notes

1. **Maintain Consistency**: Same term must be translated consistently across all documents
2. **Respect Original**: Accurately convey original meaning without arbitrarily adding or removing content
3. **Localized Expression**: Use natural expression methods of the target language
4. **Technical Accuracy**: Maintain accuracy of technical terminology and code examples
5. **Format Standards**: Maintain correctness of Markdown formatting
6. **Link Maintenance**: Ensure all links remain valid after translation
