#!/usr/bin/env python3

import bnet
import json
import logging
import sys

IGNORE_MOUNT_IDS = [
    # Never actually added
    7,  # Gray Wolf https://www.wowhead.com/mount/7
    8,  # White Stallion https://www.wowhead.com/mount/8
    12,  # Black Wolf https://www.wowhead.com/mount/12
    13,  # Red Wolf https://www.wowhead.com/mount/13
    15,  # Winter Wolf https://www.wowhead.com/mount/15
    22,  # Black Ram https://www.wowhead.com/mount/22
    28,  # Skeletal Horse https://www.wowhead.com/mount/28
    32,  # Tiger https://www.wowhead.com/mount/32
    35,  # Ivory Raptor https://www.wowhead.com/mount/35
    43,  # Green Mechanostrider https://www.wowhead.com/mount/43
    70,  # Riding Kodo https://www.wowhead.com/mount/70
    123,  # Nether Drake https://www.wowhead.com/mount/123
    145,  # Blue Mechanostrider https://www.wowhead.com/mount/145
    206,  # Merciless Nether Drake https://www.wowhead.com/mount/206
    222,  # Swift Zhevra https://www.wowhead.com/mount/222
    225,  # Brewfest Riding Kodo https://www.wowhead.com/mount/225
    238,  # Swift Spectral Gryphon https://www.wowhead.com/mount/238
    251,  # Black Polar Bear https://www.wowhead.com/mount/251
    273,  # Grand Caravan Mammoth https://www.wowhead.com/mount/273
    274,  # Grand Caravan Mammoth https://www.wowhead.com/mount/274
    293,  # Black Dragonhawk Mount https://www.wowhead.com/mount/293
    308,  # Blue Skeletal Warhorse https://www.wowhead.com/mount/308
    333,  # Magic Rooster https://www.wowhead.com/mount/333
    334,  # Magic Rooster https://www.wowhead.com/mount/334
    335,  # Magic Rooster https://www.wowhead.com/mount/335
    462,  # White Riding Yak https://www.wowhead.com/mount/462
    484,  # Black Riding Yak https://www.wowhead.com/mount/484
    485,  # Brown Riding Yak https://www.wowhead.com/mount/485
    776,  # Swift Spectral Rylak https://www.wowhead.com/mount/776
    934,  # Swift Spectral Hippogryph https://www.wowhead.com/mount/934
    935,  # Blue Qiraji War Tank https://www.wowhead.com/mount/935
    936,  # Red Qiraji War Tank https://www.wowhead.com/mount/936
    1269,  # Swift Spectral Fathom Ray https://www.wowhead.com/mount/1269
    1270,  # Swift Spectral Magnetocraft https://www.wowhead.com/mount/1270
    1271,  # Swift Spectral Armored Gryphon https://www.wowhead.com/mount/1271
    1272,  # Swift Spectral Pterrordax https://www.wowhead.com/mount/1272
]


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


class MountFixer:
    def __init__(self, battle_net_mounts, mounts):
        self.battle_net_mounts = battle_net_mounts['mounts']
        self.mounts = mounts
        self.known_mount_ids = {}

        self.register_old_mounts()

    def register_old_mounts(self):
        """Reads the mounts from the mounts.json and adds them to a list of already added mounts"""
        for category in self.mounts:
            for sub_category in category['subcats']:
                for item in sub_category['items']:
                    self.known_mount_ids[int(item['ID'])] = item

    def fix_missing(self):
        """Matches the already added mounts against the mounts from the battle.net API and outputs the missing mounts"""
        mounts_to_add = []
        for mount in self.battle_net_mounts:
            mount_id = int(mount['id'])

            if mount_id not in self.known_mount_ids and mount_id not in IGNORE_MOUNT_IDS:
                changelog('Mount {} missing: {} https://www.wowhead.com/mount/{}'.format(mount_id, mount['name'], mount['id']))
                mounts_to_add.append({
                    'name': mount['name'],
                    'ID': mount['id']
                })
        json.dump(mounts_to_add, sys.stdout, indent=2, sort_keys=True)

    def run(self):
        self.fix_missing()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        sys.exit("Usage: {} mounts.json")

    battle_net_mounts = bnet.get_master_list('mounts')
    mounts = json.load(open(sys.argv[1]))

    fixer = MountFixer(battle_net_mounts, mounts)
    fixer.run()
