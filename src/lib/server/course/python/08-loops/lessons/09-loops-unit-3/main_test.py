import unittest

from main import repeat_word


class RepeatWordTest(unittest.TestCase):
    def test_public_cases(self):
        self.assertEqual(repeat_word("ha", 2), "haha")
        self.assertEqual(repeat_word("go", 0), "")


if __name__ == "__main__":
    unittest.main()
