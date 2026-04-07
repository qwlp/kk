# Returning a Value Out of a Function

A returned value can travel back to the caller.

```python
def make_tag(name):
    return "Tag: " + name

print(make_tag("Mira"))
```

Here is what the example does:

- `def make_tag(name)` defines a function named `make_tag` that takes one input: `name`.
- Inside the function, `return` sends the result of `'Tag: ' + name` back to the caller.
- `print(make_tag('Mira'))` runs `make_tag('Mira')` and displays the returned value.

The assignment uses different names or values, but you will still return a value and print the result in the same way.

## Assignment

Complete the `build_label` function.
`build_label` should return 1 value:

- the correct value

To complete `build_label`:

- Set `label` to `'Knight'`.
- Return `label`.

After that:

- Print the result of `build_label()`.

Your finished program should print exactly this output:

```text
Knight
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
