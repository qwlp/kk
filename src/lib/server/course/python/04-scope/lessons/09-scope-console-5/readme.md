# Reading a Value From Outside

A function can read an outer variable when it does not define its own variable with the same name.

```python
weather = "sunny"

def show_weather():
    print(weather)

show_weather()
```

Here is what the example does:

- `weather` stores the text "sunny".
- `def show_weather()` defines a function named `show_weather`.
- Inside the function, `print(weather)` displays the value stored in `weather`.
- `show_weather()` calls `show_weather` so its code runs.

The assignment asks for a different function, but you will use the same function pattern.

## Assignment

Complete the `show_theme` function.
To complete `show_theme`:

- Print `theme`.

After that:

- Set `theme` to `'forest'`.

Your finished program should print exactly this output:

```text
forest
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
