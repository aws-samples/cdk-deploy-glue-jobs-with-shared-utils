from utils import utils


def test_join_path():
    actual_result = utils.join_path("a", "b")
    assert actual_result == "a/b"
