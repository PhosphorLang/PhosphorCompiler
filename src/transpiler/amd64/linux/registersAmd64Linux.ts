import Register64 from "../../common/register64";
import RegistersAmd64 from "../registersAmd64";

export default abstract class RegistersAmd64Linux
{
    public static readonly integerArguments: Register64[] = [
        RegistersAmd64.di,
        RegistersAmd64.si,
        RegistersAmd64.d,
        RegistersAmd64.c, // For kernel/syscalls this is r10! c is not preserved.
        RegistersAmd64.r8,
        RegistersAmd64.r9,
    ];

    public static readonly callerSaved: Register64[] = [
        RegistersAmd64.r10,
        RegistersAmd64.r11,
    ];

    public static readonly calleeSaved: Register64[] = [
        RegistersAmd64.b,
        RegistersAmd64.r12,
        RegistersAmd64.r13,
        RegistersAmd64.r14,
        RegistersAmd64.r15,
    ];

    public static readonly syscallArguments: Register64[] = [
        RegistersAmd64.a,
        RegistersAmd64.di,
        RegistersAmd64.si,
        RegistersAmd64.d,
        RegistersAmd64.r10,
        RegistersAmd64.r8,
        RegistersAmd64.r9,
    ];

    public static readonly syscallCallerSaved: Register64[] = [
        RegistersAmd64.c,
        RegistersAmd64.r11,
    ];

    public static readonly syscallCalleeSaved: Register64[] = [
        RegistersAmd64.b,
        RegistersAmd64.r12,
        RegistersAmd64.r13,
        RegistersAmd64.r14,
        RegistersAmd64.r15,
    ];

    public static readonly integerReturn: Register64 = RegistersAmd64.a;

    public static readonly stackPointer: Register64 = RegistersAmd64.sp;

    public static readonly stackBasePointer: Register64 = RegistersAmd64.bp;
}
