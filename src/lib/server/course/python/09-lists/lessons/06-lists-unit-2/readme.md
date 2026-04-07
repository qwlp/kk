# Counting Even Numbers in a List

This combines list processing, loops, and a numeric condition.

```python
def count_short_words(words):
    total = 0
    for word in words:
        if len(word) <= 3:
            total = total + 1
    return total
```

Here is what the example does:

- `def count_short_words(words)` defines a function named `count_short_words` that takes one input: `words`.
- Inside the function, `total` stores the number `0`.
- Inside the function, the `for` loop takes each item from `words` one at a time and puts it into `word`.
- Inside the function, the `if` statement checks whether `len(word) <= 3` is `True`.
- Inside the function, `total` calculates `total + 1` and stores the result.
- Inside the function, `return` sends the value in `total` back to the caller.

The assignment uses different names or values, but you will follow the same running-total pattern.

## Assignment

Complete the `count_even` function.
It accepts 1 input:

- `nums`: a list of integers

It should return 1 value:

- an integer

To solve it:

- Set `count` to `0`.
- Loop through each `num` in `nums`.
- Inside the loop, if `num % 2 == 0`, update `count` to `count + 1`.
- Return `count`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(count_even([1, 2, 4]))
# 2
print(count_even([1, 3, 5]))
# 0
```
