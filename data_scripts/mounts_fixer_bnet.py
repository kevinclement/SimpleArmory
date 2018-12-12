#!/usr/bin/env python3

import json
import logging
import sys


IGNORE_MOUNT_SPELLIDS = [
    # Never actually added
    10788,   # Leopard https://www.wowhead.com/item=8633
    10790,   # Tiger https://www.wowhead.com/item=8630
    61289,   # Borrowed Broom https://www.wowhead.com/item=44604
    123160,  # Crimson Riding Crane https://www.wowhead.com/item=84728
    123182,  # White Riding Yak https://www.wowhead.com/item=84753
    127178,  # Jungle Riding Crane https://www.wowhead.com/item=87784
    127180,  # Albino Riding Crane https://www.wowhead.com/item=87785
    127209,  # Black Riding Yak https://www.wowhead.com/item=87786
    127213,  # Brown Riding Yak https://www.wowhead.com/item=87787
    127272,  # Orange Water Strider https://www.wowhead.com/item=87792
    127274,  # Jade Water Strider https://www.wowhead.com/item=87793
    127278,  # Golden Water Strider https://www.wowhead.com/item=87794
    147595,  # Stormcrow https://www.wowhead.com/item=104011
    171618,  # Ancient Leatherhide https://www.wowhead.com/item=116657
    176762,  # Iron Star Roller https://www.wowhead.com/item=119179
    278656,  # Spectral Phoenix https://www.wowhead.com/item=163063
    278966,  # Tempestuous Skystallion https://www.wowhead.com/item=163186

    # Mounts that cannot be learned in the journal
    47977,   # Magic Broom https://www.wowhead.com/item=37011
    145133,  # Moonfang https://www.wowhead.com/item=101675
    239766,  # Blue Qiraji War Tank https://www.wowhead.com/item=151626
    239767,  # Red Qiraji War Tank https://www.wowhead.com/item=151625

    # Consumable mounts
    68768,   # Little White Stallion https://www.wowhead.com/item=49289
    68769,   # Little Ivory Raptor https://www.wowhead.com/item=49288
    130678,  # Unruly Behemoth https://www.wowhead.com/item=89682
    130730,  # Kafa-Crazed Goat https://www.wowhead.com/item=89697
    130895,  # Rampaging Yak https://www.wowhead.com/item=89770

    # Toy mounts
    254545,  # Baarut the Brisk https://www.wowhead.com/item=153193
    176759,  # Goren "Log" Roller https://www.wowhead.com/item=119180
    148626,  # Furious Ashhide Mushan https://www.wowhead.com/item=104329
    174004,  # Spirit of Shinri https://www.wowhead.com/item=113543

    # "GM mistake" mounts
    17458,   # Fluorescent Green Mechanostrider
             # https://www.wowhead.com/item=13325

    # Mounts in armor/weapons
    101641,  # Tarecgosa's Visage https://www.wowhead.com/item=71086

    # Replaced mounts marked as [OLD]
    48954,   # Swift Zhevra https://www.wowhead.com/item=37598
]


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


class MountFixer:
    def __init__(self, bnet_mounts, mounts):
        self.bnet_mounts = bnet_mounts
        self.mounts = mounts
        self.id_to_old_mount = {}

        self.register_old_mounts()

    def register_old_mounts(self):
        for cat in self.mounts:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_mount[int(item['spellid'])] = item

    def fix_missing(self):
        mounts_to_add = []
        for mount in self.bnet_mounts['mounts']:
            if not mount['itemId']:
                # Not a real obtainable mount
                continue
            spellid = int(mount['spellId'])
            if ((spellid not in self.id_to_old_mount
                 and spellid not in IGNORE_MOUNT_SPELLIDS)):
                changelog('Mount {} missing: {} '
                          'https://www.wowhead.com/item={}'
                          .format(spellid, mount['name'], mount['itemId']))
                mounts_to_add.append({
                    'name': mount['name'],
                    'spellid': mount['spellId'],
                    'itemId': mount['itemId'],
                    'icon': mount['icon'],
                })
        json.dump(mounts_to_add, sys.stdout, indent=2, sort_keys=True)

    def run(self):
        self.fix_missing()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 3:
        sys.exit("Usage: {} bnet_mounts.json mounts.json")

    bnet_mounts = json.load(open(sys.argv[1]))
    mounts = json.load(open(sys.argv[2]))

    fixer = MountFixer(bnet_mounts, mounts)
    fixer.run()
