# Checking for Weekend Days

`or` is useful when more than one value counts as success.

```python
def is_primary_color(color):
    return color == "red" or color == "blue" or color == "yellow"
```

Here is what the example does:

- `def is_primary_color(color)` defines a function named `is_primary_color` that takes one input: `color`.
- Inside the function, `return` sends the result of `color == 'red' or color == 'blue' or color == 'yellow'` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `is_weekend` function.
It accepts 1 input:

- `day`: a string

It should return 1 value:

- a Boolean value

To solve it:

- Return `day == 'Sat' or day == 'Sun'`.

Return the value. Do not print it. The tests check the returned result.

Be careful with spaces, punctuation, and capitalization. The returned string must match exactly.

Here are examples of how the function should behave:

```python
print(is_weekend('Sat'))
# True
print(is_weekend('Mon'))
# False
```
