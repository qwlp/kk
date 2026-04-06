# Fixing a Broken Function Call

When debugging functions, check the function and the call site.

```python
def salute(name):
    print("Hello")
    print(name)

salute("Kai")
```

Here is what the example does:

- `def salute(name)` defines a function named `salute` that takes one input: `name`.
- Inside the function, `print('Hello')` displays the text "Hello".
- Inside the function, `print(name)` displays the value stored in `name`.
- `salute('Kai')` calls `salute` with the given input values.

The assignment asks for a different function, but you will use the same function pattern.

## Assignment

Complete the `greet` function.
`greet` accepts 1 input:

- `name`: a string
  To complete `greet`:
- Print `'Hello, ' + name`.
  After that:
- Call `greet('Ada')`.
  Your finished program should print exactly this output:

```text
Hello, Ada
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
