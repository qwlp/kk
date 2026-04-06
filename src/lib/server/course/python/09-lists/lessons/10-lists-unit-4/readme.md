# Joining Names With Commas

Lists often need to be turned back into one display string.

```python
def join_words(words):
    return " / ".join(words)
```

Here is what the example does:

- `def join_words(words)` defines a function named `join_words` that takes one input: `words`.
- Inside the function, `return` sends the result of `' / '.join(words)` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `join_names` function.
It accepts 1 input:

- `names`: a list of strings
  It should return 1 value:
- a string
  To solve it:
- Return `', '.join(names)`.
  Return the value. Do not print it. The tests check the returned result.
  Be careful with spaces, punctuation, and capitalization. The returned string must match exactly.
  Here are examples of how the function should behave:

```python
print(join_names(['Ayla', 'Kai']))
# 'Ayla, Kai'
print(join_names(['Solo']))
# 'Solo'
```
