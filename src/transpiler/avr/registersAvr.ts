import AddressRegisterAvr from "./registers/addressRegisterAvr";
import RegisterAvr from "./registers/registerAvr";
import RegisterPairAvr from "./registers/registerPairAvr";

export default abstract class RegistersAvr
{
    // General purpose registers:
    public static readonly r0: RegisterAvr = new RegisterAvr('r0');
    public static readonly r1: RegisterAvr = new RegisterAvr('r1');
    public static readonly r2: RegisterAvr = new RegisterAvr('r2');
    public static readonly r3: RegisterAvr = new RegisterAvr('r3');
    public static readonly r4: RegisterAvr = new RegisterAvr('r4');
    public static readonly r5: RegisterAvr = new RegisterAvr('r5');
    public static readonly r6: RegisterAvr = new RegisterAvr('r6');
    public static readonly r7: RegisterAvr = new RegisterAvr('r7');
    public static readonly r8: RegisterAvr = new RegisterAvr('r8');
    public static readonly r9: RegisterAvr = new RegisterAvr('r9');
    public static readonly r10: RegisterAvr = new RegisterAvr('r10');
    public static readonly r11: RegisterAvr = new RegisterAvr('r11');
    public static readonly r12: RegisterAvr = new RegisterAvr('r12');
    public static readonly r13: RegisterAvr = new RegisterAvr('r13');
    public static readonly r14: RegisterAvr = new RegisterAvr('r14');
    public static readonly r15: RegisterAvr = new RegisterAvr('r15');
    public static readonly r16: RegisterAvr = new RegisterAvr('r16');
    public static readonly r17: RegisterAvr = new RegisterAvr('r17');
    public static readonly r18: RegisterAvr = new RegisterAvr('r18');
    public static readonly r19: RegisterAvr = new RegisterAvr('r19');
    public static readonly r20: RegisterAvr = new RegisterAvr('r20');
    public static readonly r21: RegisterAvr = new RegisterAvr('r21');
    public static readonly r22: RegisterAvr = new RegisterAvr('r22');
    public static readonly r23: RegisterAvr = new RegisterAvr('r23');
    public static readonly r24: RegisterAvr = new RegisterAvr('r24');
    public static readonly r25: RegisterAvr = new RegisterAvr('r25');
    public static readonly r26: RegisterAvr = new RegisterAvr('r26');
    public static readonly r27: RegisterAvr = new RegisterAvr('r27');
    public static readonly r28: RegisterAvr = new RegisterAvr('r28');
    public static readonly r29: RegisterAvr = new RegisterAvr('r29');
    public static readonly r30: RegisterAvr = new RegisterAvr('r30');
    public static readonly r31: RegisterAvr = new RegisterAvr('r31');

    // Pointer registers:
    public static readonly x: AddressRegisterAvr = new AddressRegisterAvr('r26', 'r27', 'X');
    public static readonly y: AddressRegisterAvr = new AddressRegisterAvr('r28', 'r29', 'Y');
    public static readonly z: AddressRegisterAvr = new AddressRegisterAvr('r30', 'r31', 'Z');

    // Special registers:
    public static readonly sreg: RegisterAvr = new RegisterAvr('sreg');
    public static readonly sp: RegisterPairAvr = new RegisterPairAvr('spl', 'sph');

    // Register classes

    public static readonly freeUse: RegisterAvr[] = [
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

    public static readonly argumentValues: RegisterAvr[] = [
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

    public static readonly returnValue: RegisterAvr[] = [
        RegistersAvr.r25,
        RegistersAvr.r24,
        RegistersAvr.r23,
        RegistersAvr.r22,
        RegistersAvr.r21,
        RegistersAvr.r20,
        RegistersAvr.r19,
        RegistersAvr.r18,
    ];

    /**
     * Registers into which constants can be loaded.
     * Only includes the free use registers.
     */
    public static readonly constantLoadable: RegisterAvr[] = [
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
    ];

    public static readonly pointers: AddressRegisterAvr[] = [
        RegistersAvr.x,
        RegistersAvr.y,
        RegistersAvr.z,
    ];

    public static readonly flashAccessPointers: AddressRegisterAvr[] = [
        RegistersAvr.z,
    ];

    public static readonly ramDisplacedAccessPointers: AddressRegisterAvr[] = [
        RegistersAvr.y,
        RegistersAvr.z,
    ];

    public static readonly multiplication: RegisterPairAvr = new RegisterPairAvr(
        RegistersAvr.r0.name,
        RegistersAvr.r1.name,
    );

    public static readonly zero: RegisterAvr = RegistersAvr.r2;

    public static readonly stackPointer: RegisterPairAvr = RegistersAvr.sp;
}
