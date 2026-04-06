def filter_unlocked(levels, minimum):
    result = []
    for level in levels:
        if level >= minimum:
            result.append(level)
    return result
