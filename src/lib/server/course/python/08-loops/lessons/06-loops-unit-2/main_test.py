import unittest

from main import count_big_scores


class CountBigScoresTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(count_big_scores([5, 10, 12]), 2)
        self.assertEqual(count_big_scores([1, 2, 3]), 0)


if __name__ == "__main__":
    unittest.main()
