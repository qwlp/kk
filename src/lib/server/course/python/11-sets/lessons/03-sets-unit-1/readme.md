# Counting Unique Items

Turning a list into a set throws away duplicates.

```python
def unique_letters(letters):
    return len(set(letters))
```

Here is what the example does:

- `def unique_letters(letters)` defines a function named `unique_letters` that takes one input: `letters`.
- Inside the function, `return` sends the length of `set(letters)` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `unique_count` function.
It accepts 1 input:

- `items`: a list of strings
  It should return 1 value:
- an integer
  To solve it:
- Return `len(set(items))`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(unique_count(['a', 'a', 'b']))
# 2
print(unique_count([]))
# 0
```
