# Accumulating a Total

Loops are often used to build up a result over time.

```python
prices = [2, 4, 6]
total = 0
for price in prices:
    total = total + price
print(total)
```

Here is what the example does:

- `prices` creates a list and stores it in `prices`.
- `total` stores the number `0`.
- The `for` loop takes each item from `prices` one at a time and puts it into `price`.
- `total` calculates `total + price` and stores the result.
- `print(total)` displays the value stored in `total`.

The assignment uses different names or values, but you will follow the same running-total pattern.

## Assignment

Complete the starter code so the program does the following:

- Use a `for` loop to go through each `value` in `[2, 3, 4]`.
- Inside the loop, update `total` to `total + value`.

Your finished program should print exactly this output:

```text
9
```

Be very careful with capitalization, spaces, and line breaks. The output must match exactly.
