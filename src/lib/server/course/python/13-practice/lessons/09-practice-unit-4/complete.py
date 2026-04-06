def top_score(scores):
    if not scores:
        return 0
    best = scores[0]
    for score in scores:
        if score > best:
            best = score
    return best
