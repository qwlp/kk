# Using `if` and `else`

`else` gives you the other path.

```python
health = 3
if health > 0:
    print("Still standing")
else:
    print("Out")
```

Here is what the example does:

- `health` stores the number `3`.
- The `if` statement checks whether `health > 0` is `True`.
- `print('Still standing')` displays the text "Still standing".
- If that condition is `False`, the `else` block runs instead.
- `print('Out')` displays the text "Out".

The assignment changes the condition and messages, but the same `if` / `else` pattern still applies.

## Assignment

Complete the starter code so the program does the following:

- If `score >= 10`, print the exact text `'Win'`.
- Otherwise, print the exact text `'Keep going'`.
  Your finished program should print exactly this output:

```text
Keep going
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
