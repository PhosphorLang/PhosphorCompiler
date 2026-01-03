module GenericsExample.Main;

import Standard.Conversion;
import Standard.Io;
import GenericsExample.Container;

function main ()
{
    let container := new Container[Integer]();
    container.set(42);

    let content := container.get();

    Io.writeLine(Conversion.intToString(content));
}
