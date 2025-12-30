class GenericsExample.Container;
generics ContentType;

field variable content: ContentType;

method set (newContent: ContentType)
{
    content := newContent;
}

method get (): ContentType
{
    return content;
}
