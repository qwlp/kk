# Counting Down With `while`

A `while` loop repeats as long as its condition stays true.

```python
count = 4
while count >= 2:
    print(count)
    count = count - 1
```

Here is what the example does:

- `count` stores the number `4`.
- The `while` loop keeps repeating as long as `count >= 2` is `True`.
- `print(count)` displays the value stored in `count`.
- `count` calculates `count - 1` and stores the result.

The assignment changes the numbers, but the loop pattern is the same: print, update, and keep going until the condition fails.

## Assignment

Complete the starter code so the program does the following:

- Use a `while` loop that runs while `count > 0` is `True`.
- Inside the loop, print `count`.
- Inside the loop, update `count` to `count - 1`.
  Your finished program should print exactly this output:

```text
3
2
1
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
