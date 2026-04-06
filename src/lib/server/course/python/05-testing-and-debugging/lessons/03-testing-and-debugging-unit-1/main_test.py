import unittest

from main import add_reward


class AddRewardTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(add_reward(1), 6)
        self.assertEqual(add_reward(0), 5)


if __name__ == "__main__":
    unittest.main()
