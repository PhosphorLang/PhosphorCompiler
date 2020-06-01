function add (a: Int, b: Int): Int
{
    var result := a + b;

    return result;
}

function getHelloWorld (): String
{
    return 'Hello world?';
}

function main ()
{
    var text := getHelloWorld();

    writeLine(text);
    writeLine('Your name:');

    var name := readLine();

    writeLine('Your name is:');
    writeLine(name);

    if add(4, 6) = 10
    {
        writeLine('They are equal.');
    }
    else
    {
        writeLine('They are not equal.');
    }

    return;
}
