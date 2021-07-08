#!/usr/bin/env python3

import logging
import sys
import bnet
import json

IGNORE_FACTIONS = [
    67, # Horde
    169, # Steamwheedle Cartel,
    469, # Alliance
    891, # Alliance Forces
    892, # Horde Forces
    936, # Shattrath City
    980, # The Burning Crusade
    1097, # Wrath of the Lich King
    1117, # Sholazar Basin
    1118, # Classic
    1162, # Cataclysm
    1169, # Guild
    1245, # Mists of Pandaria
    1416, # Akama's Trust
    1440, # Darkspear Rebellion
    1444, # Warlords of Draenor
    1690, # Brawl'Gar Arena (Season 2)
    1691, # Bizmo's Brawlpub (Season 2)
    1733, # Delvar Ironfist
    1735, # Barracks Bodyguards
    1736, # Tormmok
    1737, # Talonpriest Ishaal
    1738, # Defender Illona
    1739, # Vivianne
    1740, # Aeda Brightdawn
    1741, # Leorajh
    1834, # Legion
    2010, # Brawl'gar Arena (Season 3)
    2011, # Bizmo's Brawlpub (Season 3)
    2104, # Battle for Azeroth
    2371, # Bizmo's Brawlpub
    2372, # Brawlgar Arena
    2395, # Honeyback Hive
    2414 # Shadowlands
]

class FactionsFixer:
    def __init__(self, factions_from_api, current_factions):
        self.factions_from_api = factions_from_api['factions']
        self.current_factions = current_factions
        self.registered_factions = {}

        self.register_old_factions()

    def register_old_factions(self):
        for category in current_factions:
            for faction in category['factions']:
                self.registered_factions[int(faction['id'])] = faction

    def fix(self):
        missing_factions = []
        for faction in self.factions_from_api:
            if faction['id'] not in self.registered_factions and faction['id'] not in IGNORE_FACTIONS:
                missing_factions.append(faction)

        json.dump(missing_factions, sys.stdout, indent=2, sort_keys=True)

    def run(self):
        self.fix()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        sys.exit('Usage: {} factions.json')

    factions_from_api = bnet.get_master_list('factions')
    current_factions = json.load(open(sys.argv[1]))

    fixer = FactionsFixer(factions_from_api, current_factions)
    fixer.run()
