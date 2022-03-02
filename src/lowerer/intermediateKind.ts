export enum IntermediateKind
{
    File = 'File',
    // Declarations:
    Function = 'Function',
    Constant = 'Constant',
    External = 'External',
    Label = 'Label',
    // Statements:
    Add = 'Add',
    Call = 'Call',
    Compare = 'Compare',
    Dismiss = 'Dismiss',
    Goto = 'Goto',
    Introduce = 'Introduce',
    JumpIfEqual = 'JumpIfEqual',
    JumpIfGreater = 'JumpIfGreater',
    JumpIfLess = 'JumpIfLess',
    Move = 'Move',
    Negate = 'Negate',
    Parameterise = 'Parameterise',
    Receive = 'Receive',
    Return = 'Return',
    Subtract = 'Subtract',
}
