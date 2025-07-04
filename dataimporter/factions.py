#!/usr/bin/env python3

import collections

from .tools import find_or_create_item, changelog
from .fixer import WowToolsFixer


IGNORE_FACTION_ID = [
    949,   # Test Faction 1
    1072,  # [DNT] AC Major Faction Child Renown Test

    # Never implemented
    1351,  # The Brewmasters
    1416,  # Akama's Trust
    1440,  # Darkspear Rebellion
    1888,  # Jandvik Vryul
    2111,  # Zandalari Dinosaurs
    2469,  # Fractal Lore
]


def fcat(dct, cat=None):
    res = None
    if cat is not None:
        res = find_or_create_item(dct, cat, 'factions')
    return res


class FactionFixer(WowToolsFixer):
    def _store_init(self, *args):
        factions = args[0]
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

            rep = None
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

            if not children and rep is not None:
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
        if faction is not None:
            changelog(
                f"Faction {faction_id} \"{faction['name']}\" missing:"
                f" https://www.wowhead.com/faction={faction_id}"
            )
            todo_cat = fcat(self.factions, 'TODO')
            if todo_cat is not None:
                todo_cat['factions'].append(faction)
        else:
            changelog(
                f"Faction {faction_id} missing: https://www.wowhead.com/faction={faction_id}"
            )

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

    def fix_max_renown(self):
        # Add renown information to reputations with a renown system
        # such as the main factions in Dragonflight.
        dbc_faction_to_covenant = {
            int(e['FactionID']): int(e['ID']) for e in self.dbc_get_table('covenant')
        }

        # Compute the maximum renown for each covenant
        max_reward_for_covenant = {}
        for row in self.dbc_get_table('renownrewards'):
            covenant_id = int(row['CovenantID'])
            if covenant_id not in max_reward_for_covenant:
                max_reward_for_covenant[covenant_id] = int(row['Level'])
            else:
                max_reward_for_covenant[covenant_id] = max(int(row['Level']), max_reward_for_covenant[covenant_id])

        # Populate the 'renown' object for every renown faction
        for cat in self.factions:
            for faction in cat['factions']:
                faction_id = faction['id']

                # DBC faction flag 2 indicates that it is a "renown faction".
                # Some valid renown factions filtered from the self.dbc_faction
                # (e.g. Maruuk Centaur and Valdrakken Accord which have child factions)
                # but can still be computed automatically if they have a 'renown'
                # property in the JSON.
                if (
                    faction_id in dbc_faction_to_covenant
                    and (
                        (
                            faction_id in self.dbc_faction
                            and int(self.dbc_faction[faction_id]['Flags']) == 2
                        )

                        or 'renown' in faction
                    )
                ):
                    if 'renown' not in faction:
                        faction['renown'] = dict()

                    if faction_id in self.dbc_faction:
                        faction['renown']['step'] = int(self.dbc_faction[faction_id]['ReputationMax[0]'])

                    faction['renown']['max'] = max_reward_for_covenant[dbc_faction_to_covenant[faction_id]]

    def run(self):
        self.fix_missing_factions()
        self.fix_types_data()
        self.fix_max_renown()
        return [self.factions]
