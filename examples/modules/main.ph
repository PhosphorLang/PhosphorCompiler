module ModulesExample.Main;

import Standard.Io;
import ModulesExample.MyModule;

function main ()
{
    Io.writeLine('Hello from Main module!');

    let hello := MyModule.getHello();
    Io.writeLine(hello);

    MyModule.sayHello();
    MyModule.sayHello();
}
