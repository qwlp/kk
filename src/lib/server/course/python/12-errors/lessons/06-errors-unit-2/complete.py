def parse_level(text):
    try:
        return int(text)
    except ValueError:
        return 0
