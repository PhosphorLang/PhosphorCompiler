module Functions;

function add (a: Int, b: Int): Int
{
    let result := a + b;

    return result;
}

function testAdd (): Int
{
    let sum := add(1, 2);

    return sum;
}

function main ()
{
    testAdd();
}
