# Returning a Value

A function can return a value instead of printing it directly. Returning sends a result back to the place where the function was called.

```python
def triple(value):
    return value * 3

print(triple(4))
```

Here is what the example does:

- `def triple(value)` defines a function named `triple` that takes one input: `value`.
- Inside the function, `return` sends the result of `value * 3` back to the caller.
- `print(triple(4))` runs `triple(4)` and displays the returned value.

The assignment uses different names or values, but you will still return a value and print the result in the same way.

## Assignment

Complete the `double` function.
`double` accepts 1 input:

- `value`: an integer

`double` should return 1 value:

- the correct value

To complete `double`:

- Return `value * 2`.

After that:

- Print the result of `double(6)`.

Your finished program should print exactly this output:

```text
12
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
