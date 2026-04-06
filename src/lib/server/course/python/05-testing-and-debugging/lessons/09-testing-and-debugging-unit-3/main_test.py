import unittest

from main import format_item


class FormatItemTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(format_item("potion"), "Item: potion")
        self.assertEqual(format_item("key"), "Item: key")


if __name__ == "__main__":
    unittest.main()
