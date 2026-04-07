# Checking a Weight Limit

Sometimes the rule is about staying at or below a maximum.

```python
def can_hold(limit, item_weight):
    return item_weight <= limit
```

Here is what the example does:

- `def can_hold(limit, item_weight)` defines a function named `can_hold` with the inputs `limit`, `item_weight`.
- Inside the function, `return` sends whether `item_weight <= limit` is `True` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `can_carry` function.
It accepts 2 inputs:

- `weight`: an integer
- `limit`: an integer

It should return 1 value:

- a Boolean value

To solve it:

- Return `weight <= limit`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(can_carry(8, 10))
# True
print(can_carry(12, 10))
# False
```
