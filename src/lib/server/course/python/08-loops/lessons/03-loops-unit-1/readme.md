# Summing a List With a Loop

Loops let a function process every item in a list.

```python
def total_steps(steps):
    total = 0
    for step in steps:
        total = total + step
    return total
```

Here is what the example does:

- `def total_steps(steps)` defines a function named `total_steps` that takes one input: `steps`.
- Inside the function, `total` stores the number `0`.
- Inside the function, the `for` loop takes each item from `steps` one at a time and puts it into `step`.
- Inside the function, `total` calculates `total + step` and stores the result.
- Inside the function, `return` sends the value in `total` back to the caller.

The assignment uses different names or values, but you will follow the same running-total pattern.

## Assignment

Complete the `sum_coins` function.
It accepts 1 input:

- `coins`: a list of integers
  It should return 1 value:
- an integer
  To solve it:
- Set `total` to `0`.
- Loop through each `coin` in `coins`.
- Inside the loop, update `total` to `total + coin`.
- Return `total`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(sum_coins([1, 2, 3]))
# 6
print(sum_coins([]))
# 0
```
