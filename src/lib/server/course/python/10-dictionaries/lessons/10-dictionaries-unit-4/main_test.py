import unittest

from main import describe_player


class DescribePlayerTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(describe_player({"name": "Ayla", "level": 3}), "Ayla is level 3")
        self.assertEqual(describe_player({"name": "Kai", "level": 7}), "Kai is level 7")


if __name__ == "__main__":
    unittest.main()
