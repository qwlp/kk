def count_even(nums):
    count = 0
    for num in nums:
        if num % 2 == 0:
            count = count + 1
    return count
