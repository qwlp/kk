# Using `try` and `except`

Some operations fail on bad input. `try` and `except` let you recover.

```python
value = "ten"
try:
    print(int(value))
except ValueError:
    print("not a number")
```

Here is what the example does:

- `value` stores the text "ten".
- The `try` block runs the risky code first.
- `print(int(value))` runs `int(value)` and displays the returned value.
- If `ValueError` happens, the matching `except` block runs instead.
- `print('not a number')` displays the text "not a number".

The assignment uses different input, but you will solve it with the same `try` / `except` pattern.

## Assignment

Complete the starter code so the program does the following:

- Try to print the result of `int(text)`.
- If a `ValueError` happens, print the exact text `'invalid number'`.

Your finished program should print exactly this output:

```text
invalid number
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
