import * as SyntaxNodes from '../parser/syntaxNodes';

export class ImportNodeToFileNode extends Map<SyntaxNodes.Import, SyntaxNodes.File> {}
