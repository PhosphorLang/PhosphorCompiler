module Math;

function testUnaryPlus (a: Int): Int
{
    return +a;
}

function testUnaryMinus (a: Int): Int
{
    return -a;
}

function testAddition (a: Int, b: Int): Int
{
    return a + b;
}

function testSubtraction (a: Int, b: Int): Int
{
    return a - b;
}

function testMultiplication (a: Int, b: Int): Int
{
    return a * b;
}

function testDivision (a: Int, b: Int): Int
{
    return a / b;
}

function testModulo (a: Int, b: Int): Int
{
    return a % b;
}

function main ()
{
    testUnaryMinus(1);
    testUnaryPlus(1);
    testAddition(1, 2);
    testSubtraction(1, 2);
    testMultiplication(1, 2);
    testDivision(3, 2);
    testModulo(3, 2);
}
