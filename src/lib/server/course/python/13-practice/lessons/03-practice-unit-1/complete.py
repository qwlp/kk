def average(scores):
    if not scores:
        return 0
    total = 0
    for score in scores:
        total = total + score
    return total / len(scores)
