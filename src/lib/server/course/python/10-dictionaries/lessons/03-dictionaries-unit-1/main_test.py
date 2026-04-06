import unittest

from main import get_score


class GetScoreTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(get_score({"score": 9}), 9)
        self.assertEqual(get_score({"score": 0}), 0)


if __name__ == "__main__":
    unittest.main()
