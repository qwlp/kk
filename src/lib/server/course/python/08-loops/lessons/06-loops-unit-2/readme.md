# Counting Matching Scores

Loops and comparisons work well together.

```python
def count_even(numbers):
    total = 0
    for number in numbers:
        if number % 2 == 0:
            total = total + 1
    return total
```

Here is what the example does:

- `def count_even(numbers)` defines a function named `count_even` that takes one input: `numbers`.
- Inside the function, `total` stores the number `0`.
- Inside the function, the `for` loop takes each item from `numbers` one at a time and puts it into `number`.
- Inside the function, the `if` statement checks whether `number % 2 == 0` is `True`.
- Inside the function, `total` calculates `total + 1` and stores the result.
- Inside the function, `return` sends the value in `total` back to the caller.

The assignment uses different names or values, but you will follow the same running-total pattern.

## Assignment

Complete the `count_big_scores` function.
It accepts 1 input:

- `scores`: a list of integers
  It should return 1 value:
- an integer
  To solve it:
- Set `count` to `0`.
- Loop through each `score` in `scores`.
- Inside the loop, if `score >= 10`, update `count` to `count + 1`.
- Return `count`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(count_big_scores([5, 10, 12]))
# 2
print(count_big_scores([1, 2, 3]))
# 0
```
