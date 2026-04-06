import unittest

from main import is_old_enough


class IsOldEnoughTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(is_old_enough(17), False)
        self.assertEqual(is_old_enough(18), True)


if __name__ == "__main__":
    unittest.main()
