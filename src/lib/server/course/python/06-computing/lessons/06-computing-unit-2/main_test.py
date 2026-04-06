import unittest

from main import kilobytes_to_bytes


class KilobytesToBytesTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(kilobytes_to_bytes(1), 1024)
        self.assertEqual(kilobytes_to_bytes(3), 3072)


if __name__ == "__main__":
    unittest.main()
