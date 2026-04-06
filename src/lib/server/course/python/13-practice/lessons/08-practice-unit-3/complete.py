def inventory_total(items):
    total = 0
    for value in items.values():
        total = total + value
    return total
