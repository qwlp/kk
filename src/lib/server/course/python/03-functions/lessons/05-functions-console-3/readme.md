# Functions With Parameters

Parameters let a function receive input. They are variables that only exist inside the function.

```python
def greet(player):
    print("Welcome:")
    print(player)

greet("Nia")
```

Here is what the example does:

- `def greet(player)` defines a function named `greet` that takes one input: `player`.
- Inside the function, `print('Welcome:')` displays the text "Welcome:".
- Inside the function, `print(player)` displays the value stored in `player`.
- `greet('Nia')` calls `greet` with the given input values.

The assignment asks for a different function, but you will use the same function pattern.

## Assignment

Complete the `announce` function.
`announce` accepts 1 input:

- `name`: a string
  To complete `announce`:
- Print the exact text `'Now entering:'`.
- Print `name`.
  After that:
- Call `announce('Ayla')`.
  Your finished program should print exactly this output:

```text
Now entering:
Ayla
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
