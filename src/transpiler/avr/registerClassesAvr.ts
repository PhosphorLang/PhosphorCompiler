import Register16 from "../common/registers/register16";
import Register8 from "../common/registers/register8";
import RegistersAvr from "./registersAvr";

export default abstract class RegisterClassesAvr
{
    public static readonly scratch: Register8[] = [
        RegistersAvr.r0,
        RegistersAvr.r1,
    ];

    public static readonly callerSaved: Register8[] = [
        RegistersAvr.r18,
        RegistersAvr.r19,
        RegistersAvr.r20,
        RegistersAvr.r21,
        RegistersAvr.r22,
        RegistersAvr.r23,
        RegistersAvr.r24,
        RegistersAvr.r25,

        RegistersAvr.r26,
        RegistersAvr.r27,

        RegistersAvr.r30,
        RegistersAvr.r31,
    ];

    public static readonly calleeSaved: Register8[] = [
        RegistersAvr.r2,
        RegistersAvr.r3,
        RegistersAvr.r4,
        RegistersAvr.r5,
        RegistersAvr.r6,
        RegistersAvr.r7,
        RegistersAvr.r8,
        RegistersAvr.r9,
        RegistersAvr.r10,
        RegistersAvr.r11,
        RegistersAvr.r12,
        RegistersAvr.r13,
        RegistersAvr.r14,
        RegistersAvr.r15,
        RegistersAvr.r16,
        RegistersAvr.r17,

        RegistersAvr.r28,
        RegistersAvr.r29,
    ];

    public static readonly argumentValues: Register8[] = [
        RegistersAvr.r25,
        RegistersAvr.r24,
        RegistersAvr.r23,
        RegistersAvr.r22,
        RegistersAvr.r21,
        RegistersAvr.r20,
        RegistersAvr.r19,
        RegistersAvr.r18,
        RegistersAvr.r17,
        RegistersAvr.r16,
        RegistersAvr.r15,
        RegistersAvr.r14,
        RegistersAvr.r13,
        RegistersAvr.r12,
        RegistersAvr.r11,
        RegistersAvr.r10,
        RegistersAvr.r9,
        RegistersAvr.r8,
    ];

    public static readonly returnValue: Register8[] = [
        RegistersAvr.r25,
        RegistersAvr.r24,
        RegistersAvr.r23,
        RegistersAvr.r22,
        RegistersAvr.r21,
        RegistersAvr.r20,
        RegistersAvr.r19,
        RegistersAvr.r18,
    ];

    public static readonly pointers: Register16[] = [
        RegistersAvr.x,
        RegistersAvr.y,
        RegistersAvr.z,
    ];

    public static readonly zero: Register8 = RegistersAvr.r2;

    public static readonly stackPointer: Register16 = RegistersAvr.sp;

    public static readonly sreg: Register8 = RegistersAvr.sreg;
}
