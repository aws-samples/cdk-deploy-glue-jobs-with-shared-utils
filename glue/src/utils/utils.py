from functools import reduce


def join_path(*args):
    def _join_path(head, tail):
        if head[-1] == "/" and tail[0] == "/":
            return f"{head}{tail[1:]}"
        elif head[-1] != "/" and tail[0] != "/":
            return f"{head}/{tail}"
        else:
            return f"{head}{tail}"

    return reduce(_join_path, args)
