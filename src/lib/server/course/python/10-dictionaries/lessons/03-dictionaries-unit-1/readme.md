# Getting a Score From a Dictionary

Dictionary helper functions make data access reusable.

```python
def get_name(user):
    return user["name"]
```

Here is what the example does:

- `def get_name(user)` defines a function named `get_name` that takes one input: `user`.
- Inside the function, `return` sends the value at `user['name']` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `get_score` function.
It accepts 1 input:

- `player`: a dictionary with string keys and integer values
  It should return 1 value:
- the requested value
  To solve it:
- Return `player['score']`.
  Return the value. Do not print it. The tests check the returned result.
  Be careful with spaces, punctuation, and capitalization. The returned string must match exactly.
  Here are examples of how the function should behave:

```python
print(get_score({'score': 9}))
# 9
print(get_score({'score': 0}))
# 0
```
