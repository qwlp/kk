# Practice: Averaging Scores

This combines loops, lists, arithmetic, and an empty-input edge case.

```python
def average_height(heights):
    if not heights:
        return 0
    total = 0
    for height in heights:
        total = total + height
    return total / len(heights)
```

Here is what the example does:

- `def average_height(heights)` defines a function named `average_height` that takes one input: `heights`.
- Inside the function, the `if` statement checks whether `heights` is empty or missing.
- Inside the function, `return` sends the number `0` back to the caller.
- Inside the function, `total` stores the number `0`.
- Inside the function, the `for` loop takes each item from `heights` one at a time and puts it into `height`.
- Inside the function, `total` calculates `total + height` and stores the result.
- Inside the function, `return` sends the result of `total / len(heights)` back to the caller.

The assignment uses different names or values, but you will follow the same running-total pattern.

## Assignment

Complete the `average` function.
It accepts 1 input:

- `scores`: a list of integers
  It should return 1 value:
- an integer
  To solve it:
- If `not scores`, return `0`.
- Set `total` to `0`.
- Loop through each `score` in `scores`.
- Inside the loop, update `total` to `total + score`.
- Return `total / len(scores)`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(average([2, 4, 6]))
# 4
print(average([]))
# 0
```
