import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import * as SpecialisedNodes from './specialisedNodes';
import * as SpecialisedSymbols from '../specialiser/specialisedSymbols';
import { Namespace } from '../parser/namespace';
import { Specialiser } from './specialiser';

export class SpecialisedTreeCollector
{
    private qualifiedNameToSemanticTree: Map<string, SemanticNodes.File>;
    private specialiser: Specialiser;

    private qualifiedNameToSpecialisedTree: Map<string, SpecialisedNodes.File>;

    constructor (qualifiedNameToSemanticTree: Map<string, SemanticNodes.File>, specialiser: Specialiser)
    {
        this.qualifiedNameToSemanticTree = qualifiedNameToSemanticTree;
        this.specialiser = specialiser;

        this.qualifiedNameToSpecialisedTree = new Map();
    }

    public get (genericType: SemanticSymbols.GenericType, parameters: SemanticSymbols.ConcreteType[]): SpecialisedSymbols.ConcreteType
    {
        const parameterNamespaces = new Array<Namespace>(parameters.length);
        const concreteNamespace = Namespace.constructFromNamespace(genericType.namespace, parameterNamespaces);

        let specialisedTree = this.qualifiedNameToSpecialisedTree.get(concreteNamespace.qualifiedName);

        if (specialisedTree == undefined)
        {
            const semanticTree = this.qualifiedNameToSemanticTree.get(genericType.namespace.qualifiedName);

            if (semanticTree == undefined)
            {
                throw new Error(`The generic type "${genericType.namespace.qualifiedName}" does not exist.`);
            }

            specialisedTree = this.specialiser.run(semanticTree, parameters);

            this.qualifiedNameToSpecialisedTree.set(concreteNamespace.qualifiedName, specialisedTree);
        }

        if (specialisedTree.module.classType == null)
        {
            // TODO: Should this be a diagnostic? Can this even happen at this stage (or would it already be handled by the Connector)?
            throw new Error(`The module "${concreteNamespace.qualifiedName}" is not a class and thus cannot be used as a type.`);
        }

        return specialisedTree.module.classType;
    }
}
