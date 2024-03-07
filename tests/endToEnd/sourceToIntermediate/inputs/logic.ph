module Logic;

function testNot (a: Boolean): Boolean
{
    return !a;
}

function testAnd (a: Boolean, b: Boolean): Boolean
{
    return a & b;
}

function testOr (a: Boolean, b: Boolean): Boolean
{
    return a | b;
}

function testEqual (a: Integer, b: Integer): Boolean
{
    return a = b;
}

function testNotEqual (a: Integer, b: Integer): Boolean
{
    return a != b;
}

function testLess (a: Integer, b: Integer): Boolean
{
    return a < b;
}

function testGreater (a: Integer, b: Integer): Boolean
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
