[![Build](https://github.com/PhosphorLang/Compiler/workflows/Build/badge.svg)](https://github.com/PhosphorLang/Compiler/actions)
[![Test](https://github.com/PhosphorLang/Compiler/workflows/Test/badge.svg)](https://github.com/PhosphorLang/Compiler/actions)
[![Coverage](https://coveralls.io/repos/github/PhosphorLang/PhosphorCompiler/badge.svg?branch=master)](https://coveralls.io/github/PhosphorLang/PhosphorCompiler?branch=master)

# **The Phosphor Compiler**

A compiler for the Phosphor programming language.

```phosphor
function main ()
{
    writeLine('Hello world!');
}
```

<hr>

## **Table of contents**

- [**The Phosphor Compiler**](#the-phosphor-compiler)
    - [**Table of contents**](#table-of-contents)
    - [**Usage**](#usage)
        - [**External Dependencies**](#external-dependencies)
        - [**Compile the compiler**](#compile-the-compiler)
        - [**Get the standard library**](#get-the-standard-library)
        - [**Compile your code**](#compile-your-code)
        - [**Compilation targets**](#compilation-targets)
    - [**Description**](#description)
        - [**Components**](#components)
        - [**Examples**](#examples)

<hr>

## **Usage**

### **External Dependencies**

You need the following present on your system:

- For all target platforms:
    - [Node.js](https://nodejs.org/) >= 16.3.0
- Linux Amd64:
    - [NASM](https://nasm.us/) >= 2.13
    - [GNU ld](https://www.gnu.org/software/binutils/) >= 2.30
- AVR:
    - [GNU avr-as](https://www.gnu.org/software/binutils/) >= 2.26
    - [GNU avr-ld](https://www.gnu.org/software/binutils/) >= 2.26

### **Compile the compiler**

```bash
npm install
npm run build
```

### **Get the standard library**

You will need the standard library for compiling Phosphor code. You can find it here:
<https://github.com/PhosphorLang/StandardLibrary>. \
Follow the instructions there to compile the standard library.

### **Compile your code**

Important: Note that the only currently supported platform by now is Linux on x86_64.

For compiling the hello world example, execute the following command: \
(You have to replace `<path to standard library>` with the actual path, possibly `../StandardLibrary/bin` if you have cloned
the git repository of the standard library next to the repository of the compiler; and `<platform>` with the target platform,
e.g. `linuxAmd64`.)

```bash
node bin/main.js -t <platform> -s <path to standard library> examples/helloWorld.ph helloWorld
```

### **Compilation targets**

You can compile to any target platform from any supported platform.

Target platforms:
- Linux on x86_64: linuxAmd64
- AVR (not working yet): avr

Supported platforms:
- Linux on x86_64

<hr>

## **Description**

### **Components**

1. Lexer (Frontend)
    - Converts a file string into a token list by lexical analysis.
2. Parser (Frontend)
    - Converts a token list into a syntax tree by syntactical analysis.
3. Connector (Frontend)
    - Converts a syntax tree into a semantic tree by semantic analysis.
4. Lowerer (Middleend)
    - Lowers a complex semantic tree into intermediate code which consists of much simpler instructions.
5. Transpiler (Backend)
    - Transpiles the intermediate code into platform specific Assembly.
6. Assembler (Backend)
    - Creates an object file from the Assembly.
7. Linker (Backend)
    - Links the object files into an executable.

### **Examples**

You can find a full example of all features [here](/examples/everything.ph).

More example are in the [examples directory](/examples/);
