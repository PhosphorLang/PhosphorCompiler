import * as SemanticNodes from "./semanticNodes";
import * as SemanticSymbols from "./semanticSymbols";
import * as SyntaxNodes from "../parser/syntaxNodes";
import BuildInFunctions from "../definitions/buildInFunctions";
import BuildInOperators from "../definitions/buildInOperators";
import BuildInTypes from "../definitions/buildInTypes";
import CompilerError from "../errors/compilerError";
import FunctionParametersList from "../parser/functionParametersList";
import { SemanticNode } from "./semanticNodes";
import SyntaxKind from "../parser/syntaxKind";
import { SyntaxNode } from "../parser/syntaxNodes";

export default class Connector
{
    private fileName: string;
    /**
     * A list of functions, global to the file.
     * This is filled before the function bodies are connected, so every function can reference every other function,
     * regardless of their position.
     */
    private functions: Map<string, SemanticSymbols.Function>;
    /**
     * A list of variable lists, working as a stack.
     * While connecting the function bodies, at the beginning of each section a new list is pushed, at the end of the section it is removed.
     * With this we keep track of which variables are accessible at which point in the code.
     */
    private variables: Map<string, SemanticSymbols.Variable>[];

    private currentFunction: SemanticSymbols.Function|null;

    private get currentVariableStack (): Map<string, SemanticSymbols.Variable>
    {
        return this.variables[this.variables.length - 1];
    }

    constructor ()
    {
        this.fileName = '';
        this.functions = new Map<string, SemanticSymbols.Function>();
        this.variables = [];
        this.currentFunction = null;
    }

    public run (fileSyntaxNode: SyntaxNodes.File): SemanticNodes.File
    {
        this.fileName = '';
        this.functions.clear();
        this.variables = [];
        this.currentFunction = null;

        this.injectBuildInFunctions();

        const result = this.connectFile(fileSyntaxNode);

        return result;
    }

    private injectBuildInFunctions (): void
    {
        this.functions.set(BuildInFunctions.print.name, BuildInFunctions.print); // TODO: This is really ugly...
    }

    private connectFile (fileSyntaxNode: SyntaxNodes.File): SemanticNodes.File
    {
        this.fileName = fileSyntaxNode.fileName;

        const functionNodes: SemanticNodes.Function[] = [];

        // Function declarations:
        for (const functionDeclaration of fileSyntaxNode.functions)
        {
            const functionSymbol = this.connectFunctionDeclaration(functionDeclaration);

            this.functions.set(functionSymbol.name, functionSymbol);
        }

        // Function bodies:
        for (const functionDeclaration of fileSyntaxNode.functions)
        {
            const functionNode = this.connectFunction(functionDeclaration);

            functionNodes.push(functionNode);
        }

        return new SemanticNodes.File(fileSyntaxNode.fileName, functionNodes);
    }

    private connectFunctionDeclaration (functionDeclaration: SyntaxNodes.FunctionDeclaration): SemanticSymbols.Function
    {
        const name = functionDeclaration.identifier.content;
        const returnType = this.connectType(functionDeclaration.type) ?? BuildInTypes.noType;
        const parameters = this.connectParameters(functionDeclaration.parameters);

        return new SemanticSymbols.Function(name, returnType, parameters);
    }

    private connectType (typeClause: SyntaxNodes.TypeClause|null): SemanticSymbols.Type|null
    {
        if (typeClause === null)
        {
            return null;
        }
        else
        {
            const type = BuildInTypes.getTypeByName(typeClause.identifier.content);

            if (type === null)
            {
                throw new CompilerError(`Unknown type "${typeClause.identifier.content}"`, this.fileName, typeClause.identifier);
            }

            return type;
        }
    }

    private connectParameters (parameters: FunctionParametersList): SemanticSymbols.Parameter[]
    {
        const parameterSymbols: SemanticSymbols.Parameter[] = [];

        const names = new Set<string>();

        for (const parameter of parameters.parameters)
        {
            const name = parameter.identifier.content;

            if (names.has(name))
            {
                throw new CompilerError(`Duplicate parameter name "${name}`, this.fileName, parameter.identifier);
            }

            names.add(name);

            const type = this.connectType(parameter.type);

            if (type === null)
            {
                throw new CompilerError('Parameters must have a type clause given', this.fileName, parameter.identifier);
            }

            const parameterSymbol = new SemanticSymbols.Parameter(name, type);

            parameterSymbols.push(parameterSymbol);
        }

        return parameterSymbols;
    }

    private connectFunction (functionDeclaration: SyntaxNodes.FunctionDeclaration): SemanticNodes.Function
    {
        const symbol = this.functions.get(functionDeclaration.identifier.content) as SemanticSymbols.Function;
        // The function symbol must exist because we added it previously based on the same function declarations.

        this.currentFunction = symbol;

        const section = this.connectSection(functionDeclaration.body);

        this.currentFunction = null;

        return new SemanticNodes.Function(symbol, section);
    }

    private connectSection (sectionSyntaxNode: SyntaxNodes.Section): SemanticNodes.Section
    {
        const statementNodes: SemanticNode[] = [];

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, SemanticSymbols.Variable>();
        this.variables.push(variables);

        for (const statement of sectionSyntaxNode.statements)
        {
            const statementNode = this.connectStatement(statement);

            statementNodes.push(statementNode);
        }

        // Remove the list of variables from the variable stack:
        this.variables.pop();

        return new SemanticNodes.Section(statementNodes);
    }

    private connectStatement (statement: SyntaxNode): SemanticNode
    {
        switch (statement.kind)
        {
            case SyntaxKind.Section:
                return this.connectSection(statement as SyntaxNodes.Section);
            case SyntaxKind.VariableDeclaration:
                return this.connectVariableDeclaration(statement as SyntaxNodes.VariableDeclaration);
            case SyntaxKind.ReturnStatement:
                return this.connectReturnStatement(statement as SyntaxNodes.ReturnStatement);
            case SyntaxKind.Assignment:
                return this.connectAssignment(statement as SyntaxNodes.Assignment);
            default:
                return this.connectExpression(statement as SyntaxNodes.Expression);
        }
    }

    private connectVariableDeclaration (variableDeclaration: SyntaxNodes.VariableDeclaration): SemanticNodes.VariableDeclaration
    {
        const name = variableDeclaration.identifier.content;
        const initialisier = variableDeclaration.initialiser === null ? null : this.connectExpression(variableDeclaration.initialiser);
        let type = this.connectType(variableDeclaration.type);

        if (type === null)
        {
            if (initialisier === null)
            {
                throw new CompilerError(
                    `The variable "${name}" must either have a type clause or an initialiser`,
                    this.fileName,
                    variableDeclaration.identifier
                );
            }
            else
            {
                type = initialisier.type;
            }
        }

        const symbol = new SemanticSymbols.Variable(name, type, false);

        if (this.currentVariableStack.has(name))
        {
            throw new CompilerError(`Duplicate declaration of variable "${name}`, this.fileName, variableDeclaration.identifier);
        }

        this.currentVariableStack.set(name, symbol);

        return new SemanticNodes.VariableDeclaration(symbol, initialisier);
    }

    private connectReturnStatement (returnStatement: SyntaxNodes.ReturnStatement): SemanticNodes.ReturnStatement
    {
        if (this.currentFunction === null)
        {
            throw new CompilerError('Found return statement in non-function environment', this.fileName, returnStatement.keyword);
        }

        let expression: SemanticNodes.Expression|null = null;

        if (returnStatement.expression !== null)
        {
            expression = this.connectExpression(returnStatement.expression);
        }

        if (this.currentFunction.returnType == BuildInTypes.noType)
        {
            if (expression !== null)
            {
                throw new CompilerError('A function without a return type must return nothing.', this.fileName, returnStatement.keyword);
            }
        }
        else
        {
            if (expression === null)
            {
                throw new CompilerError('A function with a return type must not return nothing.', this.fileName, returnStatement.keyword);
            }
            else if (expression.type != this.currentFunction.returnType)
            {
                throw new CompilerError('The return type does not match the function type.', this.fileName, returnStatement.keyword);
            }
        }

        return new SemanticNodes.ReturnStatement(expression);
    }

    private connectAssignment (assignment: SyntaxNodes.Assignment): SemanticNodes.Assignment
    {
        const name = assignment.identifier.content;

        const variable = this.currentVariableStack.get(name);

        if (variable === undefined)
        {
            throw new CompilerError(`Unknown variable "${name}"`, this.fileName, assignment.identifier);
        }

        if (variable.isReadonly)
        {
            throw new CompilerError(`"${name}" is readonly, an assignment is not allowed`, this.fileName, assignment.identifier);
        }

        const expression = this.connectExpression(assignment.expression);

        return new SemanticNodes.Assignment(variable, expression);
    }

    private connectExpression (expression: SyntaxNodes.Expression): SemanticNodes.Expression
    {
        switch (expression.kind)
        {
            case SyntaxKind.LiteralExpression:
                return this.connectLiteralExpression(expression as SyntaxNodes.LiteralExpression);
            case SyntaxKind.VariableExpression:
                return this.connectVariableExpression(expression as SyntaxNodes.VariableExpression);
            case SyntaxKind.CallExpression:
                return this.connectCallExpression(expression as SyntaxNodes.CallExpression);
            case SyntaxKind.ParenthesizedExpression:
                return this.connectParenthesizedExpression(expression as SyntaxNodes.ParenthesizedExpression);
            case SyntaxKind.UnaryExpression:
                return this.connectUnaryExpression(expression as SyntaxNodes.UnaryExpression);
            case SyntaxKind.BinaryExpression:
                return this.connectBinaryExpression(expression as SyntaxNodes.BinaryExpression);
            default:
                throw new Error(`Unexpected syntax of kind "${expression.kind}".`);
        }
    }

    private connectLiteralExpression (expression: SyntaxNodes.LiteralExpression): SemanticNodes.LiteralExpression
    {
        const value = expression.literal.content;
        const type = BuildInTypes.getTypeByTokenKind(expression.literal.kind);

        if (type === null)
        {
            throw new Error (`Unexpected type of literal token "${expression.kind}".`);
        }

        return new SemanticNodes.LiteralExpression(value, type);
    }

    private connectVariableExpression (expression: SyntaxNodes.VariableExpression): SemanticNodes.VariableExpression
    {
        const name = expression.identifier.content;

        const variable = this.currentVariableStack.get(name);

        if (variable === undefined)
        {
            throw new CompilerError(`Unknown variable "${name}"`, this.fileName, expression.identifier);
        }

        return new SemanticNodes.VariableExpression(variable);
    }

    private connectCallExpression (expression: SyntaxNodes.CallExpression): SemanticNodes.CallExpression
    {
        const functionSymbol = this.functions.get(expression.identifier.content);

        if (functionSymbol === undefined)
        {
            throw new CompilerError(`Unknown function "${expression.identifier.content}"`, this.fileName, expression.identifier);
        }

        const callArguments: SemanticNodes.Expression[] = [];

        for (const argumentExpression of expression.arguments.expressions)
        {
            const callArgument = this.connectExpression(argumentExpression);
            callArguments.push(callArgument);
        }

        if (functionSymbol.parameters.length !== callArguments.length)
        {
            throw new CompilerError(
                `Wrong argument count for function "${expression.identifier.content}"`,
                this.fileName,
                expression.identifier
            );
        }

        for (let i = 0; i < callArguments.length; i++)
        {
            if (callArguments[i].type !== functionSymbol.parameters[i].type)
            {
                throw new CompilerError(
                    `Wrong type for argument "${functionSymbol.parameters[i].name}".`,
                    this.fileName,
                    expression.identifier
                );
            }
        }

        return new SemanticNodes.CallExpression(functionSymbol, callArguments);
    }

    private connectParenthesizedExpression (expression: SyntaxNodes.ParenthesizedExpression): SemanticNodes.Expression
    {
        return this.connectExpression(expression.expression);
    }

    private connectUnaryExpression (expression: SyntaxNodes.UnaryExpression): SemanticNodes.UnaryExpression
    {
        const operand = this.connectExpression(expression.operand);

        const operator = BuildInOperators.getUnaryOperator(expression.operator.kind, operand.type);

        if (operator === null)
        {
            throw new CompilerError(`Unknown unary operator "${expression.operator.content}"`, this.fileName, expression.operator);
        }

        return new SemanticNodes.UnaryExpression(operator, operand);
    }

    private connectBinaryExpression (expression: SyntaxNodes.BinaryExpression): SemanticNodes.BinaryExpression
    {
        const leftOperand = this.connectExpression(expression.leftSide);
        const rightOperand = this.connectExpression(expression.rightSide);

        const operator = BuildInOperators.getBinaryOperator(expression.operator.kind, leftOperand.type, rightOperand.type);

        if (operator === null)
        {
            throw new CompilerError(`Unknown binary operator "${expression.operator.content}"`, this.fileName, expression.operator);
        }

        return new SemanticNodes.BinaryExpression(operator, leftOperand, rightOperand);
    }
}
