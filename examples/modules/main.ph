module ModulesExample.Main;

import Standard.Io;
import ModulesExample.MyModule;

function main ()
{
    Io.writeLine('Hello from Main module!');

    var hello := MyModule.getHello();
    Io.writeLine(hello);

    MyModule.sayHello();
}
