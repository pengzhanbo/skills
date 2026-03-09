---
name: code-commentator
description: Expert in code annotation supplementation and standardization, automatically identifies code file types and adds professional bilingual comments for functions, classes, methods, properties, and other code elements. Use this skill when users mention "add comments", "supplement comments", "standardize comments", "code comments", "annotate code", "add comments", or need to add documentation comments to code.
license: MIT
metadata:
  version: "1.0.0"
---

# Code Annotation Supplementation and Standardization Skill

This skill provides systematic code annotation supplementation and standardization capabilities, automatically identifying code file types, applying corresponding annotation standards, and ensuring generated comments are accurate, complete, and meet bilingual requirements.

## Trigger Conditions

Activate this skill proactively when the following situations are detected:

- Users mention adding or supplementing comments: "add comments", "supplement comments", "increase comments"
- Users mention standardizing comments: "standardize comments", "unify comment style", "comment standards"
- Users mention code annotation needs: "add comments to code", "code lacks comments", "incomplete comments"
- Users mention specific annotation types: "function comments", "class comments", "JSDoc", "docstring"
- English trigger words: "add comments", "annotate code", "code documentation", "JSDoc"

---

## Core Principles

### Absolute Prohibitions

**Strictly forbidden to modify any code content**. This skill can only add or modify comments, and must not:
- Modify code logic
- Modify identifiers such as variable names, function names, class names
- Modify code structure (such as adding, deleting, rearranging code lines)
- Modify code formatting (such as indentation, line breaks, spaces)

The only allowed operation is adding comments to code or modifying existing comments.

### Bilingual Comment Requirements

All comments must contain both Chinese and English bilingual descriptions.

---

## Phase 1: Project and File Analysis

Before executing annotation supplementation, comprehensively analyze the project and target files.

### 1.1 Identify Programming Language

Identify the programming language based on file extension and select the corresponding comment style:

| Language | File Extensions | Multi-line Comment Style | Single-line Comment Style |
|----------|-----------------|-------------------------|--------------------------|
| JavaScript/TypeScript | `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs` | `/** ... */` | `// ...` |
| Python | `.py` | `""" ... """` or `''' ... '''` | `# ...` |
| Java | `.java` | `/** ... */` | `// ...` |
| C/C++ | `.c`, `.cpp`, `.h`, `.hpp` | `/** ... */` | `// ...` |
| Go | `.go` | `/** ... */` | `// ...` |
| Rust | `.rs` | `/// ...` (doc comments) | `// ...` |
| PHP | `.php` | `/** ... */` | `// ...` |
| Ruby | `.rb` | `=begin ... =end` | `# ...` |
| Swift | `.swift` | `/** ... */` | `// ...` |
| Kotlin | `.kt`, `.kts` | `/** ... */` | `// ...` |
| C# | `.cs` | `/** ... */` | `// ...` |
| Scala | `.scala` | `/** ... */` | `// ...` |
| Lua | `.lua` | `--[[ ... --]]` | `-- ...` |
| Shell | `.sh`, `.bash` | `: ' ... '` | `# ...` |

### 1.2 Analyze Code Structure

Parse code files to identify code elements that need comments.

**Core Principle of Comments**: Comments are meant to enhance code readability, not to comment for the sake of commenting. Excessive comments can actually reduce code readability. If the code itself is simple and clear enough to self-explain its intent, no comments are needed.

**Elements that must have multi-line comments**:
- Functions/methods
- Classes/structs/interfaces
- Public properties/fields
- Enums and their members
- Type definitions
- Modules/namespaces

**Elements that need evaluation for single-line comments**:

Only add comments when code logic is not intuitive enough or cannot self-explain:

- **Complex conditional branch logic**: When condition evaluation involves multiple variables, complex operations, or business rules
- **Complex loop structures**: When loop logic is not intuitive or has special boundary conditions
- **Complex expressions**: When expressions involve multi-step operations or special algorithms
- **Important variable declarations**: When variable purpose is not obvious or involves special business meaning

**Situations where comments are not needed**:

The following situations are clear enough in the code itself and do not need comments:

- Simple conditional checks (e.g., `if (isValid)`)
- Simple loops (e.g., `for (const item of items)`)
- Variable declarations where names clearly express purpose (e.g., `const userName = user.name`)
- Standard getter/setter methods
- Obvious assignment statements

**Judgment Criteria**:

Before adding a comment, ask yourself:
1. Without looking at the comment, can you quickly understand the intent of this code?
2. Is the code naming clear enough?
3. Does the comment provide information that the code itself cannot express?

If the answers to the above questions indicate the code is clear enough, no comment is needed.

### 1.3 Detect Existing Comments

Analyze existing comments in the code:
- Identify code elements that already have comments
- Check if existing comments meet standards
- Mark comments that need supplementation or correction

---

## Phase 2: Comment Format Standards

### 2.1 Multi-line Comment Formats

#### JavaScript/TypeScript Format

```typescript
/**
 * English description of the function.
 *
 * 中文描述函数的功能。
 *
 * @param paramName - English description / 中文描述
 * @returns English description / 中文描述
 * @throws {ErrorType} English description / 中文描述
 * @example
 * // Basic usage
 * const result = functionName('value');
 *
 * // With optional parameter
 * const result = functionName('value', { option: true });
 */
function functionName(paramName: string, options?: Options): Result {
  // implementation
}
```

#### Python Format

```python
"""
English description of the function.

中文描述函数的功能。

Args:
    param_name (str): English description / 中文描述

Returns:
    Result: English description / 中文描述

Raises:
    ErrorType: English description / 中文描述

Example:
    >>> # Basic usage
    >>> result = function_name('value')
    >>>
    >>> # With optional parameter
    >>> result = function_name('value', option=True)
"""
def function_name(param_name: str, options: Optional[Options] = None) -> Result:
    # implementation
```

#### Java Format

```java
/**
 * English description of the method.
 *
 * 中文描述方法的功能。
 *
 * @param paramName English description / 中文描述
 * @return English description / 中文描述
 * @throws ExceptionType English description / 中文描述
 * @example
 * // Basic usage
 * Result result = methodName("value");
 *
 * // With optional parameter
 * Result result = methodName("value", options);
 */
public Result methodName(String paramName, Options options) {
    // implementation
}
```

#### Go Format

```go
// FunctionName English description of the function.
//
// 中文描述函数的功能。
//
// Parameters:
//   - paramName: English description / 中文描述
//
// Returns:
//   - result: English description / 中文描述
//
// Example:
//
//	// Basic usage
//	result := FunctionName("value")
//
//	// With optional parameter
//	result := FunctionName("value", options)
func FunctionName(paramName string, options *Options) *Result {
    // implementation
}
```

#### Rust Format

```rust
/// English description of the function.
///
/// 中文描述函数的功能。
///
/// # Arguments
///
/// * `param_name` - English description / 中文描述
///
/// # Returns
///
/// English description / 中文描述
///
/// # Errors
///
/// Returns an error if...
///
/// # Examples
///
/// ```
/// // Basic usage
/// let result = function_name("value");
///
/// // With optional parameter
/// let result = function_name("value", Some(options));
/// ```
pub fn function_name(param_name: &str, options: Option<Options>) -> Result<Result, Error> {
    // implementation
}
```

### 2.2 Single-line Comment Formats

#### Short Description Format

```typescript
// english description / 中文描述
if (condition) {}

// english description / 中文描述
const variable = value;
```

#### Long Description Format

```typescript
// This is a longer english description that explains
// the purpose of the following code block.
//
// 这是较长的中文描述，解释以下代码块的用途。
if (complexCondition) {
  // english description / 中文描述
  doSomething();
}
```

#### Python Single-line Comments

```python
# english description / 中文描述
if condition:
    pass

# This is a longer english description that explains
# the purpose of the following code block.
#
# 这是较长的中文描述，解释以下代码块的用途。
for item in items:
    # english description / 中文描述
    process(item)
```

---

## Phase 3: Comment Content Standards

### 3.1 Function/Method Comment Requirements

Function/method comments must include the following:

1. **Function Description**: Clearly describe the function's purpose and usage
2. **Parameter Description**: Type and purpose of each parameter
3. **Return Description**: Type and meaning of the return value
4. **Exception Description**: Possible exceptions and their conditions (if any)
5. **Usage Examples**: At least one basic usage example

#### Handling Union Type Parameters

When parameter types are union types, use unordered lists to detail each type:

```typescript
/**
 * Processes the input data.
 *
 * 处理输入数据。
 *
 * @param input - The input data to process. Can be:
 *   - `string`: A string value to parse / 要解析的字符串值
 *   - `Buffer`: A buffer containing raw data / 包含原始数据的缓冲区
 *   - `ReadableStream`: A stream to read data from / 要读取数据的流
 * @returns The processed result / 处理后的结果
 * @example
 * // Process a string
 * const result = process('hello');
 *
 * // Process a buffer
 * const result = process(Buffer.from('hello'));
 */
function process(input: string | Buffer | ReadableStream): Result {}
```

#### Functions Supporting Multiple Parameter Passing Methods

For functions that support multiple parameter types or parameter counts, provide usage examples for different scenarios:

```typescript
/**
 * Creates a new user instance.
 *
 * 创建新的用户实例。
 *
 * @param nameOrOptions - Can be:
 *   - `string`: The user's name / 用户名称
 *   - `UserOptions`: Full user configuration object / 完整的用户配置对象
 * @param age - User's age (required when first param is string) / 用户年龄（第一个参数为字符串时必填）
 * @returns The created user instance / 创建的用户实例
 * @example
 * // Create user with name only
 * const user = createUser('John');
 *
 * // Create user with name and age
 * const user = createUser('John', 25);
 *
 * // Create user with options object
 * const user = createUser({ name: 'John', age: 25, email: 'john@example.com' });
 */
function createUser(nameOrOptions: string | UserOptions, age?: number): User {}
```

### 3.2 Class Comment Requirements

Class comments must include the following:

1. **Function Description**: Purpose and responsibilities of the class
2. **Property Description**: Description of important public properties
3. **Usage Examples**: Examples of creating and using class instances

```typescript
/**
 * Manages user authentication and session handling.
 *
 * 管理用户认证和会话处理。
 *
 * @example
 * // Create a new auth manager
 * const auth = new AuthManager({
 *   apiKey: 'your-api-key',
 *   endpoint: 'https://api.example.com'
 * });
 *
 * // Authenticate a user
 * const session = await auth.login('user@example.com', 'password');
 */
class AuthManager {
  /**
   * Current active session.
   *
   * 当前活动会话。
   */
  public session: Session | null;

  /**
   * Creates a new AuthManager instance.
   *
   * 创建新的 AuthManager 实例。
   *
   * @param config - Configuration options / 配置选项
   */
  constructor(config: AuthConfig) {}
}
```

### 3.3 Property/Field Comment Requirements

```typescript
class User {
  /**
   * User's unique identifier.
   *
   * 用户的唯一标识符。
   */
  public id: string;

  /**
   * User's display name.
   *
   * 用户的显示名称。
   */
  public name: string;

  /**
   * User's email address.
   *
   * 用户的电子邮件地址。
   */
  public email: string;
}
```

### 3.4 Enum Comment Requirements

```typescript
/**
 * Defines the status of a task.
 *
 * 定义任务的状态。
 */
enum TaskStatus {
  /**
   * Task is waiting to be processed.
   *
   * 任务等待处理。
   */
  Pending = 'pending',

  /**
   * Task is currently being processed.
   *
   * 任务正在处理中。
   */
  InProgress = 'in_progress',

  /**
   * Task has been completed successfully.
   *
   * 任务已成功完成。
   */
  Completed = 'completed',

  /**
   * Task has failed.
   *
   * 任务已失败。
   */
  Failed = 'failed',
}
```

### 3.5 Type Definition Comment Requirements

```typescript
/**
 * Configuration options for the API client.
 *
 * API 客户端的配置选项。
 */
interface ApiClientOptions {
  /**
   * API base URL.
   *
   * API 基础 URL。
   */
  baseUrl: string;

  /**
   * Request timeout in milliseconds.
   *
   * 请求超时时间（毫秒）。
   */
  timeout?: number;

  /**
   * Custom headers to include in requests.
   *
   * 请求中包含的自定义请求头。
   */
  headers?: Record<string, string>;
}
```

---

## Phase 4: Tone and Voice Standards

### 4.1 Tone Standards

Use a professional yet friendly, conversational help tone:

- **Perspective and Tense**: Address the reader as "you". Use active voice and present tense (e.g., "the function returns...").
- **Tone**: Professional, friendly, and direct.
- **Clarity**: Use simple vocabulary. Avoid jargon, slang, and marketing language.
- **Requirements**: Clearly distinguish requirements ("must") from recommendations ("we recommend"). Avoid using "should".
- **Word Choice**: Avoid using "please" and personification (e.g., "the function thinks"). Use contractions (e.g., "don't", "it's").

### 4.2 Language and Grammar Standards

- **Abbreviations**: Avoid Latin abbreviations; use "for example" (not "e.g.") and "that is" (not "i.e.").
- **Punctuation**: Use serial commas. Chinese content should use `""` instead of `""`.
- **Dates**: Use clear formats (e.g., "January 22, 2026").
- **Conciseness**: Use "lets you" instead of "allows you to". Choose precise, specific verbs.
- **Examples**: Use meaningful names in examples; avoid meaningless placeholders like "foo" or "bar".

---

## Phase 5: Comment Text Format Standards

### 5.1 Line Break Rules

Comment text should break at approximately 100 characters (except for special content like long links or tables):

```typescript
/**
 * This is a very long description that needs to be wrapped at approximately
 * 100 characters to maintain readability and consistency across the codebase.
 *
 * 这是一个很长的描述，需要在约100个字符处换行，以保持代码库的可读性和一致性。
 */
```

### 5.2 Chinese-English Separation

In bilingual comments, English description comes first, Chinese description follows, separated by a blank line:

```typescript
/**
 * English description comes first.
 *
 * 中文描述紧随其后。
 */
```

### 5.3 Parameter Description Format

Parameter descriptions use slashes to separate Chinese and English:

```typescript
@param paramName - English description / 中文描述
```

---

## Phase 6: Execution Process

### 6.1 File Scanning Process

1. Receive user-specified files or directories
2. Recursively scan all code files
3. Group by language type for processing
4. Generate processing plan

### 6.2 Single File Processing Process

1. Read file content
2. Parse code structure (AST or regex matching)
3. Identify code elements that need comments
4. Check completeness of existing comments
5. Generate comments that meet standards
6. Insert comments at correct positions
7. Write updated file

### 6.3 Comment Insertion Rules

- **Function/Method Comments**: Immediately above the function declaration, no blank lines
- **Class Comments**: Immediately above the class declaration, no blank lines
- **Property Comments**: Immediately above the property declaration, no blank lines
- **Single-line Comments**: Above the code line, with the same indentation as the code

### 6.4 Progress Reporting

Report progress in real-time during processing:

```markdown
## Comment Processing Progress

### Completed (3/10)
- ✅ src/utils/helper.ts (added 5 function comments)
- ✅ src/models/user.ts (added 2 class comments, 8 property comments)
- ✅ src/api/client.ts (added 3 function comments)

### In Progress
- 🔄 src/services/auth.ts

### Pending (6/10)
- ⏳ src/config/index.ts
- ...
```

---

## Phase 7: Quality Verification

### 7.1 Comment Completeness Check

- [ ] All public functions have comments
- [ ] All public classes have comments
- [ ] All public properties have comments
- [ ] All enums and their members have comments
- [ ] All type definitions have comments

### 7.2 Comment Content Check

- [ ] Function description is clear and accurate
- [ ] Parameter descriptions are complete
- [ ] Return value descriptions are accurate
- [ ] Usage examples are runnable
- [ ] Union type parameters have detailed explanations

### 7.3 Comment Format Check

- [ ] Follows language-specific comment style
- [ ] Bilingual format is correct
- [ ] Line break positions are reasonable
- [ ] Punctuation is used correctly

### 7.4 Code Integrity Check

- [ ] No code logic modified
- [ ] No identifiers modified
- [ ] No code structure modified
- [ ] No code formatting modified

---

## Workflow Examples

### Example 1: Adding Comments to a Single File

```
User: Add comments to src/utils/helper.ts

Agent:
1. Read file content
2. Parse code structure, identify 5 functions
3. Check existing comments (found 2 functions missing comments)
4. Generate bilingual comments for functions missing comments
5. Insert comments at correct positions
6. Write updated file
7. Report: added 3 function comments, modified 2 existing comments
```

### Example 2: Batch Adding Comments to a Directory

```
User: Add comments to all TypeScript files under src/ directory

Agent:
1. Scan src/ directory, find 15 .ts files
2. Sort by file size, generate processing plan
3. Process files one by one:
   - Parse code structure
   - Identify elements needing comments
   - Generate and insert comments
4. Report progress in real-time
5. Generate summary report after completion
```

### Example 3: Standardizing Existing Comments

```
User: Standardize comment style for files under src/api/ directory

Agent:
1. Scan directory, find 8 code files
2. Analyze existing comment styles
3. Identify comments that don't meet standards
4. Correct comment formats according to standards
5. Ensure all comments are in bilingual format
6. Report modifications
```

---

## Notes

1. **Only Add Comments**: Strictly forbidden to modify any code content, including logic, structure, formatting
2. **Maintain Consistency**: Comment style must be consistent within the same file
3. **Accuracy First**: Comment content must accurately reflect code functionality
4. **Avoid Over-commenting**: Comments are to enhance readability, not to comment for the sake of commenting. If the code itself is clear enough, no comment is needed
5. **Concise and Clear**: Avoid redundant comments; comments should have practical value and provide information that the code itself cannot express
6. **Runnable Examples**: All usage examples must be code that can actually run
