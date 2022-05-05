import { ExpressionSemanticNode } from './expressionSemanticNode';
import { FunctionSemanticSymbol } from '../semanticSymbols/functionSemanticSymbol';
import { SemanticKind } from '../semanticKind';

export class CallExpressionSemanticNode extends ExpressionSemanticNode
{
    public readonly functionSymbol: FunctionSemanticSymbol;
    public arguments: ExpressionSemanticNode[];

    constructor (functionSymbol: FunctionSemanticSymbol, callArguments: ExpressionSemanticNode[])
    {
        super(SemanticKind.CallExpression, functionSymbol.returnType);

        this.functionSymbol = functionSymbol;
        this.arguments = callArguments;
    }
}
