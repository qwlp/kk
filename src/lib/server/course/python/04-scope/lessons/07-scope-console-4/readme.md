# Same Name, Different Function

Different functions can each have their own local variable with the same name.

```python
def up():
    print("up")

def down():
    print("down")

up()
down()
```

Here is what the example does:

- `def up()` defines a function named `up`.
- Inside the function, `print('up')` displays the text "up".
- `def down()` defines a function named `down`.
- Inside the function, `print('down')` displays the text "down".
- `up()` calls `up` so its code runs.
- `down()` calls `down` so its code runs.

The assignment asks for a different function, but you will use the same function pattern.

## Assignment

Complete the `left` and `right` functions.
To complete `left`:

- Set `count` to `1`.
- Print `count`.

To complete `right`:

- Set `count` to `2`.
- Print `count`.

Your finished program should print exactly this output:

```text
1
2
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
