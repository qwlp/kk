# Finding the Smallest Number

Start with the first item and keep a best-so-far value.

```python
def largest(numbers):
    best = numbers[0]
    for number in numbers:
        if number > best:
            best = number
    return best
```

Here is what the example does:

- `def largest(numbers)` defines a function named `largest` that takes one input: `numbers`.
- Inside the function, `best` looks up `numbers[0]` and stores that value.
- Inside the function, the `for` loop takes each item from `numbers` one at a time and puts it into `number`.
- Inside the function, the `if` statement checks whether `number > best` is `True`.
- Inside the function, `best` stores the value in `number`.
- Inside the function, `return` sends the value in `best` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `smallest` function.
It accepts 1 input:

- `items`: a list of integers
  It should return 1 value:
- the correct value
  To solve it:
- Set `best` to `items[0]`.
- Loop through each `item` in `items`.
- Inside the loop, if `item < best`, set `best` to `item`.
- Return `best`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(smallest([5, 2, 9]))
# 2
print(smallest([0, -1, 4]))
# -1
```
