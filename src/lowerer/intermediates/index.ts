export { AddIntermediate as Add } from './addIntermediate';
export { AndIntermediate as And } from './andIntermediate';
export { CallIntermediate as Call } from './callIntermediate';
export { CompareIntermediate as Compare } from './compareIntermediate';
export { ConstantIntermediate as Constant } from './constantIntermediate';
export { DismissIntermediate as Dismiss } from './dismissIntermediate';
export { ExternalIntermediate as External } from './externalIntermediate';
export { FileIntermediate as File } from './fileIntermediate';
export { FunctionIntermediate as Function } from './functionIntermediate';
export { GiveIntermediate as Give } from './giveIntermediate';
export { GotoIntermediate as Goto } from './gotoIntermediate';
export { IntroduceIntermediate as Introduce } from './introduceIntermediate';
export { JumpIfEqualIntermediate as JumpIfEqual } from './jumpIfEqualIntermediate';
export { JumpIfGreaterIntermediate as JumpIfGreater } from './jumpIfGreaterIntermediate';
export { JumpIfLessIntermediate as JumpIfLess } from './jumpIfLessIntermediate';
export { JumpIfNotEqualIntermediate as JumpIfNotEqual } from './jumpIfNotEqualIntermediate';
export { LabelIntermediate as Label } from './labelIntermediate';
export { MoveIntermediate as Move } from './moveIntermediate';
export { MultiplyIntermediate as Multiply } from './multiplyIntermediate';
export { NegateIntermediate as Negate } from './negateIntermediate';
export { NotIntermediate as Not } from './notIntermediate';
export { OrIntermediate as Or } from './orIntermediate';
export { ReturnIntermediate as Return } from './returnIntermediate';
export { SubtractIntermediate as Subtract } from './subtractIntermediate';
export { TakeIntermediate as Take } from './takeIntermediate';

import { AddIntermediate } from './addIntermediate';
import { AndIntermediate } from './andIntermediate';
import { CallIntermediate } from './callIntermediate';
import { CompareIntermediate } from './compareIntermediate';
import { ConstantIntermediate } from './constantIntermediate';
import { DismissIntermediate } from './dismissIntermediate';
import { ExternalIntermediate } from './externalIntermediate';
import { FileIntermediate } from './fileIntermediate';
import { FunctionIntermediate } from './functionIntermediate';
import { GiveIntermediate } from './giveIntermediate';
import { GotoIntermediate } from './gotoIntermediate';
import { IntroduceIntermediate } from './introduceIntermediate';
import { JumpIfEqualIntermediate } from './jumpIfEqualIntermediate';
import { JumpIfGreaterIntermediate } from './jumpIfGreaterIntermediate';
import { JumpIfLessIntermediate } from './jumpIfLessIntermediate';
import { JumpIfNotEqualIntermediate } from './jumpIfNotEqualIntermediate';
import { LabelIntermediate } from './labelIntermediate';
import { MoveIntermediate } from './moveIntermediate';
import { MultiplyIntermediate } from './multiplyIntermediate';
import { NegateIntermediate } from './negateIntermediate';
import { NotIntermediate } from './notIntermediate';
import { OrIntermediate } from './orIntermediate';
import { ReturnIntermediate } from './returnIntermediate';
import { SubtractIntermediate } from './subtractIntermediate';
import { TakeIntermediate } from './takeIntermediate';

export type Intermediate =
    AddIntermediate | AndIntermediate | CallIntermediate | CompareIntermediate | ConstantIntermediate | DismissIntermediate
    | ExternalIntermediate | FileIntermediate | FunctionIntermediate | GiveIntermediate | GotoIntermediate | IntroduceIntermediate
    | JumpIfEqualIntermediate | JumpIfGreaterIntermediate | JumpIfLessIntermediate | JumpIfNotEqualIntermediate | LabelIntermediate
    | MoveIntermediate | MultiplyIntermediate | NegateIntermediate | NotIntermediate | OrIntermediate | ReturnIntermediate
    | SubtractIntermediate | TakeIntermediate;

export type Statement =
    AddIntermediate | AndIntermediate | CallIntermediate | CompareIntermediate | DismissIntermediate | GiveIntermediate | GotoIntermediate
    | IntroduceIntermediate | JumpIfEqualIntermediate | JumpIfGreaterIntermediate | JumpIfLessIntermediate | JumpIfNotEqualIntermediate
    | LabelIntermediate | MoveIntermediate | MultiplyIntermediate | NegateIntermediate | NotIntermediate | OrIntermediate
    | ReturnIntermediate | SubtractIntermediate | TakeIntermediate;
