def count_big_scores(scores):
    count = 0
    for score in scores:
        if score >= 10:
            count = count + 1
    return count
