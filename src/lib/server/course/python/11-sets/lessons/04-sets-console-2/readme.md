# Adding to a Set

Sets are useful for fast membership checks.

```python
tags = {"new"}
tags.add("hot")
print("hot" in tags)
```

Here is what the example does:

- `tags` creates a set and stores it in `tags`.
- `tags.add('hot')` calls `tags.add` with the given input values.
- `print('hot' in tags)` displays the result of `'hot' in tags`.

The assignment changes the specific values, but the basic pattern is the same.

## Assignment

Complete the starter code so the program does the following:

- Use `tools.add('rope')`.
- Print `'rope' in tools`.

Your finished program should print exactly this output:

```text
True
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
