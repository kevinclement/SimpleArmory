#!/usr/bin/env python3

import asyncio
import binascii
import bnet
import json
import os
import logging
import sys


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


def list_find(L, pred):
    return next(item for item in L if pred(item))


def genid():
    return binascii.b2a_hex(os.urandom(4)).decode('ascii')


def media_to_icon(media):
    bnet_icon = media['assets'][0]['value']
    bnet_icon = bnet_icon[:-len('.jpg')]
    bnet_icon = bnet_icon.split('/')[-1]
    return bnet_icon


class ToyFixer:
    def __init__(self, toys):
        self.toys = toys
        self.id_to_old_toy = {}

        self.register_old_toys()

    def cat(self, dct, cat=None, subcat=None):
        def try_find_create(L, name, items=None):
            try:
                return list_find(L, lambda x: x['name'] == name)
            except StopIteration:
                d = {'id': genid(), 'name': name}
                if items:
                    d[items] = []
                L.append(d)
                return d

        if cat is not None:
            res = try_find_create(dct, cat, 'subcats')
        if subcat is not None:
            res = try_find_create(res['subcats'], subcat, 'items')
        return res

    def register_old_toys(self):
        for cat in self.toys:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_toy[int(item['itemId'])] = item

    async def retrieve_missing_toy(self, sem, bnetc, toy_id):
        async with sem:
            r = await bnetc.item(toy_id)
            media = await bnetc.item_media(toy_id)
            icon = media_to_icon(media)
            toy = {'itemId': toy_id, 'name': r['name'], 'icon': icon}
            self.cat(self.toys, 'TODO', 'TODO')['items'].append(toy)

    async def retrieve_missing_toys(self, missing):
        sem = asyncio.Semaphore(10)  # 10 parallel requests
        tasks = []

        async with bnet.BnetClient() as bnetc:
            for toy in missing:
                if toy not in self.id_to_old_toy:
                    tasks.append(self.retrieve_missing_toy(sem, bnetc, toy))
                    changelog('Toy {} missing: https://www.wowhead.com/item={}'
                              .format(toy, toy))
            await asyncio.gather(*tasks)

    def fix_missing(self):
        answer = input('Paste (or pipe if >4096) the SA toy export string: ')
        toy_list = json.loads(answer)
        asyncio.run(self.retrieve_missing_toys(toy_list))

    def run(self):
        self.fix_missing()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        sys.exit("Usage: {} toys.json")

    with open(sys.argv[1]) as toys_file:
        toys = json.load(toys_file)

    fixer = ToyFixer(toys)
    fixer.run()

    with open(sys.argv[1], 'w') as toys_file:
        json.dump(fixer.toys, toys_file, indent=2, sort_keys=True)
