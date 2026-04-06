# Checking a Minimum Age

Boolean helper functions keep decision logic readable.

```python
def is_tall_enough(height):
    return height >= 120
```

Here is what the example does:

- `def is_tall_enough(height)` defines a function named `is_tall_enough` that takes one input: `height`.
- Inside the function, `return` sends whether `height >= 120` is `True` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `is_old_enough` function.
It accepts 1 input:

- `age`: an integer
  It should return 1 value:
- a Boolean value
  To solve it:
- Return `age >= 18`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(is_old_enough(17))
# False
print(is_old_enough(18))
# True
```
