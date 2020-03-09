; Standard library

[section .text]
    [global print]

    print: ; Parameters: address to char, length in bytes
        mov rdx, rsi ; Move length of char to parameter.
        mov rsi, rdi ; Move address of char to parameter.
        mov rdi, 1 ; Parameter for writing to stdout
        mov rax, 1 ; Syscall ID for writing
        syscall
        ret
