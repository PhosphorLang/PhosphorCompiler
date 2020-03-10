export default abstract class TreeNode<Self extends TreeNode<any, any>, Value>
{
    private _parent: Self|null;
    public readonly value: Value;
    public readonly children: Self[];

    public get parent (): Self|null
    {
        return this._parent;
    }

    public set parent (newParent: Self|null)
    {
        this._parent = newParent;

        // Add this new node automatically to its parent, if there is one:
        this.parent?.children.push(this);
    }

    constructor (parent: Self|null, value: Value)
    {
        this._parent = null; // Because Typescript forces us to set an explicit initialiser... grrr...

        this.parent = parent;
        this.value = value;

        this.children = [];
    }
}
