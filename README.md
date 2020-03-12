# Compiler

A compiler for my custom language.

## External Dependencies

- NASM >= 2.13
- GNU ld >= 2.30

## Formats

1. File string
    - A complete source file as string.
2. Token list
    - Tokens are the smallest parts of a source file, describing the barest types (like identifiers, literals, operators etc). Tokens are contextless.
3. Syntax tree
    - The token list is organised into a syntax tree by looking at the token's neighbours in the hierarchy. Parameters become children of functions, statements the ones of their scope. \
    A syntax tree is still contextless but neighbouring relationships are represented.
4. Action tree
    - By adding context to a syntax tree we get an action tree, containing all information that would be necessary to interpret the language. The action tree fully describes types, what a node does and which symbols are the same (like the same variable in the context, not just the same name).
5. Platform specific Assembly
    - The Action tree is transpiled into Assembly for a specific platform and needed parts (like read/write of stdin and stdout) are added. The output is an Assembly file containing everything needed for the final binary.
6. Object file
    - This is the result of the Assembler, a binary file ready to be linked.
7. Executable
    - The executable is the linked object file, a binary file ready to be executed on the target platform.

## Components

1. Lexer (Frontend)
    - Converts a file string into a token list by lexical analysis.
2. Parser (Frontend)
    - Converts a token list into a syntax tree by syntactical analysis.
3. Constructor (Frontend)
    - Converts a syntax tree into an action tree by semantic analysis.
4. Transpiler (Backend)
    - Transpiles the action tree into platform specific Assembly.
5. Assembler (Backend)
    - Creates an object file from the Assembly.
6. Linker
    - Links the object files into an executable.

## Code parts

1. Standard library
    - Written in Assembly, provides basic platform specific code like reading from stdin or writing to stdout.
2. Runtime library
    - Written in the programming language, provides generic functionality from type conversions to thread pools.

## The working features

1. Function calls
   - With no parameter
   - With a single parameter
2. The print function
   - For a char constant (ASCII encoded)
   - For a string constant (UTF-8 encoded)

## Full example of all features

```
print()
print(65)
print('Works ✓')
```
