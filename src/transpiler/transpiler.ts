import ActionTreeNode from "../constructor_/actionTreeNode";

export default interface Transpiler
{
    run (actionTree: ActionTreeNode): string;
}
