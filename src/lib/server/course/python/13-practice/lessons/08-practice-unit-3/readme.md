# Practice: Inventory Total

This is the same total-building idea in dictionary form.

```python
def cart_total(cart):
    total = 0
    for amount in cart.values():
        total = total + amount
    return total
```

Here is what the example does:

- `def cart_total(cart)` defines a function named `cart_total` that takes one input: `cart`.
- Inside the function, `total` stores the number `0`.
- Inside the function, the `for` loop takes each item from `cart.values()` one at a time and puts it into `amount`.
- Inside the function, `total` calculates `total + amount` and stores the result.
- Inside the function, `return` sends the value in `total` back to the caller.

The assignment uses different names or values, but you will follow the same running-total pattern.

## Assignment

Complete the `inventory_total` function.
It accepts 1 input:

- `items`: a dictionary with string keys and integer values
  It should return 1 value:
- an integer
  To solve it:
- Set `total` to `0`.
- Loop through each `value` in `items.values()`.
- Inside the loop, update `total` to `total + value`.
- Return `total`.
  Return the value. Do not print it. The tests check the returned result.
  Here are examples of how the function should behave:

```python
print(inventory_total({'potion': 2, 'key': 1}))
# 3
print(inventory_total({}))
# 0
```
