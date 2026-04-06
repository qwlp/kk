# Testing a Boolean Result

Tests can verify boolean logic too.

```python
def is_odd(value):
    return value % 2 == 1
```

Here is what the example does:

- `def is_odd(value)` defines a function named `is_odd` that takes one input: `value`.
- Inside the function, `return` sends whether `value % 2 == 1` is `True` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `is_even` function.
It accepts 1 input:

- `value`: an integer
  It should return 1 value:
- a Boolean value
  To solve it:
- Return `value % 2 == 0`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(is_even(4))
# True
print(is_even(5))
# False
```
