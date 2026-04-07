# Parameters Belong to the Function

Parameters are local to the function too.

```python
def echo(word):
    print(word)

echo("inside")
```

Here is what the example does:

- `def echo(word)` defines a function named `echo` that takes one input: `word`.
- Inside the function, `print(word)` displays the value stored in `word`.
- `echo('inside')` calls `echo` with the given input values.

The assignment asks for a different function, but you will use the same function pattern.

## Assignment

Complete the `greet` function.
`greet` accepts 1 input:

- `name`: a string

To complete `greet`:

- Print `name`.

After that:

- Call `greet('inside')`.

Your finished program should print exactly this output:

```text
inside
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
