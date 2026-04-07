# Returning a Formatted String

Tests are great at catching formatting mistakes.

```python
def format_pair(name, count):
    return name + ": " + str(count)
```

Here is what the example does:

- `def format_pair(name, count)` defines a function named `format_pair` with the inputs `name`, `count`.
- Inside the function, `return` sends the result of `name + ': ' + str(count)` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `format_item` function.
It accepts 1 input:

- `name`: a string

It should return 1 value:

- a string

To solve it:

- Return `'Item: ' + name`.

Return the value. Do not print it. The tests check the returned result.

Be careful with spaces, punctuation, and capitalization. The returned string must match exactly.

Here are examples of how the function should behave:

```python
print(format_item('potion'))
# 'Item: potion'
print(format_item('key'))
# 'Item: key'
```
