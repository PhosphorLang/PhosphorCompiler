import * as SemanticSymbols from '../connector/semanticSymbols';
import { BinarySemanticOperator } from '../connector/semanticOperators/binarySemanticOperator';
import { BuildInTypes } from './buildInTypes';
import { SemanticOperatorKind } from '../connector/semanticOperatorKind';
import { TokenKind } from '../lexer/tokenKind';
import { UnarySemanticOperator } from '../connector/semanticOperators/unarySemanticOperator';

export abstract class BuildInOperators
{
    public static readonly unaryIntAddition = new UnarySemanticOperator(SemanticOperatorKind.Addition, BuildInTypes.integer, BuildInTypes.integer);
    public static readonly unaryIntSubtraction = new UnarySemanticOperator(SemanticOperatorKind.Subtraction, BuildInTypes.integer, BuildInTypes.integer);

    public static readonly unaryIntNot = new UnarySemanticOperator(SemanticOperatorKind.Not, BuildInTypes.integer, BuildInTypes.integer);

    public static readonly unaryBoolNot = new UnarySemanticOperator(SemanticOperatorKind.Not, BuildInTypes.boolean, BuildInTypes.boolean);

    public static readonly binaryIntAddition = new BinarySemanticOperator(SemanticOperatorKind.Addition, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.integer);
    public static readonly binaryIntSubtraction = new BinarySemanticOperator(SemanticOperatorKind.Subtraction, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.integer);
    public static readonly binaryIntMultiplication = new BinarySemanticOperator(SemanticOperatorKind.Multiplication, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.integer);
    public static readonly binaryIntDivision = new BinarySemanticOperator(SemanticOperatorKind.Division, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.integer);
    public static readonly binaryIntModulo = new BinarySemanticOperator(SemanticOperatorKind.Modulo, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.integer);

    public static readonly binaryIntAnd = new BinarySemanticOperator(SemanticOperatorKind.And, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.integer);
    public static readonly binaryIntOr = new BinarySemanticOperator(SemanticOperatorKind.Or, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.integer);

    public static readonly binaryBoolAnd = new BinarySemanticOperator(SemanticOperatorKind.And, BuildInTypes.boolean, BuildInTypes.boolean, BuildInTypes.boolean);
    public static readonly binaryBoolOr = new BinarySemanticOperator(SemanticOperatorKind.Or, BuildInTypes.boolean, BuildInTypes.boolean, BuildInTypes.boolean);

    public static readonly binaryIntEqual = new BinarySemanticOperator(SemanticOperatorKind.Equal, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.boolean);
    public static readonly binaryIntNotEqual = new BinarySemanticOperator(SemanticOperatorKind.NotEqual, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.boolean);
    public static readonly binaryIntLess = new BinarySemanticOperator(SemanticOperatorKind.Less, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.boolean);
    public static readonly binaryIntGreater = new BinarySemanticOperator(SemanticOperatorKind.Greater, BuildInTypes.integer, BuildInTypes.integer, BuildInTypes.boolean);

    public static readonly binaryBoolEqual = new BinarySemanticOperator(SemanticOperatorKind.Equal, BuildInTypes.boolean, BuildInTypes.boolean, BuildInTypes.boolean);
    public static readonly binaryBoolNotEqual = new BinarySemanticOperator(SemanticOperatorKind.NotEqual, BuildInTypes.boolean, BuildInTypes.boolean, BuildInTypes.boolean);

    public static readonly binaryStringEqual = new BinarySemanticOperator(SemanticOperatorKind.Equal, BuildInTypes.string, BuildInTypes.string, BuildInTypes.boolean);

    private static unaryOperators: UnarySemanticOperator[] = [
        BuildInOperators.unaryIntAddition,
        BuildInOperators.unaryIntSubtraction,
        BuildInOperators.unaryIntNot,
        BuildInOperators.unaryBoolNot,
    ];

    private static binaryOperators: BinarySemanticOperator[] = [
        BuildInOperators.binaryIntAddition,
        BuildInOperators.binaryIntSubtraction,
        BuildInOperators.binaryIntMultiplication,
        BuildInOperators.binaryIntDivision,
        BuildInOperators.binaryIntModulo,
        BuildInOperators.binaryIntAnd,
        BuildInOperators.binaryIntOr,
        BuildInOperators.binaryBoolAnd,
        BuildInOperators.binaryBoolOr,
        BuildInOperators.binaryIntEqual,
        BuildInOperators.binaryIntNotEqual,
        BuildInOperators.binaryIntLess,
        BuildInOperators.binaryIntGreater,
        BuildInOperators.binaryBoolEqual,
        BuildInOperators.binaryBoolNotEqual,
        BuildInOperators.binaryStringEqual,
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
            case TokenKind.PercentOperator:
                return SemanticOperatorKind.Modulo;
            case TokenKind.NotOperator:
                return SemanticOperatorKind.Not;
            case TokenKind.AndOperator:
                return SemanticOperatorKind.And;
            case TokenKind.OrOperator:
                return SemanticOperatorKind.Or;
            case TokenKind.EqualOperator:
                return SemanticOperatorKind.Equal;
            case TokenKind.NotEqualOperator:
                return SemanticOperatorKind.NotEqual;
            case TokenKind.LessOperator:
                return SemanticOperatorKind.Less;
            case TokenKind.GreaterOperator:
                return SemanticOperatorKind.Greater;
            default:
                return null;
        }
    }

    public static getUnaryOperator (tokenKind: TokenKind, operandType: SemanticSymbols.Type): UnarySemanticOperator|null
    {
        const operatorKind = BuildInOperators.tokenKindToSemanticOperatorKind(tokenKind);

        if (operatorKind === null)
        {
            return null;
        }

        for (const unaryOperator of BuildInOperators.unaryOperators)
        {
            if ((unaryOperator.kind == operatorKind) && (unaryOperator.operandType.equals(operandType)))
            {
                return unaryOperator;
            }
        }

        return null;
    }

    public static getBinaryOperator (
        tokenKind: TokenKind,
        leftType: SemanticSymbols.Type,
        rightType: SemanticSymbols.Type
    ): BinarySemanticOperator|null
    {
        const operatorKind = BuildInOperators.tokenKindToSemanticOperatorKind(tokenKind);

        if (operatorKind === null)
        {
            return null;
        }

        for (const binaryOperator of BuildInOperators.binaryOperators)
        {
            if ((binaryOperator.kind == operatorKind)
                && (binaryOperator.leftType.equals(leftType))
                && (binaryOperator.rightType.equals(rightType)))
            {
                return binaryOperator;
            }
        }

        return null;
    }
}
