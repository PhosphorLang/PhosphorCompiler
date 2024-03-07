import Standard.Conversion;
import Standard.Io;

module ModulesExample.MyModule;

constant helloFromModule: String := 'Hello got from MyModule!';
variable sayHelloCounter: Integer := 0;

function getHello (): String
{
    return helloFromModule;
}

function sayHello ()
{
    sayHelloCounter := sayHelloCounter + 1;
    let helloCountString := Conversion.intToString(sayHelloCounter);

    Io.writeLine('Hello from inside MyModule! This was hello number:');
    Io.writeLine(helloCountString);
}
