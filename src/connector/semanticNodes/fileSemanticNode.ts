import FunctionDeclarationSemanticNode from "./functionDeclarationSemanticNode";
import SemanticKind from "../semanticKind";
import SemanticNode from "./semanticNode";

export default class FileSemanticNode extends SemanticNode
{
    public readonly name: string;
    public functions: FunctionDeclarationSemanticNode[];

    constructor (name: string, functions: FunctionDeclarationSemanticNode[])
    {
        super(SemanticKind.File);

        this.name = name;
        this.functions = functions;
    }
}
