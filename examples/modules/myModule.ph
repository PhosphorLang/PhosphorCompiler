module ModulesExample.MyModule;

import Standard.Io;

function getHello (): String
{
    return 'Hello got from MyModule!';
}

function sayHello ()
{
    Io.writeLine('Hello from inside MyModule!');
}
