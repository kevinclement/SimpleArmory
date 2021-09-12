#!/usr/bin/env python3

from .fixer import WowToolsFixer
from .tools import changelog, icat


IGNORE_TOY_ITEMID = [
    88587,
    110586,
    119220,
    119221,
    129111,
    130249,
    141300,
    143545,
    166851,
    174445,
    183810,
]

TOY_SOURCE_ENUM = {
    0: 'Drop',
    1: 'Quest',
    2: 'Vendor',
    3: 'Profession',
    4: 'NPC',
    5: 'Achievement',
    6: 'World Event',
    7: 'Promotion',
    9: 'Store',
}


class ToyFixer(WowToolsFixer):
    load_files = True

    def _store_init(self, toys):
        self.toys = toys
        self.id_to_old_toy = {}

        self.wt_toy = {
            e['ItemID']: e for e in self.wt_get_table('toy')
        }
        self.wt_item = {
            e['ID']: e for e in self.wt_get_table('item')
        }
        self.wt_itemsparse = {
            e['ID']: e for e in self.wt_get_table('itemsparse')
        }
        self.register_old_toys()

    def register_old_toys(self):
        for cat in self.toys:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_toy[int(item['itemId'])] = item

    def get_toy(self, toy_id):
        toy_id = str(toy_id)

        # Name
        if toy_id not in self.wt_itemsparse:
            return None
        name = self.wt_itemsparse[toy_id]['Display_lang']

        # Icon
        icon_id = self.wt_item[toy_id]['IconFileDataID']
        icon_name = self.get_icon_name(int(icon_id))

        return {
            'itemId': int(toy_id),
            'name': name,
            'icon': icon_name,
        }

    def get_toy_source(self, toy_id):
        return TOY_SOURCE_ENUM.get(
            int(self.wt_toy[toy_id]['SourceTypeEnum']),
            'Unknown'
        )

    def fix_missing_toy(self, toy_id):
        toy = self.get_toy(toy_id)
        if toy is None:
            return

        changelog('Toy {} missing: https://www.wowhead.com/item={}'
                  .format(toy_id, toy_id))

        source = self.get_toy_source(toy_id)
        icat(self.toys, 'TODO', source)['items'].append(toy)

    def fix_missing_toys(self):
        for toy_id in self.wt_toy:
            if (int(toy_id) not in self.id_to_old_toy
                    and int(toy_id) not in IGNORE_TOY_ITEMID):
                self.fix_missing_toy(toy_id)

    def fix_types_data(self):
        for cat in self.toys:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    fixed_toy = self.get_toy(int(item['itemId']))
                    item['itemId'] = fixed_toy['itemId']
                    item['name'] = fixed_toy['name']

                    if (item['icon'].lower() != fixed_toy['icon'].lower()):
                        item['icon'] = fixed_toy['icon']

    def run(self):
        self.fix_missing_toys()
        self.fix_types_data()
        return [self.toys]
