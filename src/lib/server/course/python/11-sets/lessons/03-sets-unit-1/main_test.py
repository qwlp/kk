import unittest

from main import unique_count


class UniqueCountTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(unique_count(["a", "a", "b"]), 2)
        self.assertEqual(unique_count([]), 0)


if __name__ == "__main__":
    unittest.main()
