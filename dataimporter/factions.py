#!/usr/bin/env python3

from .tools import find_or_create_item, changelog
from .fixer import WowToolsFixer


IGNORE_FACTION_ID = [
    949,   # Test Faction 1

    # Never implemented
    1888,  # Jandvik Vryul
    2111,  # Zandalari Dinosaurs
    1351,  # The Brewmasters
    1416,  # Akama's Trust
    1440,  # Darkspear Rebellion

    # TODO: we probably should integrate those at some point, as they are all
    # real reputations that do display correctly in the reputation panel.

    # Brawlpub
    1691,  # Bizmo's Brawlpub (Season 2)
    2011,  # Bizmo's Brawlpub (Season 3)
    2371,  # Bizmo's Brawlpub
    1690,  # Brawl'gar Arena (Season 2)
    2010,  # Brawl'gar Arena (Season 3)
    2372,  # Brawl'gar Arena

    # Garrison Bodyguards
    1733,  # Delvar Ironfist
    1736,  # Tormmok
    1737,  # Talonpriest Ishaal
    1738,  # Defender Illona
    1739,  # Vivianne
    1740,  # Aeda Brightdawn
    1741,  # Leorajh

    # Venthyr Ember Court
    2446,  # Baroness Vashj
    2447,  # Lady Moonberry
    2448,  # Mikanikos
    2449,  # The Countess
    2450,  # Alexandros Mograine
    2451,  # Hunt-Captain Korayn
    2452,  # Polemarch Adrestes
    2453,  # Rendle and Cudgelface
    2454,  # Choofa
    2455,  # Cryptkeeper Kassir
    2456,  # Droman Aliothe
    2457,  # Grandmaster Vole
    2458,  # Kleia and Pelagos
    2459,  # Sika
    2460,  # Stonehead
    2461,  # Plague Deviser Marileth

    # Necrolord Abomination Factory
    2462,  # Stitchmasters
]


def fcat(dct, cat=None):
    if cat is not None:
        res = find_or_create_item(dct, cat, 'factions')
    return res


class FactionFixer(WowToolsFixer):
    def _store_init(self, factions):
        self.factions = factions
        self.id_to_old_faction = {}
        self.wt_faction = {}
        self.register_wt_factions()
        self.register_old_factions()

    def register_wt_factions(self):
        wt_faction = {
            int(e['ID']): e for e in self.wt_get_table('faction')
        }

        # Remove paragons
        paragons = {
            int(row['ParagonFactionID']) for row in wt_faction.values()
        }
        for row in list(wt_faction.values()):
            if int(row['ID']) in paragons:
                wt_faction.pop(int(row['ID']))

        # Heuristic to remove hidden reputations
        def _recurse_rep(faction_id, level=0):
            children = [
                row for row in wt_faction.values()
                if int(row['ParentFactionID']) == faction_id
            ]

            if faction_id != 0:
                rep = wt_faction[faction_id]
                if (
                    # Filters most invalid reputations
                    int(rep['ReputationIndex']) == -1

                    # Filters blacklisted reputations
                    or int(rep['ID']) in IGNORE_FACTION_ID

                    # Filters invalid top-level reputations
                    or (
                        level <= 1 and not int(rep['ReputationFlags[0]']) & 0x8
                    )

                    # Filters most remaining hidden reputations
                    or (
                        not children
                        and int(rep['ReputationFlags[0]']) & 0x4

                        # Exceptions with 0x4 hidden flag set but still
                        # visible.
                        and not int(rep['ReputationFlags[0]']) & 0x2
                    )
                ):
                    return

            if not children:
                self.wt_faction[int(rep['ID'])] = rep

            for row in children:
                _recurse_rep(int(row['ID']), level + 1)

        _recurse_rep(0)

    def register_old_factions(self):
        for cat in self.factions:
            for item in cat['factions']:
                self.id_to_old_faction[int(item['id'])] = item

    def get_faction(self, faction_id: int):
        if int(faction_id) not in self.wt_faction:
            return None
        name = self.wt_faction[int(faction_id)]['Name_lang']
        return {
            'id': int(faction_id),
            'name': name,
        }

    def fix_missing_faction(self, faction_id: int):
        faction = self.get_faction(faction_id)
        changelog(
            f"Faction {faction_id} \"{faction['name']}\" missing:"
            f" https://www.wowhead.com/faction={faction_id}"
        )
        fcat(self.factions, 'TODO')['factions'].append(faction)

    def fix_missing_factions(self):
        for faction_id in self.wt_faction:
            if int(faction_id) not in self.id_to_old_faction:
                self.fix_missing_faction(int(faction_id))

    def fix_types_data(self):
        for cat in self.factions:
            for faction in cat['factions']:
                fixed_faction = self.get_faction(int(faction['id']))
                if fixed_faction:
                    faction['id'] = fixed_faction['id']
                    faction['name'] = fixed_faction['name']
                else:
                    faction['id'] = int(faction['id'])

    def run(self):
        self.fix_missing_factions()
        self.fix_types_data()
        return [self.factions]
