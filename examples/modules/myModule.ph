import Standard.Io;

module ModulesExample.MyModule;

variable helloFromModule := 'Hello got from MyModule!';

function getHello (): String
{
    return helloFromModule;
}

function sayHello ()
{
    Io.writeLine('Hello from inside MyModule!');
}
