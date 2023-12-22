import * as SemanticSymbols from '../semanticSymbols';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';
import { VariableExpressionSemanticNode } from './variableExpressionSemanticNode';

export class CallExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly functionSymbol: SemanticSymbols.Function;
    public readonly ownerModule: SemanticSymbols.Module;
    public arguments: ExpressionSemanticNode[];
    public readonly thisReference: VariableExpressionSemanticNode|null;

    constructor (
        functionSymbol: SemanticSymbols.Function,
        ownerModule: SemanticSymbols.Module,
        callArguments: ExpressionSemanticNode[],
        thisReference: VariableExpressionSemanticNode|null
    ){
        super(SemanticKind.CallExpression, functionSymbol.returnType);

        this.functionSymbol = functionSymbol;
        this.ownerModule = ownerModule;
        this.arguments = callArguments;
        this.thisReference = thisReference;
    }
}
