#!/usr/bin/env python3

import collections

from .tools import find_or_create_item, changelog
from .fixer import WowToolsFixer


IGNORE_FACTION_ID = [
    949,   # Test Faction 1

    # Never implemented
    1351,  # The Brewmasters
    1416,  # Akama's Trust
    1440,  # Darkspear Rebellion
    1888,  # Jandvik Vryul
    2111,  # Zandalari Dinosaurs
    2469,  # Fractal Lore
]


def fcat(dct, cat=None):
    if cat is not None:
        res = find_or_create_item(dct, cat, 'factions')
    return res


class FactionFixer(WowToolsFixer):
    def _store_init(self, factions):
        self.factions = factions
        self.id_to_old_faction = {}
        self.dbc_faction = {}
        self.register_dbc_factions()
        self.register_old_factions()

    def register_dbc_factions(self):
        self.dbc_friendship = collections.defaultdict(list)
        for e in self.dbc_get_table('friendshiprepreaction'):
            self.dbc_friendship[int(e['FriendshipRepID'])].append(e)

        dbc_faction = {
            int(e['ID']): e for e in self.dbc_get_table('faction')
        }

        # Remove paragons
        paragons = {
            int(row['ParagonFactionID']) for row in dbc_faction.values()
        }
        for row in list(dbc_faction.values()):
            if int(row['ID']) in paragons:
                dbc_faction.pop(int(row['ID']))

        # Heuristic to remove hidden reputations
        def _recurse_rep(faction_id, level=0):
            children = [
                row for row in dbc_faction.values()
                if int(row['ParentFactionID']) == faction_id
            ]

            if faction_id != 0:
                rep = dbc_faction[faction_id]
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
                self.dbc_faction[int(rep['ID'])] = rep

            for row in children:
                _recurse_rep(int(row['ID']), level + 1)

        _recurse_rep(0)

    def register_old_factions(self):
        for cat in self.factions:
            for item in cat['factions']:
                self.id_to_old_faction[int(item['id'])] = item

    def get_faction(self, faction_id: int):
        if int(faction_id) not in self.dbc_faction:
            return None
        name = self.dbc_faction[int(faction_id)]['Name_lang']
        res = {
            'id': int(faction_id),
            'name': name,
        }
        friendship_id = int(
            self.dbc_faction[int(faction_id)]['FriendshipRepID']
        )
        if friendship_id != 0:
            res['levels'] = {
                int(r['ReactionThreshold']): r['Reaction_lang']
                for r in self.dbc_friendship[friendship_id]
            }
        return res

    def fix_missing_faction(self, faction_id: int):
        faction = self.get_faction(faction_id)
        changelog(
            f"Faction {faction_id} \"{faction['name']}\" missing:"
            f" https://www.wowhead.com/faction={faction_id}"
        )
        fcat(self.factions, 'TODO')['factions'].append(faction)

    def fix_missing_factions(self):
        for faction_id in self.dbc_faction:
            if int(faction_id) not in self.id_to_old_faction:
                self.fix_missing_faction(int(faction_id))

    def fix_types_data(self):
        for cat in self.factions:
            for faction in cat['factions']:
                fixed_faction = self.get_faction(int(faction['id']))
                if fixed_faction:
                    faction['id'] = fixed_faction['id']
                    faction['name'] = fixed_faction['name']
                    if 'levels' in fixed_faction:
                        faction['levels'] = fixed_faction['levels']
                else:
                    faction['id'] = int(faction['id'])

    def run(self):
        self.fix_missing_factions()
        self.fix_types_data()
        return [self.factions]
