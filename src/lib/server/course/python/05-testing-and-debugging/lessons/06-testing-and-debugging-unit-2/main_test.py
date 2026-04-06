import unittest

from main import is_even


class IsEvenTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(is_even(4), True)
        self.assertEqual(is_even(5), False)


if __name__ == "__main__":
    unittest.main()
