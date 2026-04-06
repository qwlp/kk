# Dividing Safely

Edge cases matter. A function is not finished until it handles awkward inputs too.

```python
def safe_ratio(total, groups):
    if groups == 0:
        return 0
    return total / groups
```

Here is what the example does:

- `def safe_ratio(total, groups)` defines a function named `safe_ratio` with the inputs `total`, `groups`.
- Inside the function, the `if` statement checks whether `groups == 0` is `True`.
- Inside the function, `return` sends the number `0` back to the caller.
- Inside the function, `return` sends the result of `total / groups` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `safe_divide` function.
It accepts 2 inputs:

- `total`: an integer
- `count`: an integer
  It should return 1 value:
- the correct value for the condition
  To solve it:
- If `count == 0`, return `0`.
- Return `total / count`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(safe_divide(10, 0))
# 0
print(safe_divide(10, 2))
# 5
```
