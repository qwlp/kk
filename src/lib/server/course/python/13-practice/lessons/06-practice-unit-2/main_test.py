import unittest

from main import filter_unlocked


class FilterUnlockedTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(filter_unlocked([1, 3, 5], 3), [3, 5])
        self.assertEqual(filter_unlocked([1, 2], 5), [])


if __name__ == "__main__":
    unittest.main()
