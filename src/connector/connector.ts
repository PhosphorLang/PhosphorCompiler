import AssignmentSemanticNode from "./semanticNodes/assignmentSemanticNode";
import AssignmentSyntaxNode from "../parser/syntaxNodes/assignmentSyntaxNode";
import BinaryExpressionSemanticNode from "./semanticNodes/binaryExpressionSemanticNode";
import BinaryExpressionSyntaxNode from "../parser/syntaxNodes/binaryExpressionSyntaxNode";
import BuildInFunctions from "../definitions/buildInFunctions";
import BuildInOperators from "../definitions/buildInOperators";
import BuildInTypes from "../definitions/buildInTypes";
import CallExpressionSemanticNode from "./semanticNodes/callExpressionSemanticNode";
import CallExpressionSyntaxNode from "../parser/syntaxNodes/callExpressionSyntaxNode";
import CompilerError from "../errors/compilerError";
import ExpressionSemanticNode from "./semanticNodes/expressionSemanticNode";
import ExpressionSyntaxNode from "../parser/syntaxNodes/expressionSyntaxNode";
import FileSemanticNode from "./semanticNodes/fileSemanticNode";
import FileSyntaxNode from "../parser/syntaxNodes/fileSyntaxNode";
import FunctionDeclarationSyntaxNode from "../parser/syntaxNodes/functionDeclarationSyntaxNode";
import FunctionParametersList from "../parser/functionParametersList";
import FunctionSemanticNode from "./semanticNodes/functionSemanticNode";
import FunctionSemanticSymbol from "./semanticSymbols/functionSemanticSymbol";
import LiteralExpressionSemanticNode from "./semanticNodes/literalExpressionSemanticNode";
import LiteralExpressionSyntaxNode from "../parser/syntaxNodes/literalExpressionSyntaxNode";
import ParameterSemanticSymbol from "./semanticSymbols/parameterSemanticSymbol";
import ParenthesizedExpressionSyntaxNode from "../parser/syntaxNodes/parenthesizedExpressionSyntaxNode";
import ReturnStatementSemanticNode from "./semanticNodes/returnStatementSemanticNode";
import ReturnStatementSyntaxNode from "../parser/syntaxNodes/returnStatementSyntaxNode";
import SectionSemanticNode from "./semanticNodes/sectionSemanticNode";
import SectionSyntaxNode from "../parser/syntaxNodes/sectionSyntaxNode";
import SemanticNode from "./semanticNodes/semanticNode";
import SyntaxKind from "../parser/syntaxKind";
import SyntaxNode from "../parser/syntaxNodes/syntaxNode";
import TypeClauseSyntaxNode from "../parser/syntaxNodes/typeClauseSyntaxNode";
import TypeSemanticSymbol from "./semanticSymbols/typeSemanticSymbol";
import UnaryExpressionSemanticNode from "./semanticNodes/unaryExpressionSemanticNode";
import UnaryExpressionSyntaxNode from "../parser/syntaxNodes/unaryExpressionSyntaxNode";
import VariableDeclarationSemanticNode from "./semanticNodes/variableDeclarationSemanticNode";
import VariableDeclarationSyntaxNode from "../parser/syntaxNodes/variableDeclarationSyntaxNode";
import VariableExpressionSemanticNode from "./semanticNodes/variableExpressionSemanticNode";
import VariableExpressionSyntaxNode from "../parser/syntaxNodes/variableExpressionSyntaxNode";
import VariableSemanticSymbol from "./semanticSymbols/variableSemanticSymbol";

export default class Connector
{
    private fileName: string;
    /**
     * A list of functions, global to the file.
     * This is filled before the function bodies are connected, so every function can reference every other function,
     * regardless of their position.
     */
    private functions: Map<string, FunctionSemanticSymbol>;
    /**
     * A list of variable lists, working as a stack.
     * While connecting the function bodies, at the beginning of each section a new list is pushed, at the end of the section it is removed.
     * With this we keep track of which variables are accessible at which point in the code.
     */
    private variables: Map<string, VariableSemanticSymbol>[];

    private currentFunction: FunctionSemanticSymbol|null;

    private get currentVariableStack (): Map<string, VariableSemanticSymbol>
    {
        return this.variables[this.variables.length - 1];
    }

    constructor ()
    {
        this.fileName = '';
        this.functions = new Map<string, FunctionSemanticSymbol>();
        this.variables = [];
        this.currentFunction = null;
    }

    public run (fileSyntaxNode: FileSyntaxNode): SemanticNode
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

    private connectFile (fileSyntaxNode: FileSyntaxNode): FileSemanticNode
    {
        this.fileName = fileSyntaxNode.fileName;

        const functionNodes: FunctionSemanticNode[] = [];

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

        return new FileSemanticNode(fileSyntaxNode.fileName, functionNodes);
    }

    private connectFunctionDeclaration (functionDeclaration: FunctionDeclarationSyntaxNode): FunctionSemanticSymbol
    {
        const name = functionDeclaration.identifier.content;
        const returnType = this.connectType(functionDeclaration.type) ?? BuildInTypes.noType;
        const parameters = this.connectParameters(functionDeclaration.parameters);

        return new FunctionSemanticSymbol(name, returnType, parameters);
    }

    private connectType (typeClause: TypeClauseSyntaxNode|null): TypeSemanticSymbol|null
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

    private connectParameters (parameters: FunctionParametersList): ParameterSemanticSymbol[]
    {
        const parameterSymbols: ParameterSemanticSymbol[] = [];

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

            const parameterSymbol = new ParameterSemanticSymbol(name, type);

            parameterSymbols.push(parameterSymbol);
        }

        return parameterSymbols;
    }

    private connectFunction (functionDeclaration: FunctionDeclarationSyntaxNode): FunctionSemanticNode
    {
        const symbol = this.functions.get(functionDeclaration.identifier.content) as FunctionSemanticSymbol;
        // The function symbol must exist because we added it previously based on the same function declarations.

        this.currentFunction = symbol;

        const section = this.connectSection(functionDeclaration.body);

        this.currentFunction = null;

        return new FunctionSemanticNode(symbol, section);
    }

    private connectSection (sectionSyntaxNode: SectionSyntaxNode): SectionSemanticNode
    {
        const statementNodes: SemanticNode[] = [];

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, VariableSemanticSymbol>();
        this.variables.push(variables);

        for (const statement of sectionSyntaxNode.statements)
        {
            const statementNode = this.connectStatement(statement);

            statementNodes.push(statementNode);
        }

        // Remove the list of variables from the variable stack:
        this.variables.pop();

        return new SectionSemanticNode(statementNodes);
    }

    private connectStatement (statement: SyntaxNode): SemanticNode
    {
        switch (statement.kind)
        {
            case SyntaxKind.Section:
                return this.connectSection(statement as SectionSyntaxNode);
            case SyntaxKind.VariableDeclaration:
                return this.connectVariableDeclaration(statement as VariableDeclarationSyntaxNode);
            case SyntaxKind.ReturnStatement:
                return this.connectReturnStatement(statement as ReturnStatementSyntaxNode);
            case SyntaxKind.Assignment:
                return this.connectAssignment(statement as AssignmentSyntaxNode);
            default:
                return this.connectExpression(statement as ExpressionSyntaxNode);
        }
    }

    private connectVariableDeclaration (variableDeclaration: VariableDeclarationSyntaxNode): VariableDeclarationSemanticNode
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

        const symbol = new VariableSemanticSymbol(name, type, false);

        if (this.currentVariableStack.has(name))
        {
            throw new CompilerError(`Duplicate declaration of variable "${name}`, this.fileName, variableDeclaration.identifier);
        }

        this.currentVariableStack.set(name, symbol);

        return new VariableDeclarationSemanticNode(symbol, initialisier);
    }

    private connectReturnStatement (returnStatement: ReturnStatementSyntaxNode): ReturnStatementSemanticNode
    {
        if (this.currentFunction === null)
        {
            throw new CompilerError('Found return statement in non-function environment', this.fileName, returnStatement.keyword);
        }

        let expression: ExpressionSemanticNode|null = null;

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

        return new ReturnStatementSemanticNode(expression);
    }

    private connectAssignment (assignment: AssignmentSyntaxNode): AssignmentSemanticNode
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

        return new AssignmentSemanticNode(variable, expression);
    }

    private connectExpression (expression: ExpressionSyntaxNode): ExpressionSemanticNode
    {
        switch (expression.kind)
        {
            case SyntaxKind.LiteralExpression:
                return this.connectLiteralExpression(expression as LiteralExpressionSyntaxNode);
            case SyntaxKind.VariableExpression:
                return this.connectVariableExpression(expression as VariableExpressionSyntaxNode);
            case SyntaxKind.CallExpression:
                return this.connectCallExpression(expression as CallExpressionSyntaxNode);
            case SyntaxKind.ParenthesizedExpression:
                return this.connectParenthesizedExpression(expression as ParenthesizedExpressionSyntaxNode);
            case SyntaxKind.UnaryExpression:
                return this.connectUnaryExpression(expression as UnaryExpressionSyntaxNode);
            case SyntaxKind.BinaryExpression:
                return this.connectBinaryExpression(expression as BinaryExpressionSyntaxNode);
            default:
                throw new Error(`Unexpected syntax of kind "${expression.kind}".`);
        }
    }

    private connectLiteralExpression (expression: LiteralExpressionSyntaxNode): LiteralExpressionSemanticNode
    {
        const value = expression.literal.content;
        const type = BuildInTypes.getTypeByTokenKind(expression.literal.kind);

        if (type === null)
        {
            throw new Error (`Unexpected type of literal token "${expression.kind}".`);
        }

        return new LiteralExpressionSemanticNode(value, type);
    }

    private connectVariableExpression (expression: VariableExpressionSyntaxNode): VariableExpressionSemanticNode
    {
        const name = expression.identifier.content;

        const variable = this.currentVariableStack.get(name);

        if (variable === undefined)
        {
            throw new CompilerError(`Unknown variable "${name}"`, this.fileName, expression.identifier);
        }

        return new VariableExpressionSemanticNode(variable);
    }

    private connectCallExpression (expression: CallExpressionSyntaxNode): CallExpressionSemanticNode
    {
        const functionSymbol = this.functions.get(expression.identifier.content);

        if (functionSymbol === undefined)
        {
            throw new CompilerError(`Unknown function "${expression.identifier.content}"`, this.fileName, expression.identifier);
        }

        const callArguments: ExpressionSemanticNode[] = [];

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

        return new CallExpressionSemanticNode(functionSymbol, callArguments);
    }

    private connectParenthesizedExpression (expression: ParenthesizedExpressionSyntaxNode): ExpressionSemanticNode
    {
        return this.connectExpression(expression.expression);
    }

    private connectUnaryExpression (expression: UnaryExpressionSyntaxNode): UnaryExpressionSemanticNode
    {
        const operand = this.connectExpression(expression.operand);

        const operator = BuildInOperators.getUnaryOperator(expression.operator.kind, operand.type);

        if (operator === null)
        {
            throw new CompilerError(`Unknown unary operator "${expression.operator.content}"`, this.fileName, expression.operator);
        }

        return new UnaryExpressionSemanticNode(operator, operand);
    }

    private connectBinaryExpression (expression: BinaryExpressionSyntaxNode): BinaryExpressionSemanticNode
    {
        const leftOperand = this.connectExpression(expression.leftSide);
        const rightOperand = this.connectExpression(expression.rightSide);

        const operator = BuildInOperators.getBinaryOperator(expression.operator.kind, leftOperand.type, rightOperand.type);

        if (operator === null)
        {
            throw new CompilerError(`Unknown binary operator "${expression.operator.content}"`, this.fileName, expression.operator);
        }

        return new BinaryExpressionSemanticNode(operator, leftOperand, rightOperand);
    }
}
