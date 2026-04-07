# Getting the Last Item

Lists support negative indexes.

```python
def get_first_item(items):
    return items[0]
```

Here is what the example does:

- `def get_first_item(items)` defines a function named `get_first_item` that takes one input: `items`.
- Inside the function, `return` sends the value at `items[0]` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `get_last_item` function.
It accepts 1 input:

- `items`: a list of strings

It should return 1 value:

- the requested value

To solve it:

- Return `items[-1]`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(get_last_item(['axe', 'bow']))
# 'bow'
print(get_last_item([1, 2, 3]))
# 3
```
