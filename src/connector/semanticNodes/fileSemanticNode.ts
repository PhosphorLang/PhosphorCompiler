import FunctionSemanticNode from "./functionSemanticNode";
import SemanticKind from "../semanticKind";
import SemanticNode from "./semanticNode";

export default class FileSemanticNode extends SemanticNode
{
    public readonly name: string;
    public functions: FunctionSemanticNode[];

    constructor (name: string, functions: FunctionSemanticNode[])
    {
        super(SemanticKind.File);

        this.name = name;
        this.functions = functions;
    }
}
