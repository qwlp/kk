import unittest

from main import is_weekend


class IsWeekendTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(is_weekend("Sat"), True)
        self.assertEqual(is_weekend("Mon"), False)


if __name__ == "__main__":
    unittest.main()
