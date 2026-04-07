# Practice: Can Craft

This combines dictionaries, defaults, loops, and comparisons.

```python
def can_pay(wallet, cost):
    for item, needed in cost.items():
        if wallet.get(item, 0) < needed:
            return False
    return True
```

Here is what the example does:

- `def can_pay(wallet, cost)` defines a function named `can_pay` with the inputs `wallet`, `cost`.
- Inside the function, the `for` loop walks through each key-value pair in `cost`, putting the key in `item` and the value in `needed`.
- Inside the function, the `if` statement checks whether `wallet.get(item, 0) < needed` is `True`.
- Inside the function, `return` sends the Boolean value `False` back to the caller.
- Inside the function, `return` sends the Boolean value `True` back to the caller.

The assignment changes the data, but the same `.get(..., default)` pattern keeps missing keys safe.

## Assignment

Complete the `can_craft` function.
It accepts 2 inputs:

- `bag`: a dictionary with string keys and integer values
- `recipe`: a dictionary with string keys and integer values

It should return 1 value:

- a Boolean

To solve it:

- Loop through each key/value pair in `recipe`, storing them in `item` and `needed`.
- Inside the loop, if `bag.get(item, 0) < needed`, return `False`.
- Return `True`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(can_craft({'wood': 3, 'ore': 2}, {'wood': 2, 'ore': 1}))
# True
print(can_craft({'wood': 1}, {'wood': 2}))
# False
```
