class List;
generics ElementType;

field length: Integer;
field data: Array[ElementType];

method get (index: Integer): ElementType
{
    return data.get(index);
}

method set (index: Integer, value: ElementType)
{
    if (index < 0 | index >= length)
    {
        panic('Index out of bounds');
    }

    data.set(index, value);
}

method add (value: ElementType)
{
    if (data.length == length)
    {
        resize(data.length * 2);
    }

    data.set(length, value);
    length := length + 1;
}

method resize (newCapacity: Integer)
{
    let newData := new Array[ElementType](newCapacity);

    let i := 0;
    while (i < length)
    {
        newData.set(i, data.get(i));
    }

    data := newData;
}
