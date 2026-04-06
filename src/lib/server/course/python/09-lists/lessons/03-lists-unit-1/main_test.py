import unittest

from main import get_last_item


class GetLastItemTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(get_last_item(["axe", "bow"]), "bow")
        self.assertEqual(get_last_item([1, 2, 3]), 3)


if __name__ == "__main__":
    unittest.main()
