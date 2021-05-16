import 'io';
import 'string';

function main ()
{
    var a := 1;
    var b := 2;
    var c := 2;

    writeLine(intToString(a));
    writeLine(intToString(b));
    writeLine(intToString(c));

    if a = b
    {
        writeLine('a = b');
    }
    else
    {
        writeLine('not a = b');
    }

    if a < b
    {
        writeLine('a < b');
    }
    else
    {
        writeLine('not a < b');
    }

    if a > b
    {
        writeLine('a > b');
    }
    else
    {
        writeLine('not a > b');
    }


    if b < a
    {
        writeLine('b < a');
    }
    else
    {
        writeLine('not b < a');
    }

    if b > a
    {
        writeLine('b > a');
    }
    else
    {
        writeLine('not b > a');
    }


    if b = c
    {
        writeLine('b = c');
    }
    else
    {
        writeLine('not b = c');
    }

    if b < c
    {
        writeLine('b < c');
    }
    else
    {
        writeLine('not b < c');
    }

    if b > c
    {
        writeLine('b > c');
    }
    else
    {
        writeLine('not b > c');
    }

    return;
}
