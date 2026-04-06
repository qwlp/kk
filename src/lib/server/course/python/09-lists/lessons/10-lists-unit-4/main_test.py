import unittest

from main import join_names


class JoinNamesTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(join_names(["Ayla", "Kai"]), "Ayla, Kai")
        self.assertEqual(join_names(["Solo"]), "Solo")


if __name__ == "__main__":
    unittest.main()
