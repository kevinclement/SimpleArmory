#!/usr/bin/env python3

import json
import logging
import sys


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


class ToyFixer:
    def __init__(self, toys):
        self.toys = toys
        self.id_to_old_toy = {}

        self.register_old_toys()

    def register_old_toys(self):
        for cat in self.toys:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_toy[int(item['itemId'])] = item

    def fix_missing(self):
        answer = input('Paste the SA toy export string: ')
        toy_list = json.loads(answer)
        for toy in toy_list:
            if toy not in self.id_to_old_toy:
                changelog('Toy {} missing: https://www.wowhead.com/item={}'
                          .format(toy, toy))

    def run(self):
        self.fix_missing()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        sys.exit("Usage: {} toys.json")

    toys = json.load(open(sys.argv[1]))

    fixer = ToyFixer(toys)
    fixer.run()
