module Bitwise;

function testNot (a: Integer): Integer
{
    return !a;
}

function testAnd (a: Integer, b: Integer): Integer
{
    return a & b;
}

function testOr (a: Integer, b: Integer): Integer
{
    return a | b;
}

function main ()
{
    testNot(2);
    testAnd(2, 3);
    testOr(2, 3);
}
