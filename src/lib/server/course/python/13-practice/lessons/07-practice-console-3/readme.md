# Practice: Counting Unique Tags

Practice is often about choosing the right tool for the job.

```python
words = ["red", "blue", "red", "gold"]
unique_words = set(words)
print(len(unique_words))
```

Here is what the example does:

- `words` creates a list and stores it in `words`.
- `unique_words` stores the returned value from `set(words)`.
- `print(len(unique_words))` runs `len(unique_words)` and displays the returned value.

The assignment changes the specific values, but the basic pattern is the same.

## Assignment

Complete the starter code so the program does the following:

- Set `tags` to `['fire', 'ice', 'fire', 'wind']`.
- Print the result of `len(set(tags))`.

Your finished program should print exactly this output:

```text
3
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
