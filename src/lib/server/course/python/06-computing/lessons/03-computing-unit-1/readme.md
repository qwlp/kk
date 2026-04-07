# Converting Bits to Bytes

Package a unit conversion in a function.

```python
def bytes_to_bits(byte_count):
    return byte_count * 8
```

Here is what the example does:

- `def bytes_to_bits(byte_count)` defines a function named `bytes_to_bits` that takes one input: `byte_count`.
- Inside the function, `return` sends the result of `byte_count * 8` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `bits_to_bytes` function.
It accepts 1 input:

- `bits`: an integer

It should return 1 value:

- an integer

To solve it:

- Return `bits // 8`.

Return the value. Do not print it. The tests check the returned result.

Here are examples of how the function should behave:

```python
print(bits_to_bytes(8))
# 1
print(bits_to_bytes(32))
# 4
```
