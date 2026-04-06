import unittest

from main import sum_coins


class SumCoinsTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(sum_coins([1, 2, 3]), 6)
        self.assertEqual(sum_coins([]), 0)


if __name__ == "__main__":
    unittest.main()
