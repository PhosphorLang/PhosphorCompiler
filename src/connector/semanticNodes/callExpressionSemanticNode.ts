import * as SemanticSymbols from '../semanticSymbols';
import { ExpressionSemanticNode } from './expressionSemanticNode';
import { SemanticKind } from '../semanticKind';

export class CallExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly functionSymbol: SemanticSymbols.Function;
    public readonly ownerModule: SemanticSymbols.Module;
    public arguments: ExpressionSemanticNode[];

    constructor (functionSymbol: SemanticSymbols.Function, ownerModule: SemanticSymbols.Module, callArguments: ExpressionSemanticNode[])
    {
        super(SemanticKind.CallExpression, functionSymbol.returnType);

        this.functionSymbol = functionSymbol;
        this.ownerModule = ownerModule;
        this.arguments = callArguments;
    }
}
