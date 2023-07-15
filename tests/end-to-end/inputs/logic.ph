module Logic;

function testNot (a: Bool): Bool
{
    return !a;
}

function testAnd (a: Bool, b: Bool): Bool
{
    return a & b;
}

function testOr (a: Bool, b: Bool): Bool
{
    return a | b;
}

function testEqual (a: Int, b: Int): Bool
{
    return a = b;
}

function testNotEqual (a: Int, b: Int): Bool
{
    return a != b;
}

function testLess (a: Int, b: Int): Bool
{
    return a < b;
}

function testGreater (a: Int, b: Int): Bool
{
    return a > b;
}

function main ()
{
    testNot(true);
    testAnd(true, false);
    testOr(true, false);

    testEqual(1, 2);
    testNotEqual(1, 2);
    testLess(1, 2);
    testGreater(1, 2);
}
