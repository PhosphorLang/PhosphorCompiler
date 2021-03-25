import Register16 from "../common/registers/register16";
import Register8 from "../common/registers/register8";

export default abstract class RegistersAvr
{
    // General purpose registers:
    public static readonly r0: Register8 = new Register8('r0');
    public static readonly r1: Register8 = new Register8('r1');
    public static readonly r2: Register8 = new Register8('r2');
    public static readonly r3: Register8 = new Register8('r3');
    public static readonly r4: Register8 = new Register8('r4');
    public static readonly r5: Register8 = new Register8('r5');
    public static readonly r6: Register8 = new Register8('r6');
    public static readonly r7: Register8 = new Register8('r7');
    public static readonly r8: Register8 = new Register8('r8');
    public static readonly r9: Register8 = new Register8('r9');
    public static readonly r10: Register8 = new Register8('r10');
    public static readonly r11: Register8 = new Register8('r11');
    public static readonly r12: Register8 = new Register8('r12');
    public static readonly r13: Register8 = new Register8('r13');
    public static readonly r14: Register8 = new Register8('r14');
    public static readonly r15: Register8 = new Register8('r15');
    public static readonly r16: Register8 = new Register8('r16');
    public static readonly r17: Register8 = new Register8('r17');
    public static readonly r18: Register8 = new Register8('r18');
    public static readonly r19: Register8 = new Register8('r19');
    public static readonly r20: Register8 = new Register8('r20');
    public static readonly r21: Register8 = new Register8('r21');
    public static readonly r22: Register8 = new Register8('r22');
    public static readonly r23: Register8 = new Register8('r23');
    public static readonly r24: Register8 = new Register8('r24');
    public static readonly r25: Register8 = new Register8('r25');
    public static readonly r26: Register8 = new Register8('r26');
    public static readonly r27: Register8 = new Register8('r27');
    public static readonly r28: Register8 = new Register8('r28');
    public static readonly r29: Register8 = new Register8('r29');
    public static readonly r30: Register8 = new Register8('r30');
    public static readonly r31: Register8 = new Register8('r31');

    // Pointer registers:
    public static readonly x: Register16 = new Register16('r27:r26', 'r26');
    public static readonly y: Register16 = new Register16('r29:r28', 'r28');
    public static readonly z: Register16 = new Register16('r31:r30', 'r30');

    // Special registers:
    public static readonly sreg: Register8 = new Register8('sreg');
    public static readonly sp: Register16 = new Register16('sph:spl', 'spl');

    // Register classes

    public static readonly freeUse: Register8[] = [
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
        RegistersAvr.r18,
        RegistersAvr.r19,
        RegistersAvr.r20,
        RegistersAvr.r21,
        RegistersAvr.r22,
        RegistersAvr.r23,
        RegistersAvr.r24,
        RegistersAvr.r25,
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

    public static readonly flashAccessPointers: Register16[] = [
        RegistersAvr.z,
    ];

    public static readonly ramDisplacedAccessPointers: Register16[] = [
        RegistersAvr.y,
        RegistersAvr.z,
    ];

    public static readonly multiplication: Register16 = new Register16(
        RegistersAvr.r1.bit8,
        RegistersAvr.r0.bit8,
    );

    public static readonly zero: Register8 = RegistersAvr.r2;

    public static readonly stackPointer: Register16 = RegistersAvr.sp;
}
