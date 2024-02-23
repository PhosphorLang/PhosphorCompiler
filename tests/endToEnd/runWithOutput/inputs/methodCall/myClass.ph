class MyClass;

method getTextInternal (): String
{
    return 'Method called.';
}

method getText (): String
{
    // Tests that methods can be called from other methods:
    return getTextInternal();
}
