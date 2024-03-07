module Functions;

function add (a: Integer, b: Integer): Integer
{
    let result := a + b;

    return result;
}

function testAdd (): Integer
{
    let sum := add(1, 2);

    return sum;
}

function main ()
{
    testAdd();
}
