module IfElse;

import Standard.Io;

function main ()
{
    if 2 = 2
    {
        Io.writeLine('Hello!');
    }

    if 4 = 3
    {
        Io.writeLine('They are the same!');
    }
    else
    {
        Io.writeLine('They are not the same!');
    }

    if false
    {
        Io.writeLine('This will never happen.');
    }
    else if true
    {
        Io.writeLine('This will happen!');
    }
    else
    {
        Io.writeLine('This will also never happen.');
    }
}
