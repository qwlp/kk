# Detecting Duplicates

If the set is smaller than the list, duplicates were removed.

```python
def all_unique(values):
    return len(set(values)) == len(values)
```

Here is what the example does:

- `def all_unique(values)` defines a function named `all_unique` that takes one input: `values`.
- Inside the function, `return` sends whether `len(set(values)) == len(values)` is `True` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `has_duplicates` function.
It accepts 1 input:

- `items`: a list of integers
  It should return 1 value:
- a Boolean value
  To solve it:
- Return `len(set(items)) != len(items)`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(has_duplicates([1, 1, 2]))
# True
print(has_duplicates([1, 2, 3]))
# False
```
