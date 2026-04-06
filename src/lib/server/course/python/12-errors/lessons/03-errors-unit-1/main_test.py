import unittest

from main import safe_divide


class SafeDivideTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(safe_divide(10, 0), 0)
        self.assertEqual(safe_divide(10, 2), 5)


if __name__ == "__main__":
    unittest.main()
