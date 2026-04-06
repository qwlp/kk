import unittest

from main import smallest


class SmallestTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(smallest([5, 2, 9]), 2)
        self.assertEqual(smallest([0, -1, 4]), -1)


if __name__ == "__main__":
    unittest.main()
