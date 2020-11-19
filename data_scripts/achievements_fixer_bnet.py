#!/usr/bin/env python3

import asyncio
import binascii
import bnet
import collections
import json
import logging
import os
import sys
import tqdm
import tqdm.asyncio


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


def genid():
    return binascii.b2a_hex(os.urandom(4)).decode('ascii')


def sort_try_respect_order(L, order_list, key='name'):
    d = {k['name']: v for v, k in enumerate(order_list)}
    L.sort(key=lambda k: d.get(k['name'], float('inf')))


def filter_del(L, cond, deleted=None, format_deleted=None):
    kept = [item for item in L if cond(item)]
    if deleted is not None:
        if format_deleted is None:
            format_deleted = lambda x: x  # noqa
        deleted.extend(format_deleted(item) for item in L if not cond(item))
    return kept


def list_find(L, pred):
    return next(item for item in L if pred(item))


class AchievementFixer:
    def __init__(self, achievements, bnet_achievements, noconfirm=False):
        self.id_to_cat = {}
        self.id_to_ach = {}
        self.id_to_sa_ach = {}
        self.achievs = achievements
        self.bnet_achievs = bnet_achievements
        self.register_bnet_achievs()
        self.register_sa_achievs()

    def register_bnet_achievs(self):
        # Register Battle net achievements:
        for b_supercat in self.bnet_achievs['achievements']:
            if 'achievements' in b_supercat:
                for ach in b_supercat['achievements']:
                    self.id_to_cat[ach['id']] = (b_supercat['name'],
                                                 b_supercat['name'])
                    self.id_to_ach[ach['id']] = ach
            if 'categories' not in b_supercat:
                continue
            for b_cat in b_supercat['categories']:
                for ach in b_cat['achievements']:
                    self.id_to_cat[ach['id']] = (b_supercat['name'],
                                                 b_cat['name'])
                    self.id_to_ach[ach['id']] = ach

    def register_sa_achievs(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        self.id_to_sa_ach[int(item['id'])] = item

    def bnet_ach_to_icon(self, ach):
        bnet_icon = ach['assets'][0]['value']
        bnet_icon = bnet_icon[:-len('.jpg')]
        bnet_icon = bnet_icon.split('/')[-1]
        return bnet_icon

    def genach(self, ach_id):
        ach_id = int(ach_id)
        if ach_id in self.id_to_sa_ach:
            return self.id_to_sa_ach[ach_id]
        else:
            ach = self.id_to_ach[ach_id]
            if 'assets' not in ach:
                changelog(ach)
            return {
                'id': int(ach['id']),
                'title': ach['name'],
                'icon': self.bnet_ach_to_icon(ach),
                'points': ach['points'],
            }

    def cat(self, supercat=None, cat=None, subcat=None, *,
            create_missing=False):
        def try_find_create(L, name, items=None):
            try:
                return list_find(L, lambda x: x['name'] == name)
            except StopIteration:
                if create_missing:
                    d = {'id': genid(), 'name': name}
                    if items:
                        d[items] = []
                    L.append(d)
                    return d
                else:
                    raise

        res = self.achievs
        if supercat is not None:
            res = try_find_create(res['supercats'], supercat, 'cats')
        if cat is not None:
            res = try_find_create(res['cats'], cat, 'subcats')
        if subcat is not None:
            res = try_find_create(res['subcats'], subcat, 'items')
        return res

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
        changelog("* Deleted removed achievements: {}"
                  .format(', '.join(ach_deleted)))

    def add_new_cats_subcats(self):
        # Populate new supercategories
        for b_supercat in self.bnet_achievs['achievements']:
            if not any(b_supercat['name'] == supercat['name']
                       for supercat in self.achievs['supercats']):
                self.achievs['supercats'].append({
                    'id': genid(),
                    'name': b_supercat['name'],
                    'cats': []
                })
                changelog("* Added new supercategory {}"
                          .format(b_supercat['name']))

        # Populate new categories
        for b_supercat in self.bnet_achievs['achievements']:
            if 'categories' not in b_supercat:
                # No subcategories
                continue

            supercat = self.cat(b_supercat['name'])
            for b_cat in b_supercat['categories']:
                if not any(b_cat['name'] == cat['name']
                           for cat in supercat['cats']):
                    supercat['cats'].append({
                        'id': genid(),
                        'name': b_cat['name'],
                        'subcats': []
                    })
                    changelog("* Added new category {} > {}".format(
                              supercat['name'], b_cat['name']))

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
        changelog("* Deleted categories:\n{}"
                  .format('\n'.join(deleted_cats)))

        # Delete empty supercategories
        deleted_supcats = []
        self.achievs['supercats'] = filter_del(
            self.achievs['supercats'], lambda item: bool(item['cats']),
            deleted_supcats,
            lambda item: '  - {}'.format(item['name'])
        )
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
                        ach = self.id_to_ach[int(id)]
                        path_to_achs[self.id_to_cat[id]].append(
                            self.genach(ach['id']))
                    first_path = list(path_to_achs.keys())[0]
                    if len(path_to_achs) > 1:
                        changelog('* Splitted sub-category {} > {} > {}'
                                  ' in the following categories:'
                                  .format(*expected, subcat['name']))
                        achs_to_remove = set()
                        for path, achs in path_to_achs.items():
                            if path == expected:
                                continue
                            (self.cat(*path, create_missing=True)
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
                        (self.cat(*first_path, create_missing=True)
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
            # Bugged achievements returned by the API
            if ach_id in [7268, 7269, 7270, 13927]:
                continue
            path = self.id_to_cat[ach_id]
            ach = self.id_to_ach[ach_id]
            # API returns 404 achievements
            if ach.get('code') == 404:
                continue
            cat = self.cat(*path, 'TODO', create_missing=True)
            cat['items'].append(self.genach(ach['id']))

    def fix_broken_icons(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        ach = self.id_to_ach[int(item['id'])]
                        # For some reason, the battle net API returns wrong
                        # results with missing dashes, so let's just ignore
                        # those for now.
                        bnet_icon = self.bnet_ach_to_icon(ach)
                        if ((item['icon'].lower().replace('-', '')
                             != bnet_icon.lower().replace('-', ''))):
                            changelog('* Fixed icon of achievement {} '
                                      '({} -> {})'
                                      .format(ach['id'], item['icon'],
                                              bnet_icon))
                            item['icon'] = bnet_icon

    def fix_wrong_sides(self):
        for supercat in self.achievs['supercats']:
            for cat in supercat['cats']:
                for subcat in cat['subcats']:
                    for item in subcat['items']:
                        ach = self.id_to_ach[int(item['id'])]
                        faction = None
                        bnet_faction = (ach.get('requirements', {})
                                        .get('faction'))
                        if bnet_faction:
                            faction = {
                                'ALLIANCE': 'A',
                                'HORDE': 'H'
                            }[bnet_faction['type']]
                        oldfaction = item.get('side', None)
                        if oldfaction != faction:
                            changelog('* Fixed faction of achievement {} '
                                      '({} -> {})'
                                      .format(ach['name'], oldfaction,
                                              faction))
                            if faction is not None:
                                item['side'] = faction
                            else:
                                item.pop('side', '')

    def reorder_categories(self):
        sort_try_respect_order(self.achievs['supercats'],
                               self.bnet_achievs['achievements'])
        for b_supercat in self.bnet_achievs['achievements']:
            if 'categories' not in b_supercat:
                continue
            supercat = self.cat(b_supercat['name'])

            # We reverse-sort categories sorted by expansion to always have the
            # last one on top.
            bnet_order = b_supercat['categories']
            revcat = ('Quests', 'Exploration', 'Dungeons & Raids',
                      'Reputation', 'Expansion Features')
            if b_supercat['name'] in revcat:
                bnet_order = reversed(bnet_order)

            sort_try_respect_order(supercat['cats'], bnet_order)
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
        self.add_new_cats_subcats()

        self.fix_moved_subcategories()
        self.add_missing_achievements()
        self.fix_broken_icons()
        self.fix_wrong_sides()

        self.del_empty()

        self.reorder_categories()

        # Output result
        json.dump(self.achievs, sys.stdout, indent=2, sort_keys=True)


async def build_achievement_master_list():
    """
    This builds an old API-style achievement master list which can then be
    processed by the achievement fixer.
    """
    res = {}
    semaphore = asyncio.Semaphore(30)  # concurrent reqs

    async def enrich_achievement(ach):
        async with semaphore:
            data = await client.achievement(ach['id'])
            media = await client.achievement_media(ach['id'])
            ach.update(data)
            ach.update(media)

    async def enrich_achievement_list(achs):
        tasks = [enrich_achievement(ach) for ach in achs]
        for f in tqdm.asyncio.tqdm_asyncio.as_completed(
            tasks,
            position=2,
            leave=False
        ):
            await f

    async with bnet.BnetClient() as client:
        index = await client.achievement_category()
        res['achievements'] = index['root_categories']
        res['achievements'] = [
            i for i in res['achievements'] if i['name'] != 'Guild'
        ]
        for supercat in tqdm.tqdm(res['achievements'], position=0):
            supercat_data = await client.achievement_category(supercat['id'])
            supercat['display_order'] = supercat_data['display_order']
            if 'achievements' in supercat_data:
                supercat['achievements'] = supercat_data['achievements']
                await enrich_achievement_list(supercat['achievements'])
                supercat['achievements'].sort(
                    key=lambda x: x.get('display_order', 0)
                )
            if 'subcategories' in supercat_data:
                supercat['categories'] = supercat_data['subcategories']
                for cat in tqdm.tqdm(
                    supercat['categories'],
                    position=1,
                    leave=False
                ):
                    cat_data = await client.achievement_category(cat['id'])
                    cat['display_order'] = cat_data['display_order']
                    cat['achievements'] = cat_data['achievements']
                    await enrich_achievement_list(cat['achievements'])
                    cat['achievements'].sort(
                        key=lambda x: x.get('display_order', 0)
                    )
                supercat['categories'].sort(
                    key=lambda x: x.get('display_order', 0)
                )
        res['achievements'].sort(key=lambda x: x.get('display_order', 0))

    return res


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        sys.exit("Usage: {} achievements.json")

    achievements = json.load(open(sys.argv[1]))
    bnet_achievements = asyncio.run(build_achievement_master_list())

    fixer = AchievementFixer(achievements, bnet_achievements)
    fixer.run()
