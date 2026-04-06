import unittest

from main import has_duplicates


class HasDuplicatesTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(has_duplicates([1, 1, 2]), True)
        self.assertEqual(has_duplicates([1, 2, 3]), False)


if __name__ == "__main__":
    unittest.main()
