import unittest

from main import total_items


class TotalItemsTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(total_items({"potion": 2, "key": 1}), 3)
        self.assertEqual(total_items({}), 0)


if __name__ == "__main__":
    unittest.main()
