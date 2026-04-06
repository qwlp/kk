# Finding Shared Values

Set operations let you compare unique collections directly.

```python
left = {"map", "key"}
right = {"key", "coin"}
common = left & right
print(len(common))
```

Here is what the example does:

- `left` creates a set and stores it in `left`.
- `right` creates a set and stores it in `right`.
- `common` calculates `left & right` and stores the result.
- `print(len(common))` runs `len(common)` and displays the returned value.

The assignment changes the specific values, but the basic pattern is the same.

## Assignment

Complete the starter code so the program does the following:

- Set `left` to `{'axe', 'bow'}`.
- Set `right` to `{'bow', 'staff'}`.
- Set `shared` to `left & right`.
- Print the result of `len(shared)`.
  Your finished program should print exactly this output:

```text
1
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
