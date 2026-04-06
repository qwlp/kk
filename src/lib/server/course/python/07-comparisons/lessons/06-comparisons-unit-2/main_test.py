import unittest

from main import can_carry


class CanCarryTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(can_carry(8, 10), True)
        self.assertEqual(can_carry(12, 10), False)


if __name__ == "__main__":
    unittest.main()
