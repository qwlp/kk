import unittest

from main import parse_level


class ParseLevelTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(parse_level("7"), 7)
        self.assertEqual(parse_level("oops"), 0)


if __name__ == "__main__":
    unittest.main()
