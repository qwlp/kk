# Combining Conditions With `and`

`and` requires both conditions to be true.

```python
has_key = True
door_open = True
if has_key and door_open:
    print("Enter")
```

Here is what the example does:

- `has_key` stores the Boolean value `True`.
- `door_open` stores the Boolean value `True`.
- The `if` statement checks whether `has_key and door_open` is `True`.
- `print('Enter')` displays the text "Enter".

The assignment changes the specific values, but the basic pattern is the same.

## Assignment

Complete the starter code so the program does the following:

- If `stamina >= 10 and has_sword`, print the exact text `'Ready'`.

Your finished program should print exactly this output:

```text
Ready
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
