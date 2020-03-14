import ActionToken from "../../src/constructor_/actionToken";
import Defaults from "./defaults";
import SemanticalType from "../../src/constructor_/semanticalType";

export default abstract class ActionTokenCreator
{
    public static newFile (fileName = Defaults.fileName): ActionToken
    {
        return new ActionToken(SemanticalType.File, fileName);
    }

    public static newFunction (name = Defaults.identifier): ActionToken
    {
        return new ActionToken(SemanticalType.Function, name);
    }

    public static newIntegerDefinition (id: string, value = Defaults.number): ActionToken
    {
        return new ActionToken(SemanticalType.IntegerDefinition, id, value);
    }

    public static newIntegerLiteral (id: string, value = Defaults.number): ActionToken
    {
        return new ActionToken(SemanticalType.IntegerLiteral, id, value);
    }

    public static newStringDefinition (id: string, value = Defaults.string): ActionToken
    {
        return new ActionToken(SemanticalType.StringDefinition, id, value);
    }

    public static newStringLiteral (id: string, value = Defaults.string): ActionToken
    {
        return new ActionToken(SemanticalType.StringLiteral, id, value);
    }

    public static newAddition (): ActionToken
    {
        return new ActionToken(SemanticalType.Addition);
    }
}
