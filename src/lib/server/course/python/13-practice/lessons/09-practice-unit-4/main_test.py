import unittest

from main import top_score


class TopScoreTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(top_score([2, 9, 5]), 9)
        self.assertEqual(top_score([]), 0)


if __name__ == "__main__":
    unittest.main()
