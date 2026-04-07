# Finding Shared Items

Set intersection keeps only shared values.

```python
def common_letters(left, right):
    return left & right
```

Here is what the example does:

- `def common_letters(left, right)` defines a function named `common_letters` with the inputs `left`, `right`.
- Inside the function, `return` sends the result of `left & right` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `shared_items` function.
It accepts 2 inputs:

- `left`: a set of strings
- `right`: a set of strings

It should return 1 value:

- a set of shared values

To solve it:

- Return `left & right`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(shared_items({'axe', 'bow'}, {'bow', 'staff'}))
# {'bow'}
print(shared_items({'axe'}, {'staff'}))
# set()
```
