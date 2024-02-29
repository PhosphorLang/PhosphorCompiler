import * as SemanticSymbols from '../semanticSymbols';
import { SemanticKind } from '../semanticKind';

export class CallExpressionGenericNode <Expression>
{
    public readonly kind: SemanticKind.CallExpression;

    public readonly type: SemanticSymbols.ConcreteType;

    public readonly functionSymbol: SemanticSymbols.Function;
    public readonly arguments: Expression[];
    public readonly thisReference: Expression|null;

    constructor (
        functionSymbol: SemanticSymbols.Function,
        callArguments: Expression[],
        thisReference: Expression|null
    ){
        this.kind = SemanticKind.CallExpression;

        this.type = functionSymbol.returnType;

        this.functionSymbol = functionSymbol;
        this.arguments = callArguments;
        this.thisReference = thisReference;
    }
}
