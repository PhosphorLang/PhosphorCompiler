import Standard.Io;

module ModulesExample.MyModule;

function getHello (): String
{
    return 'Hello got from MyModule!';
}

function sayHello ()
{
    Io.writeLine('Hello from inside MyModule!');
}
