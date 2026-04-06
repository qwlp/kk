import unittest

from main import has_item


class HasItemTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(has_item({"potion": 2}, "potion"), True)
        self.assertEqual(has_item({"potion": 2}, "key"), False)


if __name__ == "__main__":
    unittest.main()
