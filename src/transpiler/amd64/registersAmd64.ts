import Register64 from "../common/registers/register64";

export default abstract class RegistersAmd64
{
    public static readonly a: Register64 = new Register64('rax', 'eax', 'ax', 'al');
    public static readonly b: Register64 = new Register64('rbx', 'ebx', 'bx', 'bl');
    public static readonly c: Register64 = new Register64('rcx', 'ecx', 'cx', 'cl');
    public static readonly d: Register64 = new Register64('rdx', 'edx', 'dx', 'dl');
    public static readonly si: Register64 = new Register64('rsi', 'esi', 'si', 'sil');
    public static readonly di: Register64 = new Register64('rdi', 'edi', 'di', 'dil');
    public static readonly bp: Register64 = new Register64('rbp', 'ebp', 'bp', 'bpl');
    public static readonly sp: Register64 = new Register64('rsp', 'esp', 'sp', 'spl');
    public static readonly r8: Register64 = new Register64('r8', 'r8d', 'r8w', 'r8b');
    public static readonly r9: Register64 = new Register64('r9', 'r9d', 'r9w', 'r9b');
    public static readonly r10: Register64 = new Register64('r10', 'r10d', 'r10w', 'r10b');
    public static readonly r11: Register64 = new Register64('r11', 'r11d', 'r11w', 'r11b');
    public static readonly r12: Register64 = new Register64('r12', 'r12d', 'r12w', 'r12b');
    public static readonly r13: Register64 = new Register64('r13', 'r13d', 'r13w', 'r13b');
    public static readonly r14: Register64 = new Register64('r14', 'r14d', 'r14w', 'r14b');
    public static readonly r15: Register64 = new Register64('r15', 'r15d', 'r15w', 'r15b');
}
