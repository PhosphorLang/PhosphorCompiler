import * as GenericSymbols from '../genericSymbols';
import { SemanticKind } from '../semanticKind';

export class FileGenericNode <GlobalVariableDeclaration, FieldDeclaration, FunctionDeclaration, ClassTypeSymbol, TypeLikeSymbol>
{
    public readonly kind: SemanticKind.File;

    public readonly name: string;
    public readonly module: GenericSymbols.Module<ClassTypeSymbol, TypeLikeSymbol>;
    public readonly imports: GenericSymbols.Module<ClassTypeSymbol, TypeLikeSymbol>[];
    public readonly variables: GlobalVariableDeclaration[];
    public readonly fields: FieldDeclaration[];
    public readonly functions: FunctionDeclaration[];

    constructor (
        name: string,
        module: GenericSymbols.Module<ClassTypeSymbol, TypeLikeSymbol>,
        imports: GenericSymbols.Module<ClassTypeSymbol, TypeLikeSymbol>[],
        variables: GlobalVariableDeclaration[],
        fields: FieldDeclaration[],
        functions: FunctionDeclaration[]
    ) {
        this.kind = SemanticKind.File;

        this.name = name;
        this.module = module;
        this.imports = imports;
        this.variables = variables;
        this.fields = fields;
        this.functions = functions;
    }
}
