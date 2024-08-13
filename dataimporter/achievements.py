#!/usr/bin/env python3

import collections

from .fixer import WowToolsFixer
from .tools import (changelog, genid, filter_del, sort_try_respect_order,
                    iscat, list_find)


IGNORE_ACHIEV_ID = [
    7268,
    7269,
    7270,
    40265,
    40652,
    40653,
    40654,
]


class AchievementFixer(WowToolsFixer):
    def _store_init(self, achievements):
        self.id_to_sa_ach = {}
        self.achievs = achievements

        self.register_sa_achievs()
        self.register_dbc_achievs()

    def register_dbc_achievs(self):
        self.dbc_achiev = {
            int(e['ID']): e for e in self.dbc_get_table('achievement')
        }
        self.dbc_achiev_category = {
            int(e['ID']): e for e in self.dbc_get_table('achievement_category')
        }

        # Remove hidden/ignored achievements from master list
        for ach_id, ach in list(self.dbc_achiev.items()):
            blacklisted_flags = (
                0x1  # COUNTER (Statistics)
                | 0x4000  # GUILD
                | 0x100000  # TRACKING_FLAG
            )
            flags = int(self.dbc_achiev[ach_id]['Flags'])
            if (ach_id in IGNORE_ACHIEV_ID or flags & blacklisted_flags):
                self.dbc_achiev.pop(ach_id)
                continue

        # Build Achiev ID -> (supercat, cat) mapping
        self.id_to_cat = {}
        for achiev in self.dbc_achiev.values():
            cat = self.dbc_achiev_category[int(achiev['Category'])]
            if int(cat['Parent']) == -1:
                supercat = cat
            else:
                supercat = self.dbc_achiev_category[int(cat['Parent'])]
            self.id_to_cat[int(achiev['ID'])] = (
                supercat['Name_lang'], cat['Name_lang'],
            )

    def register_sa_achievs(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        self.id_to_sa_ach[int(item['id'])] = item

    def get_faction(self, ach_id: int):
        dbc_ach = self.dbc_achiev[int(ach_id)]
        return {
            0: 'H',
            1: 'A',
        }.get(int(dbc_ach['Faction']))

    def genach(self, ach_id):
        ach_id = int(ach_id)
        if ach_id in self.id_to_sa_ach:
            return self.id_to_sa_ach[ach_id]
        else:
            dbc_ach = self.dbc_achiev[ach_id]
            faction = self.get_faction(ach_id)
            return {
                'id': int(ach_id),
                'title': dbc_ach['Title_lang'],
                'icon': self.get_icon_name(int(dbc_ach['IconFileID'])),
                'points': int(dbc_ach['Points']),
                **({'side': faction} if faction else {})
            }

    def delete_removed_achievements(self):
        ach_deleted = []
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    subcat['items'] = filter_del(
                        subcat['items'],
                        lambda item: int(item['id']) in self.id_to_cat,
                        ach_deleted, lambda item: str(item['id'])
                    )
        if ach_deleted:
            changelog("* Deleted removed achievements: {}"
                      .format(', '.join(ach_deleted)))

    def del_empty(self):
        # Delete empty subcategories
        deleted_subc = []
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                cat['subcats'] = filter_del(
                    cat['subcats'], lambda item: bool(item['items']),
                    deleted_subc,
                    lambda item: '  - {} > {} > {}'.format(
                        supercat['name'], cat['name'], item['name'])
                )
        if deleted_subc:
            changelog("* Deleted sub-categories:\n{}"
                      .format('\n'.join(deleted_subc)))

        # Delete empty categories
        deleted_cats = []
        for supercat in self.achievs['supercats']:
            supercat['cats'] = filter_del(
                supercat['cats'], lambda item: bool(item['subcats']),
                deleted_cats,
                lambda item: '  - {} > {}'.format(
                    supercat['name'], item['name'])
            )
        if deleted_cats:
            changelog("* Deleted categories:\n{}"
                      .format('\n'.join(deleted_cats)))

        # Delete empty supercategories
        deleted_supcats = []
        self.achievs['supercats'] = filter_del(
            self.achievs['supercats'], lambda item: bool(item['cats']),
            deleted_supcats,
            lambda item: '  - {}'.format(item['name'])
        )
        if deleted_supcats:
            changelog("* Deleted super-categories:\n{}"
                      .format('\n'.join(deleted_supcats)))

    def fix_moved_subcategories(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                subcat_to_remove = set()
                for i, subcat in enumerate(cat['subcats']):
                    expected = (supercat['name'], cat['name'])
                    id_list = [int(item['id']) for item in subcat['items']]
                    ach_to_idx = {int(item['id']): idx
                                  for idx, item in enumerate(subcat['items'])}
                    if not id_list:
                        continue
                    path_to_achs = collections.defaultdict(list)
                    for id in id_list:
                        path_to_achs[self.id_to_cat[id]].append(
                            self.genach(int(id)))
                    first_path = list(path_to_achs.keys())[0]
                    if len(path_to_achs) > 1:
                        changelog('* Splitted sub-category {} > {} > {}'
                                  ' in the following categories:'
                                  .format(*expected, subcat['name']))
                        achs_to_remove = set()
                        for path, achs in path_to_achs.items():
                            if path == expected:
                                continue
                            (iscat(self.achievs, *path)
                                ['subcats'].append({
                                    'id': genid(),
                                    'name': '[R]' + subcat['name'],
                                    'items': achs
                                }))
                            achs_to_remove |= {ach_to_idx[int(ach['id'])]
                                               for ach in achs}
                            changelog("  - {} > {} (achievements {})"
                                      .format(*path,
                                              ', '.join(str(ach['id'])
                                                        for ach in achs)))
                        subcat['items'] = [a for i, a
                                           in enumerate(subcat['items'])
                                           if i not in achs_to_remove]
                        if not subcat['items']:
                            subcat_to_remove.add(i)
                    elif first_path != expected:
                        # "Easy" fix: whole subcategory moved to other
                        # category
                        (iscat(self.achievs, *first_path)
                            ['subcats'].append({
                                'id': genid(),
                                'name': '[R]' + subcat['name'],
                                'items': subcat['items']
                            }))
                        changelog('* Moved sub-category {} > {} > {}'
                                  '  →  {} > {}'
                                  .format(*expected, subcat['name'],
                                          *first_path))
                        subcat_to_remove.add(i)
                cat['subcats'] = [sc for i, sc in enumerate(cat['subcats'])
                                  if i not in subcat_to_remove]

    def add_missing_achievements(self):
        missing = set(list(self.id_to_cat.keys()))
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        try:
                            missing.remove(int(item['id']))
                        except KeyError:
                            pass
        for ach_id in missing:
            path = self.id_to_cat[int(ach_id)]
            cat = iscat(self.achievs, *path, 'TODO')
            newach = self.genach(int(ach_id))
            cat['items'].append(newach)
            changelog(
                '* Added missing achievement {} "{}"'
                .format(newach['id'], newach['title'])
            )

    def fix_broken_icons(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        dbc_ach = self.dbc_achiev[int(item['id'])]
                        dbc_icon = self.get_icon_name(
                            int(dbc_ach['IconFileID'])
                        )
                        if (item['icon'].lower() != dbc_icon.lower()):
                            changelog('* Fixed icon of achievement {} '
                                      '({} -> {})'
                                      .format(item['id'], item['icon'],
                                              dbc_icon))
                            item['icon'] = dbc_icon

    def fix_wrong_sides(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        dbc_ach = self.dbc_achiev[int(item['id'])]
                        faction = self.get_faction(int(item['id']))
                        oldfaction = item.get('side', None)
                        if oldfaction != faction:
                            changelog(
                                '* Fixed faction of achievement {} ({} -> {})'
                                .format(
                                    dbc_ach['Title_lang'],
                                    oldfaction,
                                    faction,
                                ))
                            if faction is not None:
                                item['side'] = faction
                            else:
                                item.pop('side', '')

    def fix_types_data(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        ach_id = int(item['id'])
                        dbc_ach = self.dbc_achiev[ach_id]
                        item['id'] = int(ach_id)
                        item['points'] = int(dbc_ach['Points'])
                        item['title'] = dbc_ach['Title_lang']
                        item.pop('criteria', None)
                        item.pop('name', None)

    def reorder_categories(self):
        def get_name_order_for_category(cat_id):
            subcats = [
                e
                for e in self.dbc_achiev_category.values()
                if int(e['Parent']) == int(cat_id)
            ]
            subcats.sort(key=lambda x: int(x['Ui_order']))
            return [e['Name_lang'] for e in subcats]

        # Sort supercategories
        sort_try_respect_order(
            self.achievs['supercats'],
            get_name_order_for_category(-1)
        )

        # Sort subcategories
        for supercat in self.achievs['supercats']:
            try:
                dbc_supercat = list_find(
                    self.dbc_achiev_category.values(),
                    lambda x: (
                        x['Name_lang'] == supercat['name']
                        and int(x['Parent']) == -1
                    ),
                )
                dbc_order = get_name_order_for_category(
                    int(dbc_supercat['ID'])
                )
            except StopIteration:
                continue

            # We reverse-sort categories sorted by expansion to always have the
            # last one on top.
            revcat = (
                'Quests',
                'Exploration',
                'Dungeons & Raids',
                'Reputation',
                'Expansion Features'
            )
            if supercat['name'] in revcat:
                dbc_order = list(reversed(dbc_order))

            sort_try_respect_order(supercat['cats'], dbc_order)
            try:
                top_cat_idx = next(
                    index for index, cat in enumerate(supercat['cats'])
                    if cat['name'] == supercat['name'])
                supercat['cats'].insert(0, supercat['cats'].pop(top_cat_idx))
            except StopIteration:
                pass

    def count_duplicates(self):
        counter = collections.Counter()
        paths = collections.defaultdict(list)
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        counter[int(item['id'])] += 1
                        paths[int(item['id'])].append(
                            (supercat['name'], cat['name'], subcat['name']))
        dup = {c: paths[c] for c, v in counter.items() if v > 1}
        return collections.Counter(dup)

    def run(self):
        self.delete_removed_achievements()
        self.fix_moved_subcategories()
        self.add_missing_achievements()
        self.fix_broken_icons()
        self.fix_wrong_sides()
        self.fix_types_data()

        self.del_empty()

        self.reorder_categories()

        return [self.achievs]
