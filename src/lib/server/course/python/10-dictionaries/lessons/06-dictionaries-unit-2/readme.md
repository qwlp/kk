# Checking Whether a Key Exists

The `in` operator checks whether a key exists in a dictionary.

```python
def has_name(record):
    return "name" in record
```

Here is what the example does:

- `def has_name(record)` defines a function named `has_name` that takes one input: `record`.
- Inside the function, `return` sends whether `'name' in record` is `True` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `has_item` function.
It accepts 2 inputs:

- `inventory`: a dictionary with string keys and integer values
- `item`: a string

It should return 1 value:

- a Boolean value

To solve it:

- Return `item in inventory`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(has_item({'potion': 2}, 'potion'))
# True
print(has_item({'potion': 2}, 'key'))
# False
```
