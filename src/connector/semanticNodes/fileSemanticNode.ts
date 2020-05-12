import FunctionSemanticNode from "./functionSemanticNode";
import SemanticKind from "../semanticKind";
import SemanticNode from "./semanticNode";

export default class FileSemanticNode extends SemanticNode
{
    public readonly fileName: string;
    public functions: FunctionSemanticNode[];

    constructor (fileName: string, functions: FunctionSemanticNode[])
    {
        super(SemanticKind.File);

        this.fileName = fileName;
        this.functions = functions;
    }
}
