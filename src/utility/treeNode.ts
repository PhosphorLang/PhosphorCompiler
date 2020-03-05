export default abstract class TreeNode<Self extends TreeNode<any, any>, Value>
{
    public readonly parent: Self|null;
    public readonly value: Value;
    public readonly children: Self[];

    constructor (parent: Self|null, value: Value)
    {
        this.parent = parent;
        this.value = value;

        this.children = [];

        // Add this new node automatically to its parent, if there is one:
        this.parent?.children.push(this);
    }
}
