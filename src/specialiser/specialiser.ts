import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import * as SpecialisedNodes from './specialisedNodes';
import * as SpecialisedSymbols from './specialisedSymbols';
import { BuildInTypes } from '../definitions/buildInTypes';
import { Namespace } from '../parser/namespace';
import { SemanticKind } from '../connector/semanticKind';
import { SemanticSymbolKind } from '../connector/semanticSymbolKind';

/**
 * Takes in a generic semantic tree and returns the specialised version of it. A module is generic if it has one or more generic
 * parameters (e.g. Array[T]) and is specialised when used with concrete types (e.g. Array[Integer]).
 * This is achieved by three things:
 * 1. Finding all concrete usages of generic modules.
 * 2. Creating specialised versions of these generic modules for each concrete usage.
 * 3. Rewriting the usages to point to the specialised versions.
 */
export class Specialiser
{
    /**
     * A map of qualified names to their corresponding semantic files.
     * This is used to look up semantic files when specialising generic modules.
     */
    private qualifiedNameToSemanticFile: Map<string, SemanticNodes.File>;

    /**
     * A map of qualified names to their corresponding specialised files.
     * This is filled during the specialisation process and is used to look up already specialised files.
     */
    private qualifiedNameToSpecialisedFile: Map<string, SpecialisedNodes.File>;

    /**
     * A map of the generic type parameters to their concrete type they should be replaced with.
     * This is set when specialising a generic module and is used to replace generic type parameters.
     */
    private genericParameterToConcreteType: Map<SemanticSymbols.GenericTypeParameter, SpecialisedSymbols.ConcreteType>;

    /**
     * Cache of specialised variable symbols (by their namespace) for the module currently being specialised.
     * This ensures that variable declarations and variable expressions use the same symbol object.
     */
    private variableSymbols: Map<string, SpecialisedSymbols.Variable>;

    /**
     * Cache of specialised field symbols (by their namespace) for the module currently being specialised.
     * This ensures that field declarations and field expressions use the same symbol object.
     */
    private fieldSymbols: Map<string, SpecialisedSymbols.Field>;

    /**
     * Cache of specialised function symbols (by their namespace) for the module currently being specialised.
     * This ensures that function declarations and call expressions use the same symbol object.
     */
    private functionSymbols: Map<string, SpecialisedSymbols.Function>;

    /**
     * Cache of local variables within the function currently being specialised.
     * This ensures that variable declarations and expressions use the same symbol object.
     */
    private currentLocalVariables: Map<string, SpecialisedSymbols.Variable>;

    /**
     * The function symbol currently being specialised.
     * This is used to look up parameter symbols for variable expressions.
     */
    private currentFunctionSymbol: SpecialisedSymbols.Function|null;

    /**
     * Tracks newly specialised modules during the current specialisation process.
     * This is used to add them to imports without needing set difference operations.
     */
    private additionalImports: SpecialisedSymbols.Module[];

    constructor ()
    {
        this.qualifiedNameToSemanticFile = new Map();
        this.qualifiedNameToSpecialisedFile = new Map();
        this.genericParameterToConcreteType = new Map();
        this.variableSymbols = new Map();
        this.fieldSymbols = new Map();
        this.functionSymbols = new Map();
        this.currentLocalVariables = new Map();
        this.currentFunctionSymbol = null;
        this.additionalImports = [];
    }

    /**
     * Runs the specialisation process on the given semantic file.
     * @param fileSemanticNode The semantic file to analyse and specialise.
     * @param qualifiedNameToSemanticFile A map of qualified names to semantic files.
     * @param qualifiedNameToSpecialisedFile A map of qualified names to specialised files.
     * @returns The specialised file or null if the module is an unspecialised generic.
     */
    public run (
        fileSemanticNode: SemanticNodes.File,
        qualifiedNameToSemanticFile: Map<string, SemanticNodes.File>,
        qualifiedNameToSpecialisedFile: Map<string, SpecialisedNodes.File>
    ): void
    {
        this.qualifiedNameToSemanticFile = qualifiedNameToSemanticFile;
        this.qualifiedNameToSpecialisedFile = qualifiedNameToSpecialisedFile;
        this.genericParameterToConcreteType = new Map();

        // If the module is generic (has type parameters) and we do not have concrete type mappings,
        // skip the specialisation for now; it will be specialised later when actually used with concrete types:
        if (this.isUnspecialisedGenericModule(fileSemanticNode.module))
        {
            return;
        }

        this.specialiseFile(fileSemanticNode);
    }

    private runWithConcreteTypes (
        fileSemanticNode: SemanticNodes.File,
        qualifiedNameToSemanticFile: Map<string, SemanticNodes.File>,
        qualifiedNameToSpecialisedFile: Map<string, SpecialisedNodes.File>,
        concreteTypeParameters: SpecialisedSymbols.ConcreteType[]
    ): void
    {
        this.qualifiedNameToSemanticFile = qualifiedNameToSemanticFile;
        this.qualifiedNameToSpecialisedFile = qualifiedNameToSpecialisedFile;
        this.genericParameterToConcreteType = new Map();

        if (fileSemanticNode.module.classType === null)
        {
            throw new Error('Specialiser error: Attempted to specialise a non-generic module with concrete types.');
        }

        const genericTypeParameters = fileSemanticNode.module.classType.parameters;
        for (let i = 0; i < genericTypeParameters.length; i++)
        {
            this.genericParameterToConcreteType.set(genericTypeParameters[i], concreteTypeParameters[i]);
        }

        this.specialiseFile(fileSemanticNode);
    }

    /**
     * Gets the concrete type parameter namespaces from the current mapping.
     * @returns An array of namespaces for the concrete type parameters.
     */
    private getConcreteTypeParameterNamespaces (): Namespace[]
    {
        const namespaces: Namespace[] = [];
        for (const concreteType of this.genericParameterToConcreteType.values())
        {
            namespaces.push(concreteType.namespace);
        }

        return namespaces;
    }

    /**
     * Gets the namespaces from an array of concrete types.
     * @param types The concrete types to extract the namespaces from.
     * @returns An array of namespaces.
     */
    private getNamespacesFromTypes (types: SpecialisedSymbols.ConcreteType[]): Namespace[]
    {
        const namespaces: Namespace[] = [];
        for (const type of types)
        {
            namespaces.push(type.namespace);
        }

        return namespaces;
    }

    /**
     * Gets the specialised namespace for a symbol given the concrete type parameters.
     * @param symbol The semantic symbol to get the namespace for.
     * @param parameters The concrete type parameters to specialise with.
     * @returns The specialised namespace.
     */
    private getNamespaceForSymbolWithTypeParameters (
        symbol: SemanticSymbols.SemanticSymbol,
        parameters: SpecialisedSymbols.ConcreteType[]
    ): Namespace
    {
        let specialisedFunctionNamespace: Namespace;
        if (parameters.length > 0)
        {
            const parameterNamespaces = this.getNamespacesFromTypes(parameters);

            specialisedFunctionNamespace = Namespace.constructFromNamespace(
                symbol.namespace,
                parameterNamespaces
            );
        }
        else
        {
            specialisedFunctionNamespace = symbol.namespace;
        }

        return specialisedFunctionNamespace;
    }

    /**
     * Checks if a module is generic and has no concrete type mappings yet.
     * Such modules should not be directly specialised, but only when used with concrete types.
     */
    private isUnspecialisedGenericModule (module: SemanticSymbols.Module): boolean
    {
        if (module.classType === null)
        {
            return false;
        }

        if (module.classType.parameters.length === 0)
        {
            return false;
        }

        return this.genericParameterToConcreteType.size === 0;
    }

    private specialiseFile (fileSemanticNode: SemanticNodes.File): SpecialisedNodes.File
    {
        const specialisedImports = this.specialiseImports(fileSemanticNode.imports);
        const specialisedModule = this.specialiseModule(fileSemanticNode.module);
        const specialisedVariables = this.specialiseGlobalVariables(fileSemanticNode.variables, specialisedModule);
        const specialisedFields = this.specialiseFields(fileSemanticNode.fields, specialisedModule);

        this.additionalImports = [];
        const specialisedFunctions = this.specialiseFunctions(fileSemanticNode.functions, specialisedModule);

        const specialisedFile = new SpecialisedNodes.File(
            fileSemanticNode.name,
            specialisedModule,
            [...specialisedImports, ...this.additionalImports],
            specialisedVariables,
            specialisedFields,
            specialisedFunctions
        );

        this.qualifiedNameToSpecialisedFile.set(specialisedModule.namespace.qualifiedName, specialisedFile);

        this.variableSymbols.clear();
        this.fieldSymbols.clear();
        this.functionSymbols.clear();
        this.additionalImports = [];

        return specialisedFile;
    }

    private specialiseImports (imports: SemanticSymbols.Module[]): SpecialisedSymbols.Module[]
    {
        const specialisedImports: SpecialisedSymbols.Module[] = [];

        for (const importedModule of imports)
        {
            if (this.isUnspecialisedGenericModule(importedModule))
            {
                // Will be specialised when used with concrete types.
                continue;
            }

            const existingSpecialisedFile = this.qualifiedNameToSpecialisedFile.get(importedModule.namespace.qualifiedName);
            if (existingSpecialisedFile !== undefined)
            {
                specialisedImports.push(existingSpecialisedFile.module);
            }
            else
            {
                const specialisedModule = this.specialiseModule(importedModule);
                specialisedImports.push(specialisedModule);
            }
        }

        return specialisedImports;
    }

    private specialiseModule (module: SemanticSymbols.Module): SpecialisedSymbols.Module
    {
        const specialisedClassType = this.specialiseGenericTypeToConcreteType(module.classType);

        let specialisedNamespace = module.namespace;
        const concreteTypeParameterNamespaces = this.getConcreteTypeParameterNamespaces();
        if (concreteTypeParameterNamespaces.length > 0)
        {
            specialisedNamespace = Namespace.constructFromNamespace(module.namespace, concreteTypeParameterNamespaces);
        }
        else if (specialisedClassType !== null && specialisedClassType.parameters.length > 0)
        {
            specialisedNamespace = specialisedClassType.namespace;
        }

        this.variableSymbols.clear();
        this.fieldSymbols.clear();
        this.functionSymbols.clear();

        // Global variables:
        const specialisedVariableNameToSymbol = new Map<string, SpecialisedSymbols.Variable>();
        for (const variable of module.variableNameToSymbol.values())
        {
            const specialisedVariable = this.specialiseVariableSymbol(variable);
            specialisedVariableNameToSymbol.set(specialisedVariable.namespace.qualifiedName, specialisedVariable);
            this.variableSymbols.set(specialisedVariable.namespace.qualifiedName, specialisedVariable);
        }

        // Fields:
        const specialisedFieldNameToSymbol = new Map<string, SpecialisedSymbols.Field>();
        for (const field of module.fieldNameToSymbol.values())
        {
            const specialisedField = this.specialiseFieldSymbol(field);
            specialisedFieldNameToSymbol.set(specialisedField.namespace.qualifiedName, specialisedField);
            this.fieldSymbols.set(specialisedField.namespace.qualifiedName, specialisedField);
        }

        // Functions:
        const specialisedFunctionNameToSymbol = new Map<string, SpecialisedSymbols.Function>();
        for (const functionSymbol of module.functionNameToSymbol.values())
        {
            const specialisedFunction = this.specialiseFunctionSymbol(functionSymbol);
            specialisedFunctionNameToSymbol.set(specialisedFunction.namespace.qualifiedName, specialisedFunction);
            this.functionSymbols.set(specialisedFunction.namespace.qualifiedName, specialisedFunction);
        }

        const moduleResult = new SpecialisedSymbols.Module(
            specialisedNamespace,
            specialisedClassType,
            specialisedVariableNameToSymbol,
            specialisedFieldNameToSymbol,
            specialisedFunctionNameToSymbol,
            module.isEntryPoint
        );

        return moduleResult;
    }

    /**
     * Specialises a GenericType to a ConcreteType.
     * This is used for converting the classType of a module, which is a GenericType in the semantic tree but a ConcreteType in the
     * specialised tree.
     */
    private specialiseGenericTypeToConcreteType (genericType: SemanticSymbols.GenericType|null): SpecialisedSymbols.ConcreteType|null
    {
        if (genericType === null)
        {
            return null;
        }

        const specialisedParameters: SpecialisedSymbols.ConcreteType[] = [];
        for (const parameter of genericType.parameters)
        {
            const mappedType = this.genericParameterToConcreteType.get(parameter);
            if (mappedType !== undefined)
            {
                specialisedParameters.push(mappedType);
            }
            else
            {
                const concreteParameter = new SpecialisedSymbols.ConcreteType(parameter.namespace, []);
                specialisedParameters.push(concreteParameter);
            }
        }

        if (specialisedParameters.length === 0)
        {
            return new SpecialisedSymbols.ConcreteType(genericType.namespace, []);
        }

        const parameterNamespaces = this.getNamespacesFromTypes(specialisedParameters);
        const specialisedNamespace = Namespace.constructFromNamespace(genericType.namespace, parameterNamespaces);

        return new SpecialisedSymbols.ConcreteType(specialisedNamespace, specialisedParameters);
    }

    private specialiseType (type: SemanticSymbols.TypeLike|null): SpecialisedSymbols.ConcreteType|null
    {
        if (type === null)
        {
            return null;
        }

        if (type.kind === SemanticSymbolKind.GenericTypeParameter)
        {
            const concreteType = this.genericParameterToConcreteType.get(type);
            if (concreteType === undefined)
            {
                throw new Error(
                    `Specialiser error: Generic type parameter "${type.namespace.qualifiedName}" has no concrete type mapping.`
                );
            }
            return concreteType;
        }
        else
        {
            if (type.parameters.length === 0)
            {

                const builtIn = BuildInTypes.getTypeByName(type.namespace.baseName);
                if (builtIn !== null)
                {
                    return builtIn;
                }

                return new SpecialisedSymbols.ConcreteType(type.namespace, []);
            }

            const specialisedParameters: SpecialisedSymbols.ConcreteType[] = [];
            for (const parameter of type.parameters)
            {
                const specialisedParameter = this.specialiseType(parameter);
                if (specialisedParameter === null)
                {
                    throw new Error(`Specialiser error: Type parameter in "${type.namespace.qualifiedName}" is null.`);
                }
                specialisedParameters.push(specialisedParameter);
            }

            if (BuildInTypes.isArray(type))
            {
                return BuildInTypes.createSpecialisedArrayType(specialisedParameters[0]);
            }

            const parameterNamespaces = this.getNamespacesFromTypes(specialisedParameters);
            const specialisedNamespace = Namespace.constructFromNamespace(type.namespace, parameterNamespaces);

            // Trigger the specialisation of the generic module only if the original type did not contain
            // generic type parameters. If it did, we are inside a specialisation (e.g. processing the "this"
            // parameter of a method) and should not trigger a recursive specialisation:
            const containsGenericParameters = this.typeContainsGenericParameters(type);
            if (!containsGenericParameters)
            {
                this.ensureGenericModuleIsSpecialised(
                    type.namespace.qualifiedName,
                    specialisedNamespace.qualifiedName,
                    specialisedParameters
                );
            }

            return new SpecialisedSymbols.ConcreteType(specialisedNamespace, specialisedParameters);
        }
    }

    /**
     * Checks if a type contains generic type parameters that are in the current mapping.
     */
    private typeContainsGenericParameters (type: SemanticSymbols.TypeLike): boolean
    {
        if (type.kind === SemanticSymbolKind.GenericTypeParameter)
        {
            return this.genericParameterToConcreteType.has(type);
        }

        for (const parameter of type.parameters)
        {
            if (this.typeContainsGenericParameters(parameter))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Ensures that a generic module is specialised with the given concrete type parameters.
     * If the specialised version does not exist yet, it will be created.
     */
    private ensureGenericModuleIsSpecialised (
        genericQualifiedName: string,
        specialisedQualifiedName: string,
        concreteTypeParameters: SpecialisedSymbols.ConcreteType[]
    ): void
    {
        if (this.qualifiedNameToSpecialisedFile.has(specialisedQualifiedName))
        {
            return;
        }

        const genericFile = this.qualifiedNameToSemanticFile.get(genericQualifiedName);
        if (genericFile === undefined)
        {
            // The type is not a generic module (e.g. a build-in type), so we don't need to specialise it.
            return;
        }

        if (genericFile.module.classType === null)
        {
            // The module is not generic, so we don't need to specialise it.
            return;
        }

        const genericTypeParameters = genericFile.module.classType.parameters;
        if (genericTypeParameters.length === 0)
        {
            // The module has no generic type parameters, so we don't need to specialise it.
            return;
        }

        if (genericTypeParameters.length !== concreteTypeParameters.length)
        {
            throw new Error(
                `Specialiser error: Generic module "${genericQualifiedName}" has ${genericTypeParameters.length} type parameters, `
                + `but ${concreteTypeParameters.length} were provided.`
            );
        }

        // Create a new Specialiser instance for recursive specialisation.
        // This ensures each specialisation has its own context while sharing the file caches:
        const recursiveSpecialiser = new Specialiser();

        recursiveSpecialiser.runWithConcreteTypes(
            genericFile,
            this.qualifiedNameToSemanticFile,
            this.qualifiedNameToSpecialisedFile,
            concreteTypeParameters
        );

        const specialisedFile = this.qualifiedNameToSpecialisedFile.get(specialisedQualifiedName);
        if (specialisedFile !== undefined)
        {
            this.additionalImports.push(specialisedFile.module);
        }
    }

    /**
     * Updates the namespace of a symbol to include the concrete type parameters.
     * This transforms e.g. "Container\~content" to "Container[Integer]\~content".
     */
    private specialiseSymbolNamespace (namespace: Namespace): Namespace
    {
        const concreteTypeParameterNamespaces = this.getConcreteTypeParameterNamespaces();
        if (concreteTypeParameterNamespaces.length === 0)
        {
            return namespace;
        }

        if (namespace.memberName === null)
        {
            // If the namespace has no member name, it's a module namespace, not a symbol namespace.
            // Module namespaces are handled separately in specialiseModule.
            return namespace;
        }

        return Namespace.constructFromNamespace(namespace, concreteTypeParameterNamespaces);
    }

    private specialiseVariableSymbol (variable: SemanticSymbols.Variable): SpecialisedSymbols.Variable
    {
        const specialisedType = this.specialiseType(variable.type);
        if (specialisedType === null)
        {
            throw new Error(`Specialiser error: Variable "${variable.namespace.qualifiedName}" has no type.`);
        }

        const specialisedNamespace = this.specialiseSymbolNamespace(variable.namespace);

        return new SpecialisedSymbols.Variable(specialisedNamespace, specialisedType, variable.isReadonly);
    }

    private specialiseFieldSymbol (field: SemanticSymbols.Field): SpecialisedSymbols.Field
    {
        const specialisedType = this.specialiseType(field.type);
        if (specialisedType === null)
        {
            throw new Error(`Specialiser error: Field "${field.namespace.qualifiedName}" has no type.`);
        }

        const specialisedNamespace = this.specialiseSymbolNamespace(field.namespace);

        return new SpecialisedSymbols.Field(specialisedNamespace, specialisedType, field.isReadonly);
    }

    private specialiseFunctionSymbol (functionSymbol: SemanticSymbols.Function): SpecialisedSymbols.Function
    {
        const specialisedReturnType = this.specialiseType(functionSymbol.returnType);
        if (specialisedReturnType === null)
        {
            throw new Error(`Specialiser error: Function "${functionSymbol.namespace.qualifiedName}" has no return type.`);
        }

        const specialisedParameters: SpecialisedSymbols.FunctionParameter[] = [];
        for (const parameter of functionSymbol.parameters)
        {
            specialisedParameters.push(this.specialiseFunctionParameterSymbol(parameter));
        }

        let specialisedThisReference: SpecialisedSymbols.FunctionParameter|null = null;
        if (functionSymbol.thisReference !== null)
        {
            specialisedThisReference = this.specialiseFunctionParameterSymbol(functionSymbol.thisReference);
        }

        const specialisedNamespace = this.specialiseSymbolNamespace(functionSymbol.namespace);

        return new SpecialisedSymbols.Function(
            specialisedNamespace,
            specialisedReturnType,
            specialisedParameters,
            specialisedThisReference,
            functionSymbol.isHeader
        );
    }

    private specialiseFunctionParameterSymbol (parameter: SemanticSymbols.FunctionParameter): SpecialisedSymbols.FunctionParameter
    {
        const specialisedType = this.specialiseType(parameter.type);
        if (specialisedType === null)
        {
            throw new Error(`Specialiser error: Function parameter "${parameter.namespace.qualifiedName}" has no type.`);
        }

        const specialisedNamespace = this.specialiseSymbolNamespace(parameter.namespace);

        return new SpecialisedSymbols.FunctionParameter(specialisedNamespace, specialisedType);
    }

    private specialiseGlobalVariables (
        variables: SemanticNodes.GlobalVariableDeclaration[],
        specialisedModule: SpecialisedSymbols.Module
    ): SpecialisedNodes.GlobalVariableDeclaration[]
    {
        const specialisedVariables: SpecialisedNodes.GlobalVariableDeclaration[] = [];

        for (const variable of variables)
        {
            const specialisedVariable = this.specialiseGlobalVariableDeclaration(variable, specialisedModule);
            specialisedVariables.push(specialisedVariable);
        }

        return specialisedVariables;
    }

    private specialiseGlobalVariableDeclaration (
        variable: SemanticNodes.GlobalVariableDeclaration,
        specialisedModule: SpecialisedSymbols.Module
    ): SpecialisedNodes.GlobalVariableDeclaration
    {
        const originalNamespace = variable.symbol.namespace;
        let specialisedSymbol = specialisedModule.variableNameToSymbol.get(originalNamespace.qualifiedName);

        if (specialisedSymbol === undefined)
        {
            const specialisedNamespace = this.specialiseSymbolNamespace(variable.symbol.namespace);

            specialisedSymbol = specialisedModule.variableNameToSymbol.get(specialisedNamespace.qualifiedName);
            if (specialisedSymbol === undefined)
            {
                throw new Error(
                    `Specialiser error: Variable "${specialisedNamespace.qualifiedName}" not found in module`
                    + ` "${specialisedModule.namespace.qualifiedName}".`
                );
            }
        }

        const specialisedInitialiser = this.specialiseExpressionNullable(variable.initialiser);

        return new SpecialisedNodes.GlobalVariableDeclaration(specialisedSymbol, specialisedInitialiser);
    }

    private specialiseFields (
        fields: SemanticNodes.FieldDeclaration[],
        specialisedModule: SpecialisedSymbols.Module
    ): SpecialisedNodes.FieldDeclaration[]
    {
        const specialisedFields: SpecialisedNodes.FieldDeclaration[] = [];

        for (const field of fields)
        {
            const specialisedField = this.specialiseFieldDeclaration(field, specialisedModule);
            specialisedFields.push(specialisedField);
        }

        return specialisedFields;
    }

    private specialiseFieldDeclaration (
        field: SemanticNodes.FieldDeclaration,
        specialisedModule: SpecialisedSymbols.Module
    ): SpecialisedNodes.FieldDeclaration
    {
        const originalNamespace = field.symbol.namespace;
        let specialisedSymbol = specialisedModule.fieldNameToSymbol.get(originalNamespace.qualifiedName);

        if (specialisedSymbol === undefined)
        {
            const specialisedNamespace = this.specialiseSymbolNamespace(field.symbol.namespace);

            specialisedSymbol = specialisedModule.fieldNameToSymbol.get(specialisedNamespace.qualifiedName);
            if (specialisedSymbol === undefined)
            {
                throw new Error(
                    `Specialiser error: Field "${specialisedNamespace.qualifiedName}" not found in module`
                    + ` "${specialisedModule.namespace.qualifiedName}".`
                );
            }
        }

        const specialisedInitialiser = this.specialiseExpressionNullable(field.initialiser);

        return new SpecialisedNodes.FieldDeclaration(specialisedSymbol, specialisedInitialiser);
    }

    private specialiseFunctions (
        functions: SemanticNodes.FunctionDeclaration[],
        specialisedModule: SpecialisedSymbols.Module
    ): SpecialisedNodes.FunctionDeclaration[]
    {
        const specialisedFunctions: SpecialisedNodes.FunctionDeclaration[] = [];

        for (const functionDeclaration of functions)
        {
            const specialisedFunction = this.specialiseFunctionDeclaration(functionDeclaration, specialisedModule);
            specialisedFunctions.push(specialisedFunction);
        }

        return specialisedFunctions;
    }

    private specialiseFunctionDeclaration (
        functionDeclaration: SemanticNodes.FunctionDeclaration,
        specialisedModule: SpecialisedSymbols.Module
    ): SpecialisedNodes.FunctionDeclaration
    {
        const originalNamespace = functionDeclaration.symbol.namespace;
        let specialisedSymbol = specialisedModule.functionNameToSymbol.get(originalNamespace.qualifiedName);

        if (specialisedSymbol === undefined)
        {
            const specialisedNamespace = this.specialiseSymbolNamespace(functionDeclaration.symbol.namespace);

            specialisedSymbol = specialisedModule.functionNameToSymbol.get(specialisedNamespace.qualifiedName);
            if (specialisedSymbol === undefined)
            {
                throw new Error(
                    `Specialiser error: Function "${specialisedNamespace.qualifiedName}" not found in module`
                    + ` "${specialisedModule.namespace.qualifiedName}".`
                );
            }
        }

        this.currentLocalVariables.clear();
        this.currentFunctionSymbol = specialisedSymbol;

        let specialisedSection: SpecialisedNodes.Section|null = null;
        if (functionDeclaration.section !== null)
        {
            specialisedSection = this.specialiseSection(functionDeclaration.section);
        }

        this.currentLocalVariables.clear();
        this.currentFunctionSymbol = null;

        return new SpecialisedNodes.FunctionDeclaration(specialisedSymbol, specialisedSection);
    }

    private specialiseSection (section: SemanticNodes.Section): SpecialisedNodes.Section
    {
        const specialisedStatements: SpecialisedNodes.Statement[] = [];

        for (const statement of section.statements)
        {
            const specialisedStatement = this.specialiseStatement(statement);
            specialisedStatements.push(specialisedStatement);
        }

        return new SpecialisedNodes.Section(specialisedStatements);
    }

    private specialiseStatement (statement: SemanticNodes.Statement): SpecialisedNodes.Statement
    {
        switch (statement.kind)
        {
            case SemanticKind.Assignment:
                return this.specialiseAssignment(statement);
            case SemanticKind.CallExpression:
                return this.specialiseCallExpression(statement);
            case SemanticKind.IfStatement:
                return this.specialiseIfStatement(statement);
            case SemanticKind.LocalVariableDeclaration:
                return this.specialiseLocalVariableDeclaration(statement);
            case SemanticKind.ReturnStatement:
                return this.specialiseReturnStatement(statement);
            case SemanticKind.Section:
                return this.specialiseSection(statement);
            case SemanticKind.ArraySetExpression:
                return this.specialiseArraySetExpression(statement);
            case SemanticKind.WhileStatement:
                return this.specialiseWhileStatement(statement);
            case SemanticKind.FreeStatement:
                return this.specialiseFreeStatement(statement);
        }
    }

    private specialiseAssignment (assignment: SemanticNodes.Assignment): SpecialisedNodes.Assignment
    {
        let specialisedTo: SpecialisedNodes.FieldExpression|SpecialisedNodes.VariableExpression;
        if (assignment.to.kind === SemanticKind.FieldExpression)
        {
            specialisedTo = this.specialiseFieldExpression(assignment.to);
        }
        else
        {
            specialisedTo = this.specialiseVariableExpression(assignment.to);
        }

        const specialisedFrom = this.specialiseExpression(assignment.from);

        return new SpecialisedNodes.Assignment(specialisedTo, specialisedFrom);
    }

    private specialiseIfStatement (ifStatement: SemanticNodes.IfStatement): SpecialisedNodes.IfStatement
    {
        const specialisedCondition = this.specialiseExpression(ifStatement.condition);
        const specialisedSection = this.specialiseSection(ifStatement.section);

        let specialisedElseClause: SpecialisedNodes.ElseClause|null = null;
        if (ifStatement.elseClause !== null)
        {
            specialisedElseClause = this.specialiseElseClause(ifStatement.elseClause);
        }

        return new SpecialisedNodes.IfStatement(specialisedCondition, specialisedSection, specialisedElseClause);
    }

    private specialiseElseClause (elseClause: SemanticNodes.ElseClause): SpecialisedNodes.ElseClause
    {
        let specialisedFollowUp: SpecialisedNodes.Section|SpecialisedNodes.IfStatement;

        if (elseClause.followUp.kind === SemanticKind.IfStatement)
        {
            specialisedFollowUp = this.specialiseIfStatement(elseClause.followUp);
        }
        else
        {
            specialisedFollowUp = this.specialiseSection(elseClause.followUp);
        }

        return new SpecialisedNodes.ElseClause(specialisedFollowUp);
    }

    private specialiseWhileStatement (whileStatement: SemanticNodes.WhileStatement): SpecialisedNodes.WhileStatement
    {
        const specialisedCondition = this.specialiseExpression(whileStatement.condition);
        const specialisedSection = this.specialiseSection(whileStatement.section);

        return new SpecialisedNodes.WhileStatement(specialisedCondition, specialisedSection);
    }

    private specialiseFreeStatement (freeStatement: SemanticNodes.FreeStatement): SpecialisedNodes.FreeStatement
    {
        const specialisedExpression = this.specialiseExpression(freeStatement.expression);

        return new SpecialisedNodes.FreeStatement(specialisedExpression);
    }

    private specialiseLocalVariableDeclaration (
        variableDeclaration: SemanticNodes.LocalVariableDeclaration
    ): SpecialisedNodes.LocalVariableDeclaration
    {
        const specialisedSymbol = this.specialiseVariableSymbol(variableDeclaration.symbol);
        this.currentLocalVariables.set(specialisedSymbol.namespace.qualifiedName, specialisedSymbol);

        const specialisedInitialiser = this.specialiseExpressionNullable(variableDeclaration.initialiser);

        return new SpecialisedNodes.LocalVariableDeclaration(specialisedSymbol, specialisedInitialiser);
    }

    private specialiseReturnStatement (returnStatement: SemanticNodes.ReturnStatement): SpecialisedNodes.ReturnStatement
    {
        const specialisedExpression = this.specialiseExpressionNullable(returnStatement.expression);

        return new SpecialisedNodes.ReturnStatement(specialisedExpression);
    }

    private specialiseExpressionNullable (expression: SemanticNodes.Expression|null): SpecialisedNodes.Expression|null
    {
        if (expression === null)
        {
            return null;
        }
        else
        {
            return this.specialiseExpression(expression);
        }
    }

    private specialiseExpression (expression: SemanticNodes.Expression): SpecialisedNodes.Expression
    {
        switch (expression.kind)
        {
            case SemanticKind.ArrayGetExpression:
                return this.specialiseArrayGetExpression(expression);
            case SemanticKind.ArrayInstantiationExpression:
                return this.specialiseArrayInstantiation(expression);
            case SemanticKind.ArraySetExpression:
                return this.specialiseArraySetExpression(expression);
            case SemanticKind.BinaryExpression:
                return this.specialiseBinaryExpression(expression);
            case SemanticKind.CallExpression:
                return this.specialiseCallExpression(expression);
            case SemanticKind.FieldExpression:
                return this.specialiseFieldExpression(expression);
            case SemanticKind.InstantiationExpression:
                return this.specialiseInstantiationExpression(expression);
            case SemanticKind.LiteralExpression:
                return this.specialiseLiteralExpression(expression);
            case SemanticKind.ModuleExpression:
                return this.specialiseModuleExpression(expression);
            case SemanticKind.UnaryExpression:
                return this.specialiseUnaryExpression(expression);
            case SemanticKind.VariableExpression:
                return this.specialiseVariableExpression(expression);
        }
    }

    private specialiseBinaryExpression (expression: SemanticNodes.BinaryExpression): SpecialisedNodes.BinaryExpression
    {
        const specialisedLeft = this.specialiseExpression(expression.leftOperand);
        const specialisedRight = this.specialiseExpression(expression.rightOperand);

        return new SpecialisedNodes.BinaryExpression(expression.operator, specialisedLeft, specialisedRight);
    }

    private specialiseArrayInstantiation (node: SemanticNodes.ArrayInstantiationExpression): SpecialisedNodes.ArrayInstantiationExpression
    {
        const specialisedType = this.specialiseType(node.type);
        const specialisedElementType = this.specialiseType(node.elementType);
        const specialisedSizeArgument = this.specialiseExpression(node.sizeArgument);

        if ((specialisedType === null) || (specialisedElementType === null))
        {
            throw new Error(`Specialiser error: Array instantiation has a null type.`);
        }

        return new SpecialisedNodes.ArrayInstantiationExpression(
            specialisedType,
            specialisedElementType,
            specialisedSizeArgument
        );
    }

    private specialiseArrayGetExpression (node: SemanticNodes.ArrayGetExpression): SpecialisedNodes.ArrayGetExpression
    {
        const specialisedType = this.specialiseType(node.type);
        const specialisedArrayExpression = this.specialiseExpression(node.array);
        const specialisedIndexExpression = this.specialiseExpression(node.index);

        if (specialisedType === null)
        {
            throw new Error(`Specialiser error: Array get expression has a null type.`);
        }

        return new SpecialisedNodes.ArrayGetExpression(
            specialisedType,
            specialisedArrayExpression,
            specialisedIndexExpression
        );
    }

    private specialiseArraySetExpression (node: SemanticNodes.ArraySetExpression): SpecialisedNodes.ArraySetExpression
    {
        const specialisedElementType = this.specialiseType(node.type);
        const specialisedArrayExpression = this.specialiseExpression(node.array);
        const specialisedIndexExpression = this.specialiseExpression(node.index);
        const specialisedValueExpression = this.specialiseExpression(node.value);

        if (specialisedElementType === null)
        {
            throw new Error(`Specialiser error: Array set expression has a null element type.`);
        }

        return new SpecialisedNodes.ArraySetExpression(
            specialisedElementType,
            specialisedArrayExpression,
            specialisedIndexExpression,
            specialisedValueExpression
        );
    }

    private specialiseCallExpression (expression: SemanticNodes.CallExpression): SpecialisedNodes.CallExpression
    {
        const specialisedArguments: SpecialisedNodes.Expression[] = [];
        for (const argument of expression.arguments)
        {
            specialisedArguments.push(this.specialiseExpression(argument));
        }

        const specialisedThisReference = this.specialiseExpressionNullable(expression.thisReference);

        // If this is a method call on a generic type, we need to look up the specialised function from the specialised module instead
        // of trying to specialise the generic function directly:
        const specialisedFunction = this.getSpecialisedFunctionForCall(
            expression.functionSymbol,
            specialisedThisReference
        );

        const specialisedReturnType = this.specialiseType(expression.type);
        if (specialisedReturnType === null)
        {
            throw new Error(`Specialiser error: Call expression return type is null.`);
        }

        return new SpecialisedNodes.CallExpression(
            specialisedFunction,
            specialisedArguments,
            specialisedThisReference,
            specialisedReturnType
        );
    }

    /**
     * Gets the specialised function symbol for a call expression.
     * We always look up the function from the specialised module (for methods) to ensure we use the same symbol object that was
     * created during function declaration specialisation.
     * This is important because the lowerers use symbol object identity.
     */
    private getSpecialisedFunctionForCall (
        functionSymbol: SemanticSymbols.Function,
        specialisedThisReference: SpecialisedNodes.Expression|null
    ): SpecialisedSymbols.Function
    {
        // If there is no this reference, or the function doesn't have one, it's not a method call.
        // For module-level functions, we should still check the cache to ensure object identity:
        if (specialisedThisReference === null || functionSymbol.thisReference === null)
        {
            if (this.functionSymbols.size !== 0)
            {
                const specialisedFunctionNamespace = this.specialiseSymbolNamespace(functionSymbol.namespace);
                const cachedFunction = this.functionSymbols.get(specialisedFunctionNamespace.qualifiedName);
                if (cachedFunction !== undefined)
                {
                    return cachedFunction;
                }
            }

            // If not found in the cache, we need to specialise it for the first time:
            return this.specialiseFunctionSymbol(functionSymbol);
        }

        const thisType = specialisedThisReference.type;

        const specialisedModuleQualifiedName = thisType.namespace.qualifiedName;
        const specialisedFile = this.qualifiedNameToSpecialisedFile.get(specialisedModuleQualifiedName);

        const specialisedFunctionNamespace = this.getNamespaceForSymbolWithTypeParameters(functionSymbol, thisType.parameters);

        if (specialisedFile === undefined)
        {
            if (this.functionSymbols.size !== 0)
            {
                const cachedFunction = this.functionSymbols.get(specialisedFunctionNamespace.qualifiedName);
                if (cachedFunction !== undefined)
                {
                    return cachedFunction;
                }
            }

            // If not found in the cache, we need to specialise it for the first time:
            return this.specialiseFunctionSymbol(functionSymbol);
        }

        const specialisedFunction = specialisedFile.module.functionNameToSymbol.get(specialisedFunctionNamespace.qualifiedName);

        if (specialisedFunction === undefined)
        {
            throw new Error(
                `Specialiser error: Function "${specialisedFunctionNamespace.qualifiedName}" not found in specialised module`
                + ` "${specialisedModuleQualifiedName}".`
            );
        }

        return specialisedFunction;
    }

    private specialiseFieldExpression (expression: SemanticNodes.FieldExpression): SpecialisedNodes.FieldExpression
    {
        const specialisedThisReference = this.specialiseExpression(expression.thisReference);

        // If this is a field access on a generic type, we need to look up the specialised field from the specialised module to ensure
        // we use the same symbol object that was created during field declaration specialisation:
        const specialisedField = this.getSpecialisedFieldForAccess(expression.field, specialisedThisReference);

        return new SpecialisedNodes.FieldExpression(specialisedField, specialisedThisReference);
    }

    /**
     * Gets the specialised field symbol for a field access expression.
     * We always look up the field from the specialised module to ensure we use the same
     * symbol object that was created during field declaration specialisation.
     * This is important because the IntermediateLowerer uses symbol object identity.
     */
    private getSpecialisedFieldForAccess (
        fieldSymbol: SemanticSymbols.Field,
        specialisedThisReference: SpecialisedNodes.Expression
    ): SpecialisedSymbols.Field
    {
        const thisType = specialisedThisReference.type;

        const specialisedModuleQualifiedName = thisType.namespace.qualifiedName;
        const specialisedFile = this.qualifiedNameToSpecialisedFile.get(specialisedModuleQualifiedName);

        if (specialisedFile === undefined)
        {
            if (this.fieldSymbols.size !== 0)
            {
                const specialisedFieldNamespace = this.getNamespaceForSymbolWithTypeParameters(fieldSymbol, thisType.parameters);

                const cachedField = this.fieldSymbols.get(specialisedFieldNamespace.qualifiedName);
                if (cachedField !== undefined)
                {
                    return cachedField;
                }
            }

            // If not found in the cache, we need to specialise it for the first time:
            return this.specialiseFieldSymbol(fieldSymbol);
        }

        const specialisedFieldNamespace = this.getNamespaceForSymbolWithTypeParameters(fieldSymbol, thisType.parameters);

        const specialisedField = specialisedFile.module.fieldNameToSymbol.get(specialisedFieldNamespace.qualifiedName);

        if (specialisedField === undefined)
        {
            throw new Error(
                `Specialiser error: Field "${specialisedFieldNamespace.qualifiedName}" not found in specialised module`
                + ` "${specialisedModuleQualifiedName}".`
            );
        }

        return specialisedField;
    }

    private specialiseInstantiationExpression (expression: SemanticNodes.InstantiationExpression): SpecialisedNodes.InstantiationExpression
    {
        const specialisedType = this.specialiseType(expression.type);
        if (specialisedType === null)
        {
            throw new Error(`Specialiser error: Instantiation expression type is null.`);
        }

        const specialisedArguments: SpecialisedNodes.Expression[] = [];
        for (const argument of expression.arguments)
        {
            specialisedArguments.push(this.specialiseExpression(argument));
        }

        return new SpecialisedNodes.InstantiationExpression(specialisedType, specialisedArguments);
    }

    private specialiseLiteralExpression (expression: SemanticNodes.LiteralExpression): SpecialisedNodes.LiteralExpression
    {
        const specialisedType = this.specialiseType(expression.type);
        if (specialisedType === null)
        {
            throw new Error(`Specialiser error: Literal expression type is null.`);
        }

        return new SpecialisedNodes.LiteralExpression(expression.value, specialisedType);
    }

    private specialiseModuleExpression (expression: SemanticNodes.ModuleExpression): SpecialisedNodes.ModuleExpression
    {
        const existingSpecialisedFile = this.qualifiedNameToSpecialisedFile.get(expression.module.namespace.qualifiedName);

        let specialisedModule: SpecialisedSymbols.Module;
        if (existingSpecialisedFile !== undefined)
        {
            specialisedModule = existingSpecialisedFile.module;
        }
        else
        {
            specialisedModule = this.specialiseModule(expression.module);
        }

        return new SpecialisedNodes.ModuleExpression(specialisedModule);
    }

    private specialiseUnaryExpression (expression: SemanticNodes.UnaryExpression): SpecialisedNodes.UnaryExpression
    {
        const specialisedOperand = this.specialiseExpression(expression.operand);

        return new SpecialisedNodes.UnaryExpression(expression.operator, specialisedOperand);
    }

    private specialiseVariableExpression (expression: SemanticNodes.VariableExpression): SpecialisedNodes.VariableExpression
    {
        let specialisedVariable: SpecialisedSymbols.Variable|SpecialisedSymbols.FunctionParameter;

        if (expression.variable.kind === SemanticSymbolKind.Variable)
        {
            specialisedVariable = this.lookupVariableSymbol(expression.variable);
        }
        else
        {
            specialisedVariable = this.getSpecialisedParameterForExpression(expression.variable);
        }

        return new SpecialisedNodes.VariableExpression(specialisedVariable);
    }

    /**
     * Looks up a variable symbol, checking local variables first, then global variables.
     * Returns the cached symbol if found, otherwise creates a new specialised symbol.
     */
    private lookupVariableSymbol (variable: SemanticSymbols.Variable): SpecialisedSymbols.Variable
    {
        const specialisedNamespace = this.specialiseSymbolNamespace(variable.namespace);

        // Local variable:
        const cachedVariable = this.currentLocalVariables.get(specialisedNamespace.qualifiedName);
        if (cachedVariable !== undefined)
        {
            return cachedVariable;
        }

        // Global variale:
        const cachedGlobalVariable = this.variableSymbols.get(specialisedNamespace.qualifiedName);
        if (cachedGlobalVariable !== undefined)
        {
            return cachedGlobalVariable;
        }

        // If nothing can be found, we need to specialise it the first time:
        return this.specialiseVariableSymbol(variable);
    }

    /**
     * Gets the specialised parameter symbol for a variable expression.
     * We need to find the parameter from the current function to ensure object identity.
     */
    private getSpecialisedParameterForExpression (
        parameter: SemanticSymbols.FunctionParameter
    ): SpecialisedSymbols.FunctionParameter
    {
        if (this.currentFunctionSymbol !== null)
        {
            const parameterNamespace = this.specialiseSymbolNamespace(parameter.namespace);

            // Check the parameters:
            for (const functionParameter of this.currentFunctionSymbol.parameters)
            {
                if (functionParameter.namespace.equals(parameterNamespace))
                {
                    return functionParameter;
                }
            }

            // Check the this reference:
            if (this.currentFunctionSymbol.thisReference !== null)
            {
                if (this.currentFunctionSymbol.thisReference.namespace.equals(parameterNamespace))
                {
                    return this.currentFunctionSymbol.thisReference;
                }
            }
        }

        // If nothing can be found, we need to specialise it the first time:
        return this.specialiseFunctionParameterSymbol(parameter);
    }
}
