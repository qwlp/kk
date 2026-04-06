# Functions With Multiple Inputs

Functions can take more than one input. Each input gets its own parameter.

```python
def add_points(main, extra):
    return main + extra

print(add_points(10, 2))
```

Here is what the example does:

- `def add_points(main, extra)` defines a function named `add_points` with the inputs `main`, `extra`.
- Inside the function, `return` sends the result of `main + extra` back to the caller.
- `print(add_points(10, 2))` runs `add_points(10, 2)` and displays the returned value.

The assignment uses different names or values, but you will still return a value and print the result in the same way.

## Assignment

Complete the `total_damage` function.
`total_damage` accepts 2 inputs:

- `base`: an integer
- `bonus`: an integer
  `total_damage` should return 1 value:
- the result of `base + bonus`
  To complete `total_damage`:
- Return `base + bonus`.
  After that:
- Print the result of `total_damage(12, 3)`.
  Your finished program should print exactly this output:

```text
15
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
