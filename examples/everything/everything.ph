module Everything;

import Standard.Io;

function add (a: Int, b: Int): Int
{
    var result := a + b;

    return result;
}

function getHelloWorld (): String
{
    return 'Hello world!';
}

function main ()
{
    var text := getHelloWorld();

    Io.writeLine(text);
    Io.writeLine('Your name:');

    var name := Io.readLine();

    Io.writeLine('Your name is:');
    Io.writeLine(name);

    if add(4, 6) = 10
    {
        Io.writeLine('They are equal.');
    }
    else
    {
        Io.writeLine('They are not equal.');
    }
}
