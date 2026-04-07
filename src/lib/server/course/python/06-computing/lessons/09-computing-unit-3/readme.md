# Checking Available Memory

Programs often compare required resources to available resources.

```python
def can_fit(file_size, free_space):
    return free_space >= file_size
```

Here is what the example does:

- `def can_fit(file_size, free_space)` defines a function named `can_fit` with the inputs `file_size`, `free_space`.
- Inside the function, `return` sends whether `free_space >= file_size` is `True` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `has_enough_memory` function.
It accepts 2 inputs:

- `required`: an integer
- `available`: an integer

It should return 1 value:

- a Boolean value

To solve it:

- Return `available >= required`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(has_enough_memory(128, 256))
# True
print(has_enough_memory(512, 256))
# False
```
