# Summing Dictionary Values

Looping over `values()` is a clean way to total stored counts.

```python
def total_points(stats):
    return stats["wins"] + stats["bonus"]
```

Here is what the example does:

- `def total_points(stats)` defines a function named `total_points` that takes one input: `stats`.
- Inside the function, `return` sends the result of `stats['wins'] + stats['bonus']` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `total_items` function.
It accepts 1 input:

- `counts`: a dictionary with string keys and integer values

It should return 1 value:

- an integer

To solve it:

- Set `total` to `0`.
- Loop through each `value` in `counts.values()`.
- Inside the loop, update `total` to `total + value`.
- Return `total`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(total_items({'potion': 2, 'key': 1}))
# 3
print(total_items({}))
# 0
```
