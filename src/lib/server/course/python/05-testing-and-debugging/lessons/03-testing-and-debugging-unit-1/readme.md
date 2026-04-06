# Implementing a Small Tested Function

Unit tests let you focus on one function at a time.

```python
def add_score(current, bonus):
    return current + bonus
```

Here is what the example does:

- `def add_score(current, bonus)` defines a function named `add_score` with the inputs `current`, `bonus`.
- Inside the function, `return` sends the result of `current + bonus` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `add_reward` function.
It accepts 1 input:

- `points`: an integer
  It should return 1 value:
- the result of `points + 5`
  To solve it:
- Return `points + 5`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(add_reward(1))
# 6
print(add_reward(0))
# 5
```
