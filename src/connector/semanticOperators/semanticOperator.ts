import SemanticOperatorKind from "../semanticOperatorKind";
import TypeSemanticSymbol from "../semanticSymbols/typeSemanticSymbol";

export default abstract class SemanticOperator
{
    public readonly kind: SemanticOperatorKind;
    public readonly resultType: TypeSemanticSymbol;

    constructor (kind: SemanticOperatorKind, resultType: TypeSemanticSymbol)
    {
        this.kind = kind;
        this.resultType = resultType;
    }
}
