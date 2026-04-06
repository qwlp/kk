# Reading the First Item Safely

A careful function handles the empty case before reading index 0.

```python
def last_item(items):
    if not items:
        return None
    return items[-1]
```

Here is what the example does:

- `def last_item(items)` defines a function named `last_item` that takes one input: `items`.
- Inside the function, the `if` statement checks whether `items` is empty or missing.
- Inside the function, `return` sends `None` back to the caller.
- Inside the function, `return` sends the value at `items[-1]` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `first_item` function.
It accepts 1 input:

- `items`: a list of integers
  It should return 1 value:
- the requested item, or `None` if the list is empty
  To solve it:
- If `not items`, return `None`.
- Return `items[0]`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(first_item([1, 2, 3]))
# 1
print(first_item([]))
# None
```
