module FunctionCall;

import Standard.Io;

function main ()
{
    print();
}

// This includes testing that the order of the functions does not matter ("main" can call "print" even if it is defined later):
function print ()
{
    Io.writeLine('Print called.');
}
