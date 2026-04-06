# Avoiding a Missing-Key Error

`.get()` gives you a safer dictionary lookup when a default makes sense.

```python
player = {"name": "Lia"}
print(player.get("score", 0))
```

Here is what the example does:

- `player` creates a dictionary and stores it in `player`.
- `print(player.get('score', 0))` runs `player.get('score', 0)` and displays the returned value.

The assignment changes the data, but the same `.get(..., default)` pattern keeps missing keys safe.

## Assignment

Complete the starter code so the program does the following:

- Print the result of `player.get('level', 0)`.
  Your finished program should print exactly this output:

```text
0
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
