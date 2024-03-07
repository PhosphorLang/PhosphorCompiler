module Math;

function testUnaryPlus (a: Integer): Integer
{
    return +a;
}

function testUnaryMinus (a: Integer): Integer
{
    return -a;
}

function testAddition (a: Integer, b: Integer): Integer
{
    return a + b;
}

function testSubtraction (a: Integer, b: Integer): Integer
{
    return a - b;
}

function testMultiplication (a: Integer, b: Integer): Integer
{
    return a * b;
}

function testDivision (a: Integer, b: Integer): Integer
{
    return a / b;
}

function testModulo (a: Integer, b: Integer): Integer
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
