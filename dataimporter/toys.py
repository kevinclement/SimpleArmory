#!/usr/bin/env python3

from .fixer import WowToolsFixer
from .tools import changelog, icat


IGNORE_TOY_ID = [
    216,
    290,
    511,
    929,
    993,
    310,
    311,
    443,
    576,
    603,
    1175,
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
    def _store_init(self, *args):
        toys = args
        self.toys = toys
        self.id_to_old_toy = {}

        self.dbc_toy = {
            e['ID']: e for e in self.dbc_get_table('toy')
        }
        self.dbc_item = {
            e['ID']: e for e in self.dbc_get_table('item')
        }
        self.dbc_itemsparse = {
            e['ID']: e for e in self.dbc_get_table('itemsparse')
        }
        self.register_old_toys()

    def register_old_toys(self):
        for cat in self.toys:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_toy[int(item['ID'])] = item

    def get_toy(self, toy_id):
        toy_id = str(toy_id)
        item_id = self.dbc_toy[toy_id]['ItemID']

        # Name
        if item_id not in self.dbc_itemsparse:
            return {}
        name = self.dbc_itemsparse[item_id]['Display_lang']

        # Icon
        icon_id = self.dbc_item[item_id]['IconFileDataID']
        icon_name = self.get_icon_name(int(icon_id))

        return {
            'ID': int(toy_id),
            'itemId': int(item_id),
            'name': name,
            'icon': icon_name,
        }

    def get_toy_source(self, toy_id):
        return TOY_SOURCE_ENUM.get(
            int(self.dbc_toy[toy_id]['SourceTypeEnum']),
            'Unknown'
        )

    def fix_missing_toy(self, toy_id):
        toy = self.get_toy(toy_id)
        if toy is None:
            return

        changelog('Toy {} missing: https://www.wowhead.com/item={}'
                  .format(toy_id, toy['itemId']))

        source = self.get_toy_source(toy_id)
        icat(self.toys, 'TODO', source)['items'].append(toy)

    def fix_missing_toys(self):
        for toy_id in self.dbc_toy:
            if (int(toy_id) not in self.id_to_old_toy
                    and int(toy_id) not in IGNORE_TOY_ID):
                self.fix_missing_toy(toy_id)

    def fix_types_data(self):
        for cat in self.toys:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    fixed_toy = self.get_toy(int(item['ID']))
                    item['ID'] = fixed_toy['ID']
                    item['itemId'] = fixed_toy['itemId']
                    item['name'] = fixed_toy['name']

                    if (item['icon'].lower() != fixed_toy['icon'].lower()):
                        item['icon'] = fixed_toy['icon']

    def run(self):
        self.fix_missing_toys()
        self.fix_types_data()
        return [self.toys]
