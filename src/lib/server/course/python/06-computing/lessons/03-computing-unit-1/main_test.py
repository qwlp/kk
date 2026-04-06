import unittest

from main import bits_to_bytes


class BitsToBytesTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(bits_to_bytes(8), 1)
        self.assertEqual(bits_to_bytes(32), 4)


if __name__ == "__main__":
    unittest.main()
