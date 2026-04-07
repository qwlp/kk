# Practice: Filtering Unlocked Levels

Filtering means keeping matching values and ignoring the rest.

```python
def filter_even(numbers):
    result = []
    for number in numbers:
        if number % 2 == 0:
            result.append(number)
    return result
```

Here is what the example does:

- `def filter_even(numbers)` defines a function named `filter_even` that takes one input: `numbers`.
- Inside the function, `result` creates a list and stores it in `result`.
- Inside the function, the `for` loop takes each item from `numbers` one at a time and puts it into `number`.
- Inside the function, the `if` statement checks whether `number % 2 == 0` is `True`.
- Inside the function, `result.append(number)` calls `result.append` with the given input values.
- Inside the function, `return` sends the value in `result` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `filter_unlocked` function.
It accepts 2 inputs:

- `levels`: a list of integers
- `minimum`: an integer

It should return 1 value:

- a list

To solve it:

- Set `result` to `[]`.
- Loop through each `level` in `levels`.
- Inside the loop, if `level >= minimum`, use `result.append(level)`.
- Return `result`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(filter_unlocked([1, 3, 5], 3))
# [3, 5]
print(filter_unlocked([1, 2], 5))
# []
```
