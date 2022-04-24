import 'io';

function main ()
{
    if 2 = 2
    {
        writeLine('Hello!');
    }

    if 4 = 3
    {
        writeLine('They are the same!');
    }
    else
    {
        writeLine('They are not the same!');
    }

    if false
    {
        writeLine('This will never happen.');
    }
    else if true
    {
        writeLine('This will happen!');
    }
    else
    {
        writeLine('This will also never happen.');
    }
}
