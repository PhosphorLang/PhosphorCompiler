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

    return;
}
