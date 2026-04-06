def smallest(items):
    best = items[0]
    for item in items:
        if item < best:
            best = item
    return best
