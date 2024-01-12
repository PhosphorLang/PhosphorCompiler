import { Token } from '../lexer/token';

/**
 * A namespace represents the parts of a full qualified name.
 *
 * A full example looks like this: \
 * `Company.Department:Project.Path.Module~Method.Variable` \
 * Where: \
 * `Company.Department` is the prefix \
 * `Project.Path` is the module path \
 * `Module` is the module name \
 * `Method` is the member path \
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
    /** The qualified name is the entire namespace, e.g. all of `Company.Department:Project.Path.Module~Method.Variable`. */
    public readonly qualifiedName: string;

    private constructor (prefix: string|null, modulePath: string|null, moduleName: string, memberPath: null, memberName: null);
    private constructor (prefix: string|null, modulePath: string|null, moduleName: string, memberPath: null, memberName: string);
    private constructor (prefix: string|null, modulePath: string|null, moduleName: string, memberPath: string, memberName: string);
    private constructor (
        prefix: string|null,
        modulePath: string|null,
        moduleName: string,
        memberPath: string|null,
        memberName: string|null
    ) {
        this.prefix = prefix;
        this.modulePath = modulePath;
        this.moduleName = moduleName;
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
            return new Namespace(null, modulePath, moduleName, null, null);
        }
        else if (memberName === undefined)
        {
            return new Namespace(null, modulePath, moduleName, null, memberPathOrName);
        }
        else
        {
            return new Namespace(null, modulePath, moduleName, memberPathOrName, memberName);
        }
    }

    public static constructFromTokens (prefixComponents: Token[], pathComponents: Token[], nameToken: Token): Namespace
    {
        const joinedPrefix = this.joinTokenArray(prefixComponents);
        const joinedPath = this.joinTokenArray(pathComponents);
        const name = nameToken.content;

        const prefix = joinedPrefix.length > 0 ? joinedPrefix : null;
        const path = joinedPath.length > 0 ? joinedPath : null;

        return new Namespace(prefix, path, name, null, null);
    }

    public static constructFromNamespace (namespace: Namespace, memberName: string): Namespace;
    public static constructFromNamespace (namespace: Namespace, memberPath: string, memberName: string): Namespace;
    public static constructFromNamespace (namespace: Namespace, memberPathOrName: string, memberName?: string): Namespace
    {
        if (memberName === undefined)
        {
            return new Namespace(namespace.prefix, namespace.modulePath, namespace.moduleName, null, memberPathOrName);
        }
        else
        {
            return new Namespace(namespace.prefix, namespace.modulePath, namespace.moduleName, memberPathOrName, memberName);
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
}
