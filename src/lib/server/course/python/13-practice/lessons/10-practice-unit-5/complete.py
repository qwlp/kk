def can_craft(bag, recipe):
    for item, needed in recipe.items():
        if bag.get(item, 0) < needed:
            return False
    return True
