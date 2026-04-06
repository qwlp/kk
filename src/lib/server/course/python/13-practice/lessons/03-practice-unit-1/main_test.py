import unittest

from main import average


class AverageTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(average([2, 4, 6]), 4)
        self.assertEqual(average([]), 0)


if __name__ == "__main__":
    unittest.main()
