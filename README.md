![Tests](https://github.com/PhosphorLang/Compiler/workflows/Tests/badge.svg)
[![Coverage](https://coveralls.io/repos/github/PhosphorLang/Compiler/badge.svg?branch=master)](https://coveralls.io/github/PhosphorLang/Compiler?branch=master)

# **The Phosphor Compiler**

A compiler for the Phosphor programming language.

<hr>

## **Table of contents**

- [**The Phosphor Compiler**](#the-phosphor-compiler)
  - [**Table of contents**](#table-of-contents)
  - [**Usage**](#usage)
    - [**External Dependencies**](#external-dependencies)
    - [**Compile the compiler**](#compile-the-compiler)
    - [**Get the standard library**](#get-the-standard-library)
    - [**Compile your code**](#compile-your-code)
  - [**Description**](#description)
    - [**Components**](#components)
    - [**The working features**](#the-working-features)
    - [**Examples**](#examples)

<hr>

## **Usage**

### **External Dependencies**

You need the following present on your system:

- [Node.js](https://nodejs.org/) >= 12.0.0
- [NASM](https://nasm.us/) >= 2.13
- [GNU ld](https://www.gnu.org/software/binutils/) >= 2.30

### **Compile the compiler**

```bash
npm install
npm run compile
```

### **Get the standard library**

You will need the standard library for compiling Phosphor code. You can find it here:
<https://github.com/PhosphorLang/StandardLibrary>. \
Follow the instructions there to compile the standard library.

### **Compile your code**

Important: Note that the only currently supported platform by now is Linux on x86_64.

For compiling the hello world example, execute the following command: \
(You have to replace `<path to standard library>` with the actual path, possibly `../StandardLibrary` if you have cloned
the git repository of the standard library next to the repository of the compiler.)

```bash
node bin/main.js -f examples/helloWorld.ph -o helloWorld -s <path to standard library>/bin/standardLibrary.a
```

<hr>

## **Description**

### **Components**

1. Lexer (Frontend)
    - Converts a file string into a token list by lexical analysis.
2. Parser (Frontend)
    - Converts a token list into a syntax tree by syntactical analysis.
3. Connector (Frontend)
    - Converts a syntax tree into an semantic tree by semantic analysis.
4. Transpiler (Backend)
    - Transpiles the semantic tree into platform specific Assembly.
5. Assembler (Backend)
    - Creates an object file from the Assembly.
6. Linker
    - Links the object files into an executable.

### **The working features**

1. Types
    - Int
    - String
1. Variables
    - Definition
    - Type inference
    - Assignment
1. Constants
    - Inline integer
    - Inline string
1. Function definitions
    - With up to six integer/pointer arguments
    - Argument types
    - Return type
    - Return statement
1. Main function
    - As entry point
1. Build in functions
    - print (a string)
1. Function calls
    - As a statement
    - As an expression (with return value)

### **Examples**

You can find a full example of all features [here](/examples/everything.ph).

More example are in the [examples directory](/examples/);
