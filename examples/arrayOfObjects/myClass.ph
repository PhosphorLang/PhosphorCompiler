class ArrayOfObjectsExample.MyClass;

field variable index: Integer := 0;
field variable message: String := 'Message';

method setIndex (newIndex: Integer)
{
    index := newIndex;
}

method getIndex (): Integer
{
    return index;
}

method setMessage (newMessage: String)
{
    message := newMessage;
}

method getMessage (): String
{
    return message;
}
