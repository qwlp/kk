import unittest

from main import count_even


class CountEvenTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(count_even([1, 2, 4]), 2)
        self.assertEqual(count_even([1, 3, 5]), 0)


if __name__ == "__main__":
    unittest.main()
