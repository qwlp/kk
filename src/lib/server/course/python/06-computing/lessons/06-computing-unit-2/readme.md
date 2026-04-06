# Converting Kilobytes to Bytes

A reusable conversion function is easier to read than repeated math.

```python
def megabytes_to_kilobytes(megabytes):
    return megabytes * 1024
```

Here is what the example does:

- `def megabytes_to_kilobytes(megabytes)` defines a function named `megabytes_to_kilobytes` that takes one input: `megabytes`.
- Inside the function, `return` sends the result of `megabytes * 1024` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `kilobytes_to_bytes` function.
It accepts 1 input:

- `kb`: an integer
  It should return 1 value:
- an integer
  To solve it:
- Return `kb * 1024`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(kilobytes_to_bytes(1))
# 1024
print(kilobytes_to_bytes(3))
# 3072
```
