# Repeating a Word

Loops can build strings too, not just totals.

```python
def repeat_mark(mark, times):
    result = ""
    for _ in range(times):
        result = result + mark
    return result
```

Here is what the example does:

- `def repeat_mark(mark, times)` defines a function named `repeat_mark` with the inputs `mark`, `times`.
- Inside the function, `result` stores the text "".
- Inside the function, the `for` loop repeats once for each value produced by `range(times)`.
- Inside the function, `result` calculates `result + mark` and stores the result.
- Inside the function, `return` sends the value in `result` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `repeat_word` function.
It accepts 2 inputs:

- `word`: a string
- `times`: an integer
  It should return 1 value:
- a string
  To solve it:
- Start with `result` as an empty string.
- Use `range(times)` to repeat the loop the correct number of times.
- Inside the loop, update `result` to `result + word`.
- Return `result`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(repeat_word('ha', 2))
# 'haha'
print(repeat_word('go', 0))
# ''
```
