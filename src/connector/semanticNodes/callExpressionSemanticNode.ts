import * as SemanticNodes from '.';
import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class CallExpressionSemanticNode
{
    public readonly kind: SemanticKind.CallExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly functionSymbol: SemanticSymbols.Function;
    public readonly ownerModule: SemanticSymbols.Module;
    public arguments: SemanticNodes.Expression[];
    public readonly thisReference: SemanticNodes.VariableExpression|null;

    constructor (
        functionSymbol: SemanticSymbols.Function,
        ownerModule: SemanticSymbols.Module,
        callArguments: SemanticNodes.Expression[],
        thisReference: SemanticNodes.VariableExpression|null
    ){
        this.kind = SemanticKind.CallExpression;

        this.type = functionSymbol.returnType;

        this.functionSymbol = functionSymbol;
        this.ownerModule = ownerModule;
        this.arguments = callArguments;
        this.thisReference = thisReference;
    }
}
