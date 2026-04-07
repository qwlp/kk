# Practice: Summing Prices

Practice lessons combine several earlier ideas in one small task.

```python
weights = [2, 5, 3]
total = 0
for weight in weights:
    total = total + weight
print(total)
```

Here is what the example does:

- `weights` creates a list and stores it in `weights`.
- `total` stores the number `0`.
- The `for` loop takes each item from `weights` one at a time and puts it into `weight`.
- `total` calculates `total + weight` and stores the result.
- `print(total)` displays the value stored in `total`.

The assignment uses different names or values, but you will follow the same running-total pattern.

## Assignment

Complete the starter code so the program does the following:

- Set `prices` to `[4, 6, 3]`.
- Set `total` to `0`.
- Use a `for` loop to go through each `price` in `prices`.
- Inside the loop, update `total` to `total + price`.
- Print `total`.

Your finished program should print exactly this output:

```text
13
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
