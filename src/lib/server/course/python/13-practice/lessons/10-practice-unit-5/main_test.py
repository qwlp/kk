import unittest

from main import can_craft


class CanCraftTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(can_craft({"wood": 3, "ore": 2}, {"wood": 2, "ore": 1}), True)
        self.assertEqual(can_craft({"wood": 1}, {"wood": 2}), False)


if __name__ == "__main__":
    unittest.main()
