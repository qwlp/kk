# Parsing a Level Safely

Try a conversion and fall back gracefully if it fails.

```python
def parse_count(text):
    try:
        return int(text)
    except ValueError:
        return 0
```

Here is what the example does:

- `def parse_count(text)` defines a function named `parse_count` that takes one input: `text`.
- Inside the function, the `try` block runs the risky code first.
- Inside the function, `return` sends the integer version of `text` back to the caller.
- Inside the function, if `ValueError` happens, the matching `except` block runs instead.
- Inside the function, `return` sends the number `0` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `parse_level` function.
It accepts 1 input:

- `text`: a string

It should return 1 value:

- the converted value, or the fallback value if conversion fails

To solve it:

- Try to return `int(text)`.
- If a `ValueError` happens, return `0` instead.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(parse_level('7'))
# 7
print(parse_level('oops'))
# 0
```
