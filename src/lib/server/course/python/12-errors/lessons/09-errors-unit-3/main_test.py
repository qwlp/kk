import unittest

from main import first_item


class FirstItemTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(first_item([1, 2, 3]), 1)
        self.assertEqual(first_item([]), None)


if __name__ == "__main__":
    unittest.main()
