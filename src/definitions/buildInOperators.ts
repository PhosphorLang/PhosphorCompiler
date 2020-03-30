import BinarySemanticOperator from "../connector/semanticOperators/binarySemanticOperator";
import BuildInTypes from "./buildInTypes";
import SemanticOperatorKind from "../connector/semanticOperatorKind";
import TokenKind from "../lexer/tokenKind";
import TypeSemanticSymbol from "../connector/semanticSymbols/typeSemanticSymbol";
import UnarySemanticOperator from "../connector/semanticOperators/unarySemanticOperator";

export default abstract class BuildInOperators
{
    private static unaryOperators: UnarySemanticOperator[] = [
        new UnarySemanticOperator(SemanticOperatorKind.Addition, BuildInTypes.int, BuildInTypes.int),
        new UnarySemanticOperator(SemanticOperatorKind.Subtraction, BuildInTypes.int, BuildInTypes.int),
    ];

    private static binaryOperators: BinarySemanticOperator[] = [
        new BinarySemanticOperator(SemanticOperatorKind.Addition, BuildInTypes.int, BuildInTypes.int, BuildInTypes.int),
        new BinarySemanticOperator(SemanticOperatorKind.Subtraction, BuildInTypes.int, BuildInTypes.int, BuildInTypes.int),
        new BinarySemanticOperator(SemanticOperatorKind.Multiplication, BuildInTypes.int, BuildInTypes.int, BuildInTypes.int),
        new BinarySemanticOperator(SemanticOperatorKind.Division, BuildInTypes.int, BuildInTypes.int, BuildInTypes.int),
    ];

    private static tokenKindToSemanticOperatorKind (tokenKind: TokenKind): SemanticOperatorKind|null
    {
        switch (tokenKind)
        {
            case TokenKind.PlusOperator:
                return SemanticOperatorKind.Addition;
            case TokenKind.MinusOperator:
                return SemanticOperatorKind.Subtraction;
            case TokenKind.StarOperator:
                return SemanticOperatorKind.Multiplication;
            case TokenKind.SlashOperator:
                return SemanticOperatorKind.Division;
            default:
                return null;
        }
    }

    public static getUnaryOperator (tokenKind: TokenKind, operandType: TypeSemanticSymbol): UnarySemanticOperator|null
    {
        const operatorKind = BuildInOperators.tokenKindToSemanticOperatorKind(tokenKind);

        if (operatorKind === null)
        {
            return null;
        }

        for (const unaryOperator of BuildInOperators.unaryOperators)
        {
            if ((unaryOperator.kind == operatorKind) && (unaryOperator.operandType == operandType))
            {
                return unaryOperator;
            }
        }

        return null;
    }

    public static getBinaryOperator (tokenKind: TokenKind, leftType: TypeSemanticSymbol, rightType: TypeSemanticSymbol): BinarySemanticOperator|null
    {
        const operatorKind = BuildInOperators.tokenKindToSemanticOperatorKind(tokenKind);

        if (operatorKind === null)
        {
            return null;
        }

        for (const binaryOperator of BuildInOperators.binaryOperators)
        {
            if ((binaryOperator.kind == operatorKind)
                && (binaryOperator.leftType == leftType)
                && (binaryOperator.rightType == rightType))
            {
                return binaryOperator;
            }
        }

        return null;
    }
}
