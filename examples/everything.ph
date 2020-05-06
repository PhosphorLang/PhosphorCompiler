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

    print('Hello world?');
    print(text);

    return;
}
