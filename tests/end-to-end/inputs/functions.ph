function add (a: Int, b: Int): Int
{
    var result := a + b;

    return result;
}

function testAdd (): Int
{
    var sum := add(1, 2);

    return sum;
}

function main ()
{
    testAdd();
}
