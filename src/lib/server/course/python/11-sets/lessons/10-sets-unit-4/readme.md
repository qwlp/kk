# Finding Newly Earned Badges

Set difference keeps values from one set that are not in another.

```python
def new_cards(current, earned):
    return earned - current
```

Here is what the example does:

- `def new_cards(current, earned)` defines a function named `new_cards` with the inputs `current`, `earned`.
- Inside the function, `return` sends the result of `earned - current` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `new_badges` function.
It accepts 2 inputs:

- `earned`: a set of strings
- `owned`: a set of strings

It should return 1 value:

- the result of the set difference

To solve it:

- Return `earned - owned`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(new_badges({'bronze', 'silver'}, {'bronze'}))
# {'silver'}
print(new_badges({'bronze'}, {'bronze'}))
# set()
```
