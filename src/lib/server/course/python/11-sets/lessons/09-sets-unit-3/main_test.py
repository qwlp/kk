import unittest

from main import shared_items


class SharedItemsTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(shared_items({"axe", "bow"}, {"bow", "staff"}), {"bow"})
        self.assertEqual(shared_items({"axe"}, {"staff"}), set())


if __name__ == "__main__":
    unittest.main()
