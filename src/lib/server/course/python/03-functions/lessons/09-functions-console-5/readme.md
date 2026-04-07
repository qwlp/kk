# Using a Function to Reuse Code

Once a function knows how to do a calculation, you can call it with different inputs.

```python
def area_of_square(side):
    return side * side

tile_length = 3
tile_area = area_of_square(tile_length)
print(tile_area)
```

Here is what the example does:

- `def area_of_square(side)` defines a function named `area_of_square` that takes one input: `side`.
- Inside the function, `return` sends the result of `side * side` back to the caller.
- `tile_length` stores the number `3`.
- `tile_area` stores the returned value from `area_of_square(tile_length)`.
- `print(tile_area)` displays the value stored in `tile_area`.

The assignment uses different names or values, but you will still return a value and print the result in the same way.

## Assignment

The helper function is already written.
Complete the starter code so the program does the following:

- Store the returned value from `area_of_circle(spear_length)` in `spear_area`.

Your finished program should print exactly this output:

```text
12.56
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
