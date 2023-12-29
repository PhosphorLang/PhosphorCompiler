module Comparison;

import Standard.Io;
import Standard.Conversion;

function main ()
{
    let a := 1;
    let b := 2;
    let c := 2;

    Io.writeLine(Conversion.intToString(a));
    Io.writeLine(Conversion.intToString(b));
    Io.writeLine(Conversion.intToString(c));

    if a = b
    {
        Io.writeLine('a = b');
    }
    else
    {
        Io.writeLine('not a = b');
    }

    if a < b
    {
        Io.writeLine('a < b');
    }
    else
    {
        Io.writeLine('not a < b');
    }

    if a > b
    {
        Io.writeLine('a > b');
    }
    else
    {
        Io.writeLine('not a > b');
    }


    if b < a
    {
        Io.writeLine('b < a');
    }
    else
    {
        Io.writeLine('not b < a');
    }

    if b > a
    {
        Io.writeLine('b > a');
    }
    else
    {
        Io.writeLine('not b > a');
    }


    if b = c
    {
        Io.writeLine('b = c');
    }
    else
    {
        Io.writeLine('not b = c');
    }

    if b < c
    {
        Io.writeLine('b < c');
    }
    else
    {
        Io.writeLine('not b < c');
    }

    if b > c
    {
        Io.writeLine('b > c');
    }
    else
    {
        Io.writeLine('not b > c');
    }

    if 'abc' = 'def'
    {
        Io.writeLine('abc = def');
    }
    else
    {
        Io.writeLine('not abc = def');
    }

    if 'abc' = 'abc'
    {
        Io.writeLine('abc = abc');
    }
    else
    {
        Io.writeLine('not abc = abc');
    }
}
