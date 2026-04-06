import unittest

from main import new_badges


class NewBadgesTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(new_badges({"bronze", "silver"}, {"bronze"}), {"silver"})
        self.assertEqual(new_badges({"bronze"}, {"bronze"}), set())


if __name__ == "__main__":
    unittest.main()
