# Checking Before Dividing

Preventing an error is often better than catching it.

```python
coins = 12
players = 3
if players != 0:
    print(coins / players)
else:
    print("cannot divide")
```

Here is what the example does:

- `coins` stores the number `12`.
- `players` stores the number `3`.
- The `if` statement checks whether `players != 0` is `True`.
- `print(coins / players)` displays the result of `coins / players`.
- If that condition is `False`, the `else` block runs instead.
- `print('cannot divide')` displays the text "cannot divide".

The assignment changes the condition and messages, but the same `if` / `else` pattern still applies.

## Assignment

Complete the starter code so the program does the following:

- If `count == 0`, print the exact text `'cannot divide'`.
- Otherwise, print `total / count`.

Your finished program should print exactly this output:

```text
cannot divide
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
