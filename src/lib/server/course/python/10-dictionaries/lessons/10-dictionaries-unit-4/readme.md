# Describing a Player

Dictionaries make it easy to format related values into a sentence.

```python
def describe_pet(pet):
    return pet["name"] + " is a " + pet["type"]
```

Here is what the example does:

- `def describe_pet(pet)` defines a function named `describe_pet` that takes one input: `pet`.
- Inside the function, `return` sends the result of `pet['name'] + ' is a ' + pet['type']` back to the caller.

The assignment asks for a different function, but the structure is the same: compute a value and return it.

## Assignment

Complete the `describe_player` function.
It accepts 1 input:

- `player`: a dictionary

It should return 1 value:

- the result of `player['name'] + ' is level ' + str(player['level'])`

To solve it:

- Return `player['name'] + ' is level ' + str(player['level'])`.

Return the value. Do not print it. The tests check the returned result.

Be careful with spaces, punctuation, and capitalization. The returned string must match exactly.

Here are examples of how the function should behave:

```python
print(describe_player({'name': 'Ayla', 'level': 3}))
# 'Ayla is level 3'
print(describe_player({'name': 'Kai', 'level': 7}))
# 'Kai is level 7'
```
