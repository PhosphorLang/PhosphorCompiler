import { Token } from '../lexer/token';

/**
 * A namespace represents the parts of a full qualified name.
 *
 * A full example looks like this: \
 * `Company.Department:Project.Path.Class[My.First.Type,My.Second.Type]~Method.Variable` \
 * Where: \
 * `Company.Department` is the prefix, \
 * `Project.Path` is the module path, \
 * `Class` is the module/class name, \
 * `My.First.Type` and `My.Second.Type` are the generic type parameters which are namespaces themselves, \
 * `Method` is the member path, \
 * `Variable` is the member name.
 */
export class Namespace
{
    // TODO: If this class was generic, it could have its members be only nullable if it was constructed with a null value.

    /**
     * The prefix component of the namespace, e.g. `Company.Department` in `Company.Department:Project.Path.Module~Method.Variable`. \
     * Is `null` if there is no prefix.
     */
    public readonly prefix: string|null;
    /**
     * The module path component of the namespace, e.g. `Project.Path` in `Company.Department:Project.Path.Module~Method.Variable`. \
     * Is `null` if there is no module path.
     */
    public readonly modulePath: string|null;
    /** The module name component of the namespace, e.g. `Module` in `Company.Department:Project.Path.Module~Method.Variable`. */
    public readonly moduleName: string;
    /** The generic type parameters component of the namespace, e.g. `A` and `B` in `Project.Path.Class[A,B]~Method.Variable`. */
    public readonly genericTypeParameters: Namespace[] = [];
    /**
     * The member path component of the namespace, e.g. `Method` in `Company.Department:Project.Path.Module~Method.Variable`. \
     * Is `null` if there is no member path (i.e. the namespace belongs to a module or a function).
     */
    public readonly memberPath: string|null;
    /**
     * The member name component of the namespace, e.g. `Variable` in `Company.Department:Project.Path.Module~Method.Variable`.
     * Is `null` if there is no member name (i.e. the namespace belongs to a module).
     */
    public readonly memberName: string|null;

    /** The base (local) name of the namespace, i.e. the {@link memberName} if it is not `null`, otherwise the {@link moduleName}. */
    public readonly baseName: string;
    /**
     * The qualified name is the entire namespace, e.g. all of
     * `Company.Department:Project.Path.Class[A,B]~Method.Variable`.
     */
    public readonly qualifiedName: string;

    private constructor (
        prefix: string|null,
        modulePath: string|null,
        moduleName: string,
        genericTypeParameters: Namespace[],
        memberPath: null,
        memberName: null
    );
    private constructor (
        prefix: string|null,
        modulePath: string|null,
        moduleName: string,
        genericTypeParameters: Namespace[],
        memberPath: null,
        memberName: string
    );
    private constructor (
        prefix: string|null,
        modulePath: string|null,
        moduleName: string,
        genericTypeParameters: Namespace[],
        memberPath: string,
        memberName: string
    );
    private constructor (
        prefix: string|null,
        modulePath: string|null,
        moduleName: string,
        genericTypeParameters: Namespace[] = [],
        memberPath: string|null = null,
        memberName: string|null = null
    ) {
        this.prefix = prefix;
        this.modulePath = modulePath;
        this.moduleName = moduleName;
        this.genericTypeParameters = genericTypeParameters;
        this.memberPath = memberPath;
        this.memberName = memberName;

        if (memberName !== null)
        {
            this.baseName = memberName;
        }
        else
        {
            this.baseName = moduleName;
        }

        // TODO: It could be better to not have the seperators hardcoded here.

        let qualifiedName = '';

        if (prefix !== null)
        {
            qualifiedName += prefix + ':';
        }

        if (modulePath !== null)
        {
            qualifiedName += modulePath + '.';
        }

        qualifiedName += moduleName;

        if (genericTypeParameters.length > 0)
        {
            qualifiedName += '[' + Namespace.joinNamespaceArray(genericTypeParameters) + ']';
        }

        if (memberName !== null)
        {
            qualifiedName += '~';

            if (memberPath !== null)
            {
                qualifiedName += memberPath + '.';
            }

            qualifiedName += memberName;
        }

        this.qualifiedName = qualifiedName;
    }

    // TODO: Allow defining the generic type parameters in the constructor.
    public static constructFromStrings (modulePath: string|null, moduleName: string): Namespace;
    public static constructFromStrings (modulePath: string|null, moduleName: string, memberName: string): Namespace;
    public static constructFromStrings (modulePath: string|null, moduleName: string, memberPath: string, memberName: string): Namespace;
    public static constructFromStrings (
        modulePath: string|null,
        moduleName: string,
        memberPathOrName?: string,
        memberName?: string
    ): Namespace
    {
        if (memberPathOrName === undefined)
        {
            return new Namespace(null, modulePath, moduleName, [], null, null);
        }
        else if (memberName === undefined)
        {
            return new Namespace(null, modulePath, moduleName, [], null, memberPathOrName);
        }
        else
        {
            return new Namespace(null, modulePath, moduleName, [], memberPathOrName, memberName);
        }
    }

    public static constructFromTokens (prefixComponents: Token[], pathComponents: Token[], nameToken: Token): Namespace
    {
        const joinedPrefix = this.joinTokenArray(prefixComponents);
        const joinedPath = this.joinTokenArray(pathComponents);
        const name = nameToken.content;

        const prefix = joinedPrefix.length > 0 ? joinedPrefix : null;
        const path = joinedPath.length > 0 ? joinedPath : null;

        return new Namespace(prefix, path, name, [], null, null);
    }

    public static constructFromNamespace (namespace: Namespace, genericTypeParameters: Namespace[]): Namespace;
    public static constructFromNamespace (namespace: Namespace, memberName: string): Namespace;
    public static constructFromNamespace (namespace: Namespace, memberPath: string, memberName: string): Namespace;
    public static constructFromNamespace (
        namespace: Namespace,
        memberPathOrNameOrParameters: string|Namespace[],
        memberName?: string
    ): Namespace
    {
        if (memberName === undefined)
        {
            if (typeof memberPathOrNameOrParameters === 'string')
            {
                return new Namespace(namespace.prefix, namespace.modulePath, namespace.moduleName, [], null, memberPathOrNameOrParameters);
            }
            else
            {
                throw new Error('The member name must be provided if the member path is provided.');
            }
        }
        else
        {
            if (typeof memberPathOrNameOrParameters === 'string')
            {
                return new Namespace(
                    namespace.prefix,
                    namespace.modulePath,
                    namespace.moduleName,
                    [],
                    memberPathOrNameOrParameters,
                    memberName
                );
            }
            else
            {
                if ((namespace.memberPath !== null) && (namespace.memberName !== null))
                {
                    return new Namespace(
                        namespace.prefix,
                        namespace.modulePath,
                        namespace.moduleName,
                        memberPathOrNameOrParameters,
                        namespace.memberPath,
                        namespace.memberName
                    );
                }
                else
                {
                    return new Namespace(
                        namespace.prefix,
                        namespace.modulePath,
                        namespace.moduleName,
                        memberPathOrNameOrParameters,
                        null,
                        null
                    );
                }
            }
        }
    }

    private static joinTokenArray (tokens: Token[]): string
    {
        // TODO: It could be better to not have the seperator hardcoded here.

        const result = new Array<string>(tokens.length);

        for (let i = 0; i < tokens.length; i++)
        {
            result[i] = tokens[i].content;
        }

        return result.join('.');
    }

    private static joinNamespaceArray (namespaces: Namespace[]): string
    {
        const result = new Array<string>(namespaces.length);

        for (let i = 0; i < namespaces.length; i++)
        {
            result[i] = namespaces[i].qualifiedName;
        }

        return result.join(',');
    }
}
