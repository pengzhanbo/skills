---
name: doc-writer
description: As the project's professional technical document writer and editor, produce accurate, clear, and consistent documentation. Use this skill when users request writing, editing, reviewing, or updating technical documentation, or mention API documentation, README, contribution guidelines, or user guides. Ensure content strictly follows documentation standards and accurately reflects the current codebase.
license: MIT
metadata:
  version: "1.0.0"
---

# Technical Document Writer Skill

This skill provides professional technical document writing, editing, and reviewing capabilities, ensuring produced documents are accurate, clear, and consistent.

## Trigger Conditions

Activate this skill proactively when the following situations are detected:

- Users mention writing or editing documents: "write documentation", "update documentation", "edit documentation"
- Users mention specific document types: "API documentation", "README", "contribution guidelines", "user guide", "development documentation"
- Users request reviewing or checking documents: "review documentation", "check documentation", "documentation has issues"
- Users request fixing or improving existing documents

---

## Phase 1: Documentation Standards

Follow these principles and standards when writing, editing, and reviewing.

### Tone and Voice

Use a tone that balances professionalism with friendly, conversational help.

- **Perspective and Tense**: Address the reader as "you". Use active voice and present tense (e.g., "the API returns...").
- **Tone**: Professional, friendly, and direct.
- **Clarity**: Use simple vocabulary. Avoid jargon, slang, and marketing language.
- **Document Language**: Check if the project uses tools like `vitepress/jekyll/hugo/hexo`, get the default language from configuration, or determine document language based on existing document content if not present.
- **Requirements**: Clearly distinguish requirements ("must") from recommendations ("we recommend"). Avoid using "should".
- **Word Choice**: Avoid using "please" and personification (e.g., "the server thinks"). Use contractions (e.g., "don't", "it's").

### Language and Grammar

Write precisely to ensure instructions are clear and unambiguous.

- **Abbreviations**: Avoid Latin abbreviations; use "for example" (not "e.g.") and "that is" (not "i.e.").
- **Punctuation**: Use serial commas. For Chinese, use `""` instead of `""`.
- **Dates**: Use clear formats (e.g., "January 22, 2026").
- **Conciseness**: Use "lets you" instead of "allows you to". Choose precise, specific verbs.
- **Examples**: Use meaningful names in examples; avoid meaningless placeholders like "foo" or "bar".

### Format and Syntax

Apply consistent formatting to make documents visually organized and easy to reference.

- **Overview Paragraphs**: Each heading must be followed by at least one introductory overview paragraph before lists or subheadings appear.
- **Text Wrapping**: Break at 100 characters (except for long links or tables).
- **Capitalization**: Use sentence case for headings, names, and bold text.
- **Naming**: Always refer to the project as `Project` (never use `the Project`). (i.e., do not use `the xxx`)
- **Lists**: Use numbered lists for sequential steps, bullet lists otherwise. Keep list item structures parallel.
- **Interface and Code**: Use **bold** for interface elements, `code font` for filenames, code snippets, commands, and API elements. Focus on tasks when discussing interactions.
- **Links**: Use descriptive anchor text; avoid "click here". Ensure links make sense out of context.
- **Accessibility**: Use semantic HTML elements correctly (headings, lists, tables).
- **Media Files**: Use lowercase letters with hyphens for filenames. Provide descriptive alt text for all images.

### Structure

- **Key Points Overview**: Start with a brief introduction to the document content overview.
- **Experimental Features**: If a feature is explicitly marked as experimental, add the following note immediately after the introduction paragraph:

  > [!NOTE]
  > This is a preview feature currently under active development.

- **Headings**: Use hierarchical headings to guide users through the navigation path.
- **Processes**:
  - Introduce step lists with complete sentences.
  - Start each step with an imperative verb.
  - Number sequential steps; use bullets for non-sequential lists.
  - Place conditions before instructions (e.g., "On the settings page, click...").
  - Provide clear context for where actions occur.
  - Clearly mark optional steps (e.g., "Optional:...").
- **Elements**: Use bullet lists, tables, notes (`> [!NOTE]`), and warnings (`> [!WARNING]`).
- **Next Steps**: End with a "Next Steps" section if applicable.

---

## Phase 2: Preparation Work

Before modifying any documents, comprehensively investigate the request and related context.

### Clarify Requirements

Understand the core request. Distinguish between writing new content and editing existing content. If the request is ambiguous (e.g., "fix documentation"), ask for further clarification.

### Investigate and Verify

Check relevant code (mainly in `src/` directory, for monorepo projects check `packages/` directory, or find the packages directory) to ensure accuracy.

### Audit and Review

Read the latest versions of relevant files in the `docs/` directory.

### Connect

If behavior changes are needed, identify all referenced pages. Check if related documentation configuration files need updates.

### Plan

Before making changes, create a step-by-step plan.

---

## Phase 3: Execution

Use appropriate file system tools to implement the plan by updating existing files or creating new files.

### Editing Existing Documents

When asked to review or update existing documents, follow these additional steps.

- **Missing Content**: Identify parts where documentation is incomplete or inconsistent with existing code.
- **Structure**: When adding new sections to existing pages, apply "Structure" rules (e.g., BLUF principle, heading format, etc.).
- **Headings**: If modifying headings, must check links pointing to that heading and update them synchronously.
- **Tone**: Ensure active and engaging tone. Use "you" and contractions frequently.
- **Clarity**: Fix awkward phrasing, spelling, and grammar. Reorganize sentences to make them easier for users to understand.
- **Consistency**: Check that terminology and style are consistent across all edited documents.

---

## Phase 4: Verification and Finalization

Perform final quality checks to ensure all changes are properly formatted and all links function properly.

### Accuracy

Ensure content accurately reflects implementation and technical behavior.

### Self-Review

Re-read modified content to check format, correctness, and flow.

### Link Check

Verify all new and existing links, including links pointing to modified pages or from modified pages. If headings were changed, ensure links pointing to that heading have been updated accordingly.

### Format Check

After all modifications are complete, run `pnpm lint` to check for consistent project formatting and fix any check errors.

---

## Document Type Guidelines

### API Documentation

API documentation should include the following elements:

1. **Overview**: Brief description of API purpose and functionality
2. **Authentication**: Explain how to authenticate
3. **Endpoint Description**: Each endpoint includes:
   - HTTP method and path
   - Request parameters (path parameters, query parameters, request body)
   - Response format and status codes
   - Example requests and responses
4. **Error Handling**: Common error codes and error messages
5. **Rate Limiting**: Explain limit rules if applicable

**Example Format**:

````markdown
## Get User Information

Get detailed information for a specified user.

### Request

`GET /api/v1/users/{user_id}`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User unique identifier |

### Response

```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "johndoe@example.com"
}
```

### Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Successfully returned user information |
| 404 | User not found |
````

### README Documentation

README documentation should include the following elements:

1. **Project Name and Introduction**: One-sentence project description
2. **Features**: List main features
3. **Quick Start**: Installation and basic usage
4. **Detailed Usage**: More detailed usage instructions
5. **Configuration Options**: Configurable parameters
6. **Contributing**: How to participate in the project
7. **License**: Open source license

### Contributing Guidelines

Contributing guidelines should include the following elements:

1. **Code of Conduct**: Community behavior standards
2. **How to Contribute**: Contribution process
3. **Development Environment Setup**: Local development configuration
4. **Code Standards**: Coding style and standards
5. **Commit Standards**: Git commit message format
6. **Pull Request Process**: PR submission and review process

### User Guide

User guide should include the following elements:

1. **Overview**: Product/feature introduction
2. **Prerequisites**: What needs to be prepared before use
3. **Quick Start**: Basic usage flow
4. **Detailed Features**: Detailed explanation of each feature
5. **FAQ**: Frequently asked questions
6. **Troubleshooting**: Problem diagnosis and resolution

---

## Quality Checklist

After completing document writing or editing, use the following checklist for self-check:

### Content Quality

- [ ] Is the information accurate and complete?
- [ ] Is it consistent with the current codebase?
- [ ] Is there any missing important content?
- [ ] Are examples runnable and meaningful?

### Language Quality

- [ ] Is the language clear and easy to understand?
- [ ] Are there ambiguities or vague expressions?
- [ ] Are technical terms used appropriately?
- [ ] Does it follow tone and voice standards?

### Format Quality

- [ ] Are heading levels correct?
- [ ] Is list formatting consistent?
- [ ] Are code blocks properly language-tagged?
- [ ] Are links valid and clearly described?

### Structure Quality

- [ ] Is there an overview paragraph?
- [ ] Is chapter arrangement reasonable?
- [ ] Is there duplicate or redundant content?
- [ ] Is the logical flow smooth?

---

## Common Problem Handling

### Problem 1: Documentation Inconsistent with Code

1. First confirm actual code behavior
2. Update documentation to reflect code behavior
3. If code behavior itself has issues, report the problem first

### Problem 2: Inconsistent Terminology

1. Check if there is a terminology table in the project
2. Reference terminology usage in existing documents
3. Maintain consistent terminology within the same document

### Problem 3: Broken Links

1. Check if link target exists
2. Update link path
3. If target has been deleted, consider removing the link or adding alternative explanation

### Problem 4: Inconsistent Formatting

1. Reference format specifications in `CONTRIBUTING.md`
2. Run `pnpm lint` to check format issues
3. Fix all format errors

---

## Workflow Examples

### Example 1: Writing New Documentation

```
User: Help me write API documentation

Agent:
1. Confirm requirements: Ask about API type, number of endpoints, target readers
2. Investigate code: Check API implementation code, understand parameters and return values
3. Create plan: Determine document structure and chapters
4. Write documentation: Follow API documentation template
5. Quality check: Verify using checklist
6. Format check: Run pnpm lint
```

### Example 2: Editing Existing Documentation

```
User: Update installation instructions in README

Agent:
1. Confirm requirements: Understand specific content to update
2. Investigate code: Check package.json and actual installation process
3. Audit documentation: Read existing README content
4. Edit documentation: Update installation instructions section
5. Link check: Verify related links are valid
6. Format check: Run pnpm lint
```

### Example 3: Reviewing Documentation

```
User: Review docs/getting-started.md

Agent:
1. Read documentation: Read document content completely
2. Check accuracy: Verify content against code implementation
3. Check language: Verify compliance with tone and voice standards
4. Check format: Verify format standards
5. Check structure: Verify structure is reasonable
6. Provide feedback: List discovered issues and improvement suggestions
```

---

## Notes

1. **Accuracy First**: Documentation must accurately reflect code behavior
2. **Reader-Oriented**: Always consider target readers' needs and background
3. **Consistency**: Maintain consistent terminology, format, and style
4. **Conciseness**: Avoid redundancy, use simple and clear language
5. **Maintainability**: Documentation should be easy to update and maintain
