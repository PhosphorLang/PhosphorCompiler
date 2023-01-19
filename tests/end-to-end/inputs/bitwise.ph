function testNot (a: Int): Int
{
    return !a;
}

function testAnd (a: Int, b: Int): Int
{
    return a & b;
}

function testOr (a: Int, b: Int): Int
{
    return a | b;
}

function main ()
{
    testNot(2);
    testAnd(2, 3);
    testOr(2, 3);
}
