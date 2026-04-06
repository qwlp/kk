# Local Variables Live Inside Functions

A variable created inside a function is local to that function.

```python
def show_status():
    status = "Ready"
    print(status)

show_status()
```

Here is what the example does:

- `def show_status()` defines a function named `show_status`.
- Inside the function, `status` stores the text "Ready".
- Inside the function, `print(status)` displays the value stored in `status`.
- `show_status()` calls `show_status` so its code runs.

The assignment asks for a different function, but you will use the same function pattern.

## Assignment

Complete the `show_message` function.
To complete `show_message`:

- Set `message` to `'Local scope'`.
- Print `message`.
  Your finished program should print exactly this output:

```text
Local scope
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
