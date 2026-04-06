import unittest

from main import inventory_total


class InventoryTotalTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(inventory_total({"potion": 2, "key": 1}), 3)
        self.assertEqual(inventory_total({}), 0)


if __name__ == "__main__":
    unittest.main()
