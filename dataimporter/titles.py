#!/usr/bin/env python3

import re

from .tools import icat, changelog
from .fixer import WowToolsFixer


IGNORE_TITLE_ID = [
    54,   # %s of the Ten Storms https://www.wowhead.com/title=86
    55,   # %s of the Emerald Dream https://www.wowhead.com/title=87
    58,   # %s the Malefic https://www.wowhead.com/title=90
    64,   # Grand Master Alchemist %s https://www.wowhead.com/title=96
    74,   # Grand Master Leatherworker %s https://www.wowhead.com/title=106
    76,   # Grand Master Skinner %s https://www.wowhead.com/title=108
    77,   # Grand Master Tailor %s https://www.wowhead.com/title=109
    232,  # %s the Bloodseeker https://www.wowhead.com/title=355
    235,  # %s the Prime https://www.wowhead.com/title=358
    236,  # %s the Manipulator https://www.wowhead.com/title=359
    237,  # %s the Dissector https://www.wowhead.com/title=360
    245,  # Darkmaster %s https://www.wowhead.com/title=370
    330,  # Master Assassin %s https://www.wowhead.com/title=473
    358,  # %s, Adventuring Instructor https://www.wowhead.com/title=507
    365,  # %s the Collector https://www.wowhead.com/title=514
    371,  # %s, No Good, Dirty, Rotten[...] https://www.wowhead.com/title=520
    387,  # %s the Elite Death Knight https://www.wowhead.com/title=637
    388,  # %s the Elite Demon Hunter https://www.wowhead.com/title=638
    389,  # %s the Elite Druid https://www.wowhead.com/title=639
    390,  # %s the Elite Hunter https://www.wowhead.com/title=640
    391,  # %s the Elite Mage https://www.wowhead.com/title=641
    392,  # %s the Elite Monk https://www.wowhead.com/title=642
    393,  # %s the Elite Paladin https://www.wowhead.com/title=643
    394,  # %s the Elite Priest https://www.wowhead.com/title=644
    395,  # %s the Elite Rogue https://www.wowhead.com/title=645
    396,  # %s the Elite Shaman https://www.wowhead.com/title=646
    397,  # %s the Elite Warlock https://www.wowhead.com/title=647
    398,  # %s the Elite Warrior https://www.wowhead.com/title=648
    399,  # %s the T-Shirt Enthusiast https://www.wowhead.com/title=649
    406,  # Sparking %s https://www.wowhead.com/title=658
    408,  # Pilgrim %s the Mallet Bearer https://www.wowhead.com/title=660
    413,  # %s, As Themselves https://www.wowhead.com/title=666
    414,  # %s, Servant of N'Zoth https://www.wowhead.com/title=667
    424,  # Deathbringer %s https://www.wowhead.com/title=684
    436,  # %s the Avowed https://www.wowhead.com/title=690
]


class TitleFixer(WowToolsFixer):
    def _store_init(self, titles):
        self.titles = titles
        self.id_to_old_title = {}
        self.register_old_titles()

        self.wt_title = {
            int(e['Mask_ID']): e for e in self.wt_get_table('chartitles')
        }

    def register_old_titles(self):
        for cat in self.titles:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_title[int(item['titleId'])] = item

    def simplify_name(self, name):
        name = re.sub(r'\s*%s,?\s*', '', name)
        name = name[:1].upper() + name[1:]
        return name

    def get_title(self, title_id: int):
        if int(title_id) not in self.wt_title:
            return None
        wt_title = self.wt_title[int(title_id)]
        name = self.simplify_name(wt_title['Name_lang'])
        nameF = self.simplify_name(wt_title['Name1_lang'])
        res = {
            'titleId': int(title_id),
            'name': name,
            'type': 'title',
            'id': int(wt_title['ID']),
            'icon': 'inv_misc_questionmark',
        }
        if nameF != name:
            res['nameF'] = nameF
        return res

    def fix_missing_title(self, title_id: int):
        title = self.get_title(title_id)
        changelog(
            f"Title {title_id} \"{title['name']}\" missing:"
            f" https://www.wowhead.com/title={title['id']}"
        )
        icat(self.titles, 'TODO', 'TODO')['items'].append(title)

    def fix_missing_titles(self):
        for title_id in self.wt_title:
            if (
                int(title_id) not in self.id_to_old_title
                and title_id not in IGNORE_TITLE_ID
            ):
                self.fix_missing_title(int(title_id))

    def fix_types_data(self):
        for cat in self.titles:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    fixed_title = self.get_title(int(item['titleId']))
                    if fixed_title:
                        item['titleId'] = fixed_title['titleId']
                        if item.get('id'):
                            # Keep link to achievement/quest/...
                            # XXX: title id and related thing id should not
                            # share a common field name
                            item['id'] = int(item['id'])
                        else:
                            item['id'] = int(fixed_title['id'])
                        item['name'] = fixed_title['name']
                        if fixed_title.get('nameF'):
                            item['nameF'] = fixed_title['nameF']
                    else:
                        item['id'] = int(item['id'])
                        item['titleId'] = int(item['titleId'])

    def run(self):
        self.fix_missing_titles()
        self.fix_types_data()
        return [self.titles]
