module Strings;

function testStringCompare (a: String, b: String): Boolean
{
    return a = b;
}

function main ()
{
    testStringCompare('abc', 'def');
    testStringCompare('abc', 'abc');
}
