---
name: collaborative-doc-writer
description: Collaborative document creation skill that provides a structured three-phase workflow (background collection, structure optimization, reader testing) to guide users through high-quality document writing. Use this skill when users mention "write documentation", "draft proposal", "create specification", "product requirements document", "design document", "decision document", "request for comments", or start an important writing task.
license: MIT
metadata:
  version: "1.0.0"
---

# Collaborative Document Creation Skill

This skill provides a structured workflow to guide users through collaborative document creation. As a proactive guide, it leads users through three phases: background information collection, content optimization and structure building, and reader testing.

## Trigger Conditions

Activate this skill proactively when the following situations are detected:

- Users mention writing documents: such as "write documentation", "draft proposal", "create specification", "compose document"
- Users mention specific document types: such as "product requirements document", "design document", "decision document", "request for comments"
- Users appear to be starting an important writing task

## Initial Proposal Process

### Step 1: Introduce the Collaborative Document Creation Method

When trigger conditions are detected, first explain to the user:

**Collaborative Document Creation Process**

I will guide you through three phases to complete document creation:

1. **Background Collection Phase**: You provide all relevant background information while I ask clarifying questions
2. **Optimization and Structure Phase**: Build each section through brainstorming and editing iterations
3. **Reader Testing Phase**: Use a fresh Agent (without background information) to test the document and discover blind spots before others read it

This approach helps ensure documents work well when read by others (including when pasted into an Agent).

### Step 2: Ask User Preferences

Use the AskUserQuestion tool to ask the user:

**Question**: Would you like to use this collaborative process, or do you prefer free-form creation?

**Options**:
- **Collaborative Process (Recommended)**: Complete high-quality documents through three-phase guidance
- **Free-form Creation**: Start writing directly without structured guidance

### Step 3: Execute Based on User Choice

- **If user accepts**: Enter Phase 1 - Background Collection
- **If user declines**: Switch to free-form creation mode and help user write documents directly

---

## Phase 1: Background Information Collection

### Objective

Comprehensively collect background information needed for the document, ensuring subsequent writing has sufficient contextual support.

### Execution Steps

#### 1.1 Initial Information Collection

Proactively ask the following core questions:

**Document Basic Information**
- What is the main purpose of this document?
- Who are the target readers? What are their backgrounds and expectations?
- What is the usage scenario of the document? (Internal decision-making, external communication, archival records, etc.)

**Content Scope**
- What topics does the document need to cover?
- What key information must be included?
- Are there specific format requirements or templates?

**Contextual Background**
- Are there related existing documents or reference materials?
- Are there specific constraints (time, resources, policies, etc.)?
- Are there specific needs from stakeholders?

#### 1.2 Clarifying Questions

Based on information provided by the user, ask targeted clarifying questions:

- For vague expressions, ask for specifics
- For potentially missing important information, proactively ask
- For contradictory information, request clarification

#### 1.3 Information Organization and Confirmation

Organize collected information into a structured summary and ask user to confirm:

```markdown
## Document Background Information Summary

### Basic Information
- **Document Purpose**: [Purpose description]
- **Target Readers**: [Reader group]
- **Usage Scenario**: [Scenario description]

### Content Scope
- **Main Topics**: [Topic list]
- **Key Information**: [Information points]
- **Format Requirements**: [Format description]

### Context
- **Related Documents**: [Document list]
- **Constraints**: [Constraint description]
- **Stakeholder Needs**: [Needs description]

### Items to Confirm
- [ ] Item 1
- [ ] Item 2
```

### Completion Criteria

Enter the next phase when the following conditions are met:

- All key information has been collected
- User confirms the background information summary is accurate
- No major omissions or unclear content

---

## Phase 2: Content Optimization and Structure Building

### Objective

Build clear, complete, and persuasive document content through iterative writing and optimization.

### Execution Steps

#### 2.1 Document Structure Planning

Based on collected background information, propose document structure suggestions:

**Standard Document Structure Template**

```markdown
# [Document Title]

## Executive Summary
[Brief overview of core document content, suitable for quick reading]

## Background
[Explain the background and necessity of the document]

## Objectives and Scope
[Clarify the goals to be achieved and applicable scope]

## Core Content
[Adjust this section based on document type]

### [Subtopic 1]
### [Subtopic 2]
### [Subtopic 3]

## Implementation Plan
[Specific action steps and timeline]

## Risks and Mitigation
[Potential risks and response strategies]

## Appendix
[Supplementary materials, references, etc.]
```

Adjust structure based on document type:

- **Product Requirements Document**: Add user stories, functional specifications, acceptance criteria
- **Design Document**: Add design solutions, technology selection, implementation details
- **Decision Document**: Add decision options, impact analysis, implementation path
- **Proposal Document**: Add problem statement, solution, expected benefits

#### 2.2 Segment-by-Segment Writing

Use iterative writing method:

**Step 1: Write Segment by Segment**
- Write content segment by segment according to document structure
- After completing each major section, pause and ask for user feedback
- Adjust and optimize content based on feedback

**Step 2: Brainstorming**
- For key chapters, use brainstorming techniques
- Propose multiple alternative solutions or expression methods
- Discuss with user to select the best solution

**Step 3: Editing Iteration**
- Conduct multiple rounds of editing on completed content
- Focus on logical coherence, expression clarity, content completeness
- Ensure consistent document style

#### 2.3 Quality Checkpoints

After completing each major section, conduct quality checks:

**Content Quality**
- [ ] Is the information accurate and complete?
- [ ] Is the argumentation logical?
- [ ] Is there any missing important content?

**Expression Quality**
- [ ] Is the language clear and easy to understand?
- [ ] Are there ambiguities or vague expressions?
- [ ] Are technical terms used appropriately?

**Structure Quality**
- [ ] Is the chapter arrangement reasonable?
- [ ] Is there duplicate or redundant content?
- [ ] Is the logical flow smooth?

#### 2.4 User Confirmation

After completing the draft, ask user to confirm:

```markdown
## Document Draft Completed

The following sections have been completed:
- [ ] Executive Summary
- [ ] Background
- [ ] Objectives and Scope
- [ ] Core Content (X subtopics)
- [ ] Implementation Plan
- [ ] Risks and Mitigation

Please review the draft and provide feedback:
1. Is the content complete?
2. Is the expression clear?
3. Does the structure need adjustment?
4. Is there any missing important information?
```

### Completion Criteria

Enter the next phase when the following conditions are met:

- Document content is complete, covering all necessary topics
- User is satisfied with the draft, no major revision needs
- Document logic is clear, expression is accurate

---

## Phase 3: Reader Testing

### Objective

Test document readability and effectiveness using a fresh perspective to discover potential blind spots and issues.

### Execution Steps

#### 3.1 Test Preparation

Explain test purpose and method to the user:

**Reader Testing Instructions**

Now we will conduct reader testing. I will start a new Agent session that has no background from our previous conversation, completely simulating a reader encountering this document for the first time.

Test objectives:
- Verify if the document is easy to understand
- Discover possible ambiguities or vague expressions
- Identify missing important information
- Evaluate document persuasiveness and completeness

#### 3.2 Execute Testing

**Test Method 1: Comprehension Test**

Start a new Agent session, provide document content, and ask:

```
Please read the following document, then answer:

1. What is the main purpose of this document?
2. What are the core points of the document?
3. Do you think the target readers can understand the document content?
4. Which parts confuse you?
5. Do you think the document is missing important information?
6. If you were the target reader, would this document meet your needs?

[Document content]
```

**Test Method 2: Scenario Simulation Test**

Based on document type, simulate real usage scenarios:

- **Product Requirements Document**: Simulate development team reading and extracting requirements
- **Design Document**: Simulate technical review meeting discussion
- **Decision Document**: Simulate decision meeting discussion
- **Proposal Document**: Simulate approval process

#### 3.3 Problem Identification and Fixing

Based on test results, identify problems and fix them:

**Common Problem Types**

1. **Understanding Barriers**
   - Technical terms not explained
   - Logical jumps
   - Insufficient background information

2. **Information Omissions**
   - Missing key details
   - Assumed prerequisite knowledge
   - Incomplete context

3. **Expression Issues**
   - Ambiguous expressions
   - Redundant content
   - Disorganized structure

**Fix Process**

```markdown
## Problems Found in Testing

### Problem 1: [Problem description]
- **Impact**: [Impact on readers]
- **Location**: [Document location]
- **Fix Suggestion**: [Specific fix plan]

### Problem 2: [Problem description]
...

## Fix Plan

1. [ ] Fix problem 1
2. [ ] Fix problem 2
3. [ ] Re-test fixed content
```

#### 3.4 Final Confirmation

After completing all fixes, conduct final confirmation:

```markdown
## Document Completed

After three-phase collaborative creation, the document is ready:

✅ Background information collection complete
✅ Content optimization and structure building complete
✅ Reader testing passed

Document quality assurance:
- Information is complete and accurate
- Expression is clear and easy to understand
- Logic is coherent and reasonable
- Reader testing verification passed

Document saved to: [File path]
```

### Completion Criteria

Document creation process is complete when the following conditions are met:

- Reader testing found no major issues
- All identified issues have been fixed
- User is satisfied with the final document

---

## Special Scenario Handling

### Scenario 1: User Changes Requirements Midway

If user changes requirements during writing:

1. Pause current work
2. Re-collect background information (return to Phase 1)
3. Evaluate reusability of completed content
4. Adjust document structure and content
5. Continue collaborative process

### Scenario 2: Document Type Unclear

If user doesn't specify document type:

1. Ask about the main purpose of the document
2. Provide common document type options
3. Determine document type based on user selection
4. Apply corresponding templates and structure

### Scenario 3: Time Pressure

If user needs to complete document quickly:

1. Ask about the most critical deadline
2. Simplify process, skip non-essential steps
3. Prioritize completing core content
4. Mark sections to be refined for later optimization

### Scenario 4: Multi-person Collaboration

If document requires multi-person collaboration:

1. Clarify roles and responsibilities of each party
2. Establish collaboration process and communication mechanisms
3. Assign writing tasks
4. Set review and integration checkpoints

---

## Best Practices

### Writing Principles

1. **Reader-Oriented**: Always consider target readers' needs and background
2. **Clear and Concise**: Avoid redundancy, use simple and clear language
3. **Logically Coherent**: Ensure content has a clear logical flow
4. **Evidence-Based**: Important assertions should be supported by data or facts

### Collaboration Techniques

1. **Proactive Guidance**: Proactively ask questions and make suggestions rather than passively waiting
2. **Iterative Optimization**: Continuously improve content through multiple iterations
3. **Timely Feedback**: Ask for user confirmation and feedback at each phase
4. **Flexible Adjustment**: Adjust methods and pace flexibly based on user feedback

### Quality Assurance

1. **Completeness Check**: Ensure all necessary information is included
2. **Consistency Check**: Ensure terminology, format, and style are consistent
3. **Accuracy Check**: Verify accuracy of data, facts, and citations
4. **Readability Check**: Ensure document is easy to read and understand

---

## Tools and Resources

### Document Template Library

Provide corresponding templates based on document type:

- Product Requirements Document Template
- Technical Design Document Template
- Decision Record Document Template
- Project Proposal Document Template
- Meeting Minutes Template

### Writing Assistance Tools

- Logical structure checklist
- Expression optimization suggestions
- Technical terminology dictionary
- Format specification guide

### Quality Check Tools

- Completeness checklist
- Readability scoring tool
- Consistency check tool
- Reader test questionnaire template

---

## Example Dialogue Flow

### Example 1: Product Requirements Document Creation

```
User: I need to write a product requirements document

Agent: I will guide you through the collaborative document creation process to complete this product requirements document.

This process includes three phases:
1. Background Collection: Collect product background, user needs, and other information
2. Optimization and Structure: Build each section of the PRD
3. Reader Testing: Simulate development team reading to discover potential issues

Would you like to use this collaborative process, or do you prefer free-form creation?

User: Use the collaborative process

Agent: Great, let's start Phase 1: Background Information Collection.

First, please tell me:
1. What is the main function of this product?
2. Who are the target users?
3. What problem does it solve?

User: This is a task management tool, targeting project managers, solving the problem of chaotic team collaboration...

[Continue collecting information and proceed to next phase]
```

### Example 2: Technical Design Document Creation

```
User: Help me draft a system architecture design document

Agent: I will use the collaborative document creation process to help you complete this architecture design document.

This process includes three phases:
1. Background Collection: Understand system background, technical constraints, etc.
2. Optimization and Structure: Build each part of the design document
3. Reader Testing: Simulate technical review to verify document quality

Would you like to use this collaborative process, or do you prefer free-form creation?

User: Collaborative process

Agent: Excellent, let's start with background collection.

Please tell me:
1. What is the core function of this system?
2. What are the technical constraints or requirements?
3. What are the expected system scale and performance requirements?

User: This is an e-commerce system that needs to support high concurrency...

[Continue collaborative process]
```

---

## Notes

1. **Stay Proactive**: As a guide, proactively ask questions and make suggestions
2. **Focus on User Experience**: Ensure smooth process, avoid making users feel cumbersome
3. **Be Flexible**: Adjust process and pace based on specific situations
4. **Quality First**: Better to spend more time ensuring quality than to rush completion
5. **Respect Users**: Final decision-making power lies with the user, respect user choices and preferences
