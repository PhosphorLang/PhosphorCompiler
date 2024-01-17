import Standard.Io;

class ClassesExample.MyClass;

field variable currentHello: String := 'Hello from method!';

function sayHelloFromFunction ()
{
    Io.writeLine('Hello from function!');
}

method sayHelloFromMethod ()
{
    Io.writeLine(currentHello);
}

method setHelloField (value: String)
{
    currentHello := value;
}
