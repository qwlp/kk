# Practice: Top Score

This is a best-so-far loop plus an empty-input case.

```python
def longest_word(words):
    best = words[0]
    for word in words:
        if len(word) > len(best):
            best = word
    return best
```

Here is what the example does:

- `def longest_word(words)` defines a function named `longest_word` that takes one input: `words`.
- Inside the function, `best` looks up `words[0]` and stores that value.
- Inside the function, the `for` loop takes each item from `words` one at a time and puts it into `word`.
- Inside the function, the `if` statement checks whether `len(word) > len(best)` is `True`.
- Inside the function, `best` stores the value in `word`.
- Inside the function, `return` sends the value in `best` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `top_score` function.
It accepts 1 input:

- `scores`: a list of integers

It should return 1 value:

- an integer

To solve it:

- If `not scores`, return `0`.
- Set `best` to `scores[0]`.
- Loop through each `score` in `scores`.
- Inside the loop, if `score > best`, set `best` to `score`.
- Return `best`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(top_score([2, 9, 5]))
# 9
print(top_score([]))
# 0
```
