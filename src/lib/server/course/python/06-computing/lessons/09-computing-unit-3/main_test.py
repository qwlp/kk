import unittest

from main import has_enough_memory


class HasEnoughMemoryTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(has_enough_memory(128, 256), True)
        self.assertEqual(has_enough_memory(512, 256), False)


if __name__ == "__main__":
    unittest.main()
