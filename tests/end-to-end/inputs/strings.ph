function testStringCompare (a: String, b: String): Bool
{
    return a = b;
}

function main ()
{
    testStringCompare('abc', 'def');
    testStringCompare('abc', 'abc');
}
