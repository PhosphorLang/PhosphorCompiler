import * as IntermediateSymbols from '../intermediateLowerer/intermediateSymbols';
import * as SemanticSymbols from '../connector/semanticSymbols';
import * as SpecialisedSymbols from '../specialiser/specialisedSymbols';
import { IntermediateSize } from '../intermediateLowerer/intermediateSize';
import { Namespace } from '../parser/namespace';
import { SemanticSymbolKind } from '../connector/semanticSymbolKind';
import { TokenKind } from '../lexer/tokenKind';

export abstract class BuildInTypes
{
    private static readonly namespaceNoType = Namespace.constructFromStrings('Phosphor', 'NoType');
    private static readonly namespaceInteger = Namespace.constructFromStrings('Phosphor', 'Integer');
    private static readonly namespaceBoolean = Namespace.constructFromStrings('Phosphor', 'Boolean');
    private static readonly namespaceString = Namespace.constructFromStrings('Phosphor', 'String');
    private static readonly namespacePointer = Namespace.constructFromStrings('Phosphor', 'Pointer');
    private static readonly namespaceArray = Namespace.constructFromStrings('Phosphor', 'Array');

    public static readonly noType = new SpecialisedSymbols.ConcreteType(BuildInTypes.namespaceNoType, []);
    public static readonly integer = new SpecialisedSymbols.ConcreteType(BuildInTypes.namespaceInteger, []);
    public static readonly boolean = new SpecialisedSymbols.ConcreteType(BuildInTypes.namespaceBoolean, []);
    public static readonly string = new SpecialisedSymbols.ConcreteType(BuildInTypes.namespaceString, []);
    public static readonly pointer = new SpecialisedSymbols.ConcreteType(BuildInTypes.namespacePointer, []);

    public static readonly arrayLengthField = new SemanticSymbols.Field(
        Namespace.constructFromNamespace(this.namespaceArray, 'length'),
        BuildInTypes.integer,
        true
    );

    /* TODO: There must be a better way than to special-case the arrays like that.
             Could that be unified with the other types? Or at least be improved? */

    public static isArray (type: { namespace: Namespace }): boolean
    {
        return type.namespace.baseName === BuildInTypes.namespaceArray.baseName;
    }

    public static isArrayStructure (structure: IntermediateSymbols.Structure): boolean
    {
        return structure.name === BuildInTypes.namespaceArray.baseName;
    }

    public static isBuildInType (type: { namespace: Namespace }): boolean
    {
        return type.namespace.equals(BuildInTypes.namespaceInteger)
            || type.namespace.equals(BuildInTypes.namespaceBoolean)
            || type.namespace.equals(BuildInTypes.namespaceString)
            || type.namespace.equals(BuildInTypes.namespacePointer)
            || type.namespace.equals(BuildInTypes.namespaceNoType)
            || BuildInTypes.isArray(type);
    }

    public static createSemanticArrayType (elementType: SemanticSymbols.TypeLike): SemanticSymbols.ConcreteType
    {
        // TODO: It is a bit unfortunate to have this here; it should be part of the connector.

        return new SemanticSymbols.ConcreteType(BuildInTypes.namespaceArray, [elementType]);
    }

    public static createSpecialisedArrayType (elementType: SpecialisedSymbols.ConcreteType): SpecialisedSymbols.ConcreteType
    {
        // TODO: It is a bit unfortunate to have this here; it should be part of the specialiser.

        const specialisedNamespace = Namespace.constructFromNamespace(
            BuildInTypes.namespaceArray,
            [elementType.namespace]
        );

        return new SpecialisedSymbols.ConcreteType(specialisedNamespace, [elementType]);
    }

    public static createArrayIntermediateStructureSymbol (): IntermediateSymbols.Structure
    {
        // TODO: It is a bit unfortunate to have this here; where does it belong to? Should it exist at all?

        const lengthField = new IntermediateSymbols.Field(this.arrayLengthField.namespace.baseName, IntermediateSize.Native, 0);

        return new IntermediateSymbols.Structure(this.namespaceArray.baseName, [lengthField]);
    }

    public static getArrayElementType (type: SemanticSymbols.TypeLike): SemanticSymbols.TypeLike|null
    {
        if (type.namespace.baseName !== BuildInTypes.namespaceArray.baseName)
        {
            return null;
        }

        // Only concrete types have parameters:
        if (type.kind !== SemanticSymbolKind.ConcreteType)
        {
            return null;
        }

        if (type.parameters.length !== 1)
        {
            return null;
        }

        return type.parameters[0];
    }

    public static getTypeByName (name: string): SpecialisedSymbols.ConcreteType|null
    {
        switch (name)
        {
            case BuildInTypes.namespaceNoType.baseName:
                return BuildInTypes.noType;
            case BuildInTypes.namespaceInteger.baseName:
                return BuildInTypes.integer;
            case BuildInTypes.namespaceBoolean.baseName:
                return BuildInTypes.boolean;
            case BuildInTypes.namespaceString.baseName:
                return BuildInTypes.string;
            case BuildInTypes.namespacePointer.baseName:
                return BuildInTypes.pointer;
            case BuildInTypes.namespaceArray.baseName:
                // Array is generic and cannot be returned without parameters:
                return null;
            default:
                return null;
        }
    }

    public static isArrayName (name: string): boolean
    {
        return name === BuildInTypes.namespaceArray.baseName;
    }

    public static getTypeByTokenKind (tokenKind: TokenKind): SpecialisedSymbols.ConcreteType|null
    {
        switch (tokenKind)
        {
            case TokenKind.IntegerToken:
                return BuildInTypes.integer;
            case TokenKind.StringToken:
                return BuildInTypes.string;
            case TokenKind.TrueKeyword:
            case TokenKind.FalseKeyword:
                return BuildInTypes.boolean;
            default:
                return null;
        }
    }
}
