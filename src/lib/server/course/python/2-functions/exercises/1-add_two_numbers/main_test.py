import unittest

from main import add


class AddTests(unittest.TestCase):
    def test_small_numbers(self):
        self.assertEqual(add(1, 2), 3)

    def test_negative_numbers(self):
        self.assertEqual(add(-5, 7), 2)


if __name__ == "__main__":
    unittest.main()
