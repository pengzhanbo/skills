---
name: code-commentator
description: 代码注释补充与规范化专家，自动识别代码文件类型，为函数、类、方法、属性等代码元素添加专业双语注释。当用户提及"添加注释"、"补充注释"、"规范化注释"、"代码注释"、"annotate code"、"add comments"或需要为代码添加文档注释时使用本技能。
license: MIT
metadata:
  version: "1.0.0"
---

# 代码注释补充与规范化技能

本技能提供代码注释的系统性补充与规范化处理能力，自动识别代码文件类型，应用相应的注释规范，确保生成的注释准确、完整且符合双语要求。

## 触发条件

当检测到以下情况时，主动激活此技能：

- 用户提及添加或补充注释："添加注释"、"补充注释"、"增加注释"
- 用户提及规范化注释："规范化注释"、"统一注释风格"、"注释规范"
- 用户提及代码注释需求："给代码加注释"、"代码缺少注释"、"注释不完整"
- 用户提及特定注释类型："函数注释"、"类注释"、"JSDoc"、"docstring"
- 英文触发词："add comments"、"annotate code"、"code documentation"、"JSDoc"

---

## 核心原则

### 绝对禁止事项

**严禁修改任何代码内容**。本技能只能添加或修改注释，不得：
- 修改代码逻辑
- 修改变量名、函数名、类名等标识符
- 修改代码结构（如添加、删除、重排代码行）
- 修改代码格式（如缩进、换行、空格）

唯一允许的操作是为代码添加注释或修改现有注释。

### 双语注释要求

所有注释必须同时包含中英文双语说明。

---

## 第一阶段：项目与文件分析

在执行注释补充前，需全面分析项目和目标文件。

### 1.1 识别编程语言

根据文件扩展名识别编程语言，选择对应的注释风格：

| 语言 | 文件扩展名 | 多行注释风格 | 单行注释风格 |
|------|-----------|-------------|-------------|
| JavaScript/TypeScript | `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs` | `/** ... */` | `// ...` |
| Python | `.py` | `""" ... """` 或 `''' ... '''` | `# ...` |
| Java | `.java` | `/** ... */` | `// ...` |
| C/C++ | `.c`, `.cpp`, `.h`, `.hpp` | `/** ... */` | `// ...` |
| Go | `.go` | `/** ... */` | `// ...` |
| Rust | `.rs` | `/// ...` (文档注释) | `// ...` |
| PHP | `.php` | `/** ... */` | `// ...` |
| Ruby | `.rb` | `=begin ... =end` | `# ...` |
| Swift | `.swift` | `/** ... */` | `// ...` |
| Kotlin | `.kt`, `.kts` | `/** ... */` | `// ...` |
| C# | `.cs` | `/** ... */` | `// ...` |
| Scala | `.scala` | `/** ... */` | `// ...` |
| Lua | `.lua` | `--[[ ... --]]` | `-- ...` |
| Shell | `.sh`, `.bash` | `: ' ... '` | `# ...` |

### 1.2 分析代码结构

解析代码文件，识别需要注释的代码元素。

**注释的核心原则**：注释是为了增强代码可读性，而非为注释而注释。过多的注释反而会影响代码的可读性。如果代码本身足够简单清晰，能够自解释其意图，则不需要添加注释。

**必须添加多行注释的元素**：
- 函数/方法
- 类/结构体/接口
- 公共属性/字段
- 枚举及其成员
- 类型定义
- 模块/命名空间

**需要评估是否添加单行注释的元素**：

仅在代码逻辑不够直观、无法自解释时才需要添加注释：

- **复杂的条件分支逻辑**：当条件判断涉及多个变量、复杂运算或业务规则时
- **复杂的循环结构**：当循环逻辑不直观或有特殊边界条件时
- **复杂的表达式**：当表达式涉及多步运算或特殊算法时
- **重要的变量声明**：当变量用途不明显或涉及特殊业务含义时

**不需要添加注释的情况**：

以下情况代码本身已足够清晰，无需添加注释：

- 简单的条件判断（如 `if (isvalid)`）
- 简单的循环（如 `for (const item of items)`）
- 变量名已清晰表达用途的声明（如 `const userName = user.name`）
- 标准的 getter/setter 方法
- 一目了然的赋值语句

**判断标准**：

添加注释前，先问自己：
1. 不看注释，能否快速理解这段代码的意图？
2. 代码命名是否足够清晰？
3. 注释是否提供了代码本身无法表达的信息？

如果以上问题的答案表明代码已足够清晰，则不需要添加注释。

### 1.3 检测现有注释

分析代码中已有的注释：
- 识别已有注释的代码元素
- 检查现有注释是否符合规范
- 标记需要补充或修正的注释

---

## 第二阶段：注释格式规范

### 2.1 多行注释格式

#### JavaScript/TypeScript 格式

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

#### Python 格式

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

#### Java 格式

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

#### Go 格式

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

#### Rust 格式

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

### 2.2 单行注释格式

#### 短描述格式

```typescript
// english description / 中文描述
if (condition) {}

// english description / 中文描述
const variable = value;
```

#### 长描述格式

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

#### Python 单行注释

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

## 第三阶段：注释内容规范

### 3.1 函数/方法注释要求

函数/方法注释必须包含以下内容：

1. **功能描述**：清晰描述函数的功能和用途
2. **入参说明**：每个参数的类型和用途
3. **出参说明**：返回值的类型和含义
4. **异常说明**：可能抛出的异常及其条件（如有）
5. **使用示例**：至少一个基本使用示例

#### 参数类型为联合类型时的处理

当参数类型为联合类型时，使用无序列表详细说明每个类型：

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

#### 支持多种传参方式的函数

对于支持多种传参类型或传参个数的函数，需提供不同场景的使用示例：

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

### 3.2 类注释要求

类注释必须包含以下内容：

1. **功能描述**：类的用途和职责
2. **属性说明**：重要公共属性的说明
3. **使用示例**：创建和使用类实例的示例

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

### 3.3 属性/字段注释要求

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

### 3.4 枚举注释要求

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

### 3.5 类型定义注释要求

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

## 第四阶段：语气与口吻规范

### 4.1 语气标准

采用专业且友好的对话式帮助语气：

- **视角与时态**：以"您"称呼读者。使用主动语态和现在时（例如"函数返回..."）。
- **语气**：专业、友好且直接。
- **清晰度**：使用简单词汇。避免术语、俚语和营销宣传用语。
- **要求**：明确区分要求（"必须"）与建议（"我们推荐"）。避免使用"应当"。
- **措辞选择**：避免使用"请"及拟人化表达（例如"函数认为"）。使用缩写形式（如"不要"、"它是"）。

### 4.2 语言与语法规范

- **缩写**：避免拉丁语缩写；使用"例如"（而非"e.g."）和"即"（而非"i.e."）。
- **标点符号**：使用序列逗号。中文内容应使用 `“”` 而非 `""`。
- **日期**：使用明确格式（例如"2026年1月22日"）。
- **简洁性**：使用"让你"而非"允许你"。选用精确、具体的动词。
- **示例**：示例中使用有意义的名称；避免使用"foo"或"bar"等无意义占位符。

---

## 第五阶段：注释文本格式规范

### 5.1 换行规则

注释文本应在100个字符左右处换行（长链接或表格等特殊内容除外）：

```typescript
/**
 * This is a very long description that needs to be wrapped at approximately
 * 100 characters to maintain readability and consistency across the codebase.
 *
 * 这是一个很长的描述，需要在约100个字符处换行，以保持代码库的可读性和一致性。
 */
```

### 5.2 中英文分隔

双语注释中，英文描述在前，中文描述在后，中间用空行分隔：

```typescript
/**
 * English description comes first.
 *
 * 中文描述紧随其后。
 */
```

### 5.3 参数描述格式

参数描述使用斜杠分隔中英文：

```typescript
@param paramName - English description / 中文描述
```

---

## 第六阶段：执行流程

### 6.1 文件扫描流程

1. 接收用户指定的文件或目录
2. 递归扫描所有代码文件
3. 按语言类型分组处理
4. 生成处理计划

### 6.2 单文件处理流程

1. 读取文件内容
2. 解析代码结构（AST 或正则匹配）
3. 识别需要注释的代码元素
4. 检查现有注释的完整性
5. 生成符合规范的注释
6. 将注释插入到正确位置
7. 写入更新后的文件

### 6.3 注释插入规则

- **函数/方法注释**：紧贴在函数声明上方，不留空行
- **类注释**：紧贴在类声明上方，不留空行
- **属性注释**：紧贴在属性声明上方，不留空行
- **单行注释**：放在代码行上方，与代码保持相同缩进

### 6.4 进度报告

处理过程中实时报告进度：

```markdown
## 注释处理进度

### 已完成 (3/10)
- ✅ src/utils/helper.ts (添加了 5 个函数注释)
- ✅ src/models/user.ts (添加了 2 个类注释, 8 个属性注释)
- ✅ src/api/client.ts (添加了 3 个函数注释)

### 处理中
- 🔄 src/services/auth.ts

### 待处理 (6/10)
- ⏳ src/config/index.ts
- ...
```

---

## 第七阶段：质量验证

### 7.1 注释完整性检查

- [ ] 所有公共函数都有注释
- [ ] 所有公共类都有注释
- [ ] 所有公共属性都有注释
- [ ] 所有枚举及其成员都有注释
- [ ] 所有类型定义都有注释

### 7.2 注释内容检查

- [ ] 功能描述清晰准确
- [ ] 参数说明完整
- [ ] 返回值说明准确
- [ ] 使用示例可运行
- [ ] 联合类型参数有详细说明

### 7.3 注释格式检查

- [ ] 符合语言特定的注释风格
- [ ] 双语格式正确
- [ ] 换行位置合理
- [ ] 标点符号使用正确

### 7.4 代码完整性检查

- [ ] 未修改任何代码逻辑
- [ ] 未修改任何标识符
- [ ] 未修改代码结构
- [ ] 未修改代码格式

---

## 工作流程示例

### 示例1：为单个文件添加注释

```
用户：为 src/utils/helper.ts 添加注释

Agent：
1. 读取文件内容
2. 解析代码结构，识别 5 个函数
3. 检查现有注释（发现 2 个函数缺少注释）
4. 为缺少注释的函数生成双语注释
5. 插入注释到正确位置
6. 写入更新后的文件
7. 报告：添加了 3 个函数注释，修改了 2 个现有注释
```

### 示例2：为目录批量添加注释

```
用户：为 src/ 目录下的所有 TypeScript 文件添加注释

Agent：
1. 扫描 src/ 目录，找到 15 个 .ts 文件
2. 按文件大小排序，生成处理计划
3. 逐个处理文件：
   - 解析代码结构
   - 识别需要注释的元素
   - 生成并插入注释
4. 实时报告进度
5. 完成后生成总结报告
```

### 示例3：规范化现有注释

```
用户：规范化 src/api/ 目录下文件的注释风格

Agent：
1. 扫描目录，找到 8 个代码文件
2. 分析现有注释风格
3. 识别不符合规范的注释
4. 按规范修正注释格式
5. 确保所有注释为双语格式
6. 报告修改内容
```

---

## 注意事项

1. **只添加注释**：严禁修改任何代码内容，包括逻辑、结构、格式
2. **保持一致性**：同一文件内注释风格必须一致
3. **准确性优先**：注释内容必须准确反映代码功能
4. **避免过度注释**：注释是为了增强可读性，而非为注释而注释。如果代码本身足够清晰，则不需要添加注释
5. **简洁明了**：避免冗余注释，注释应有实际价值，提供代码本身无法表达的信息
6. **示例可运行**：所有使用示例必须是可以实际运行的代码
