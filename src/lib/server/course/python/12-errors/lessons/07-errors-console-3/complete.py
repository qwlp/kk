text = "oops"
try:
    print(int(text))
except ValueError:
    print("invalid number")
