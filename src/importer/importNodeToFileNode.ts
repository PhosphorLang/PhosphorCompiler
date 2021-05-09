import * as SyntaxNodes from "../parser/syntaxNodes";

export default class ImportNodeToFileNode extends Map<SyntaxNodes.Import, SyntaxNodes.File> {}
