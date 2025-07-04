#!/usr/bin/env python3

from .fixer import WowToolsFixer
from .tools import changelog, icat


IGNORE_HEIRLOOM_ID = [
]

HEIRLOOM_SOURCE_ENUM = {
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


class HeirloomFixer(WowToolsFixer):
    def _store_init(self, *args):
        heirlooms = args[0]
        self.heirlooms = heirlooms
        self.id_to_old_heirloom = {}

        self.dbc_heirloom = {
            e['ID']: e for e in self.dbc_get_table('heirloom')
        }
        self.dbc_item = {
            e['ID']: e for e in self.dbc_get_table('item')
        }
        self.dbc_itemsparse = {
            e['ID']: e for e in self.dbc_get_table('itemsparse')
        }
        self.register_old_heirlooms()

    def register_old_heirlooms(self):
        for cat in self.heirlooms:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_heirloom[int(item['ID'])] = item

    def get_heirloom(self, heirloom_id):
        heirloom_id = str(heirloom_id)
        item_id = self.dbc_heirloom[heirloom_id]['ItemID']

        # Name
        if item_id not in self.dbc_itemsparse:
            return None
        name = self.dbc_itemsparse[item_id]['Display_lang']

        # Icon
        # item_upgrade0_id = self.dbc_heirloom[heirloom_id]['UpgradeItemID[0]']
        icon_id = self.dbc_item[item_id]['IconFileDataID']
        icon_name = self.get_icon_name(int(icon_id))

        return {
            'ID': int(heirloom_id),
            'itemId': int(item_id),
            'name': name,
            'icon': icon_name,
        }

    def get_heirloom_source(self, heirloom_id):
        return HEIRLOOM_SOURCE_ENUM.get(
            int(self.dbc_heirloom[heirloom_id]['SourceTypeEnum']),
            'Unknown'
        )

    def fix_missing_heirloom(self, heirloom_id):
        heirloom = self.get_heirloom(heirloom_id)
        if heirloom is None:
            return

        changelog('Heirloom {} missing: https://www.wowhead.com/item={}'
                  .format(heirloom_id, heirloom['itemId']))

        source = self.get_heirloom_source(heirloom_id)
        cat = icat(self.heirlooms, 'TODO', source)
        if cat is not None and 'items' in cat:
            cat['items'].append(heirloom)

    def fix_missing_heirlooms(self):
        for heirloom_id in self.dbc_heirloom:
            if (int(heirloom_id) not in self.id_to_old_heirloom
                    and int(heirloom_id) not in IGNORE_HEIRLOOM_ID):
                self.fix_missing_heirloom(heirloom_id)

    def fix_types_data(self):
        for cat in self.heirlooms:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    fixed_heirloom = self.get_heirloom(int(item['ID']))
                    if fixed_heirloom is not None:
                        item['ID'] = fixed_heirloom['ID']
                        item['itemId'] = fixed_heirloom['itemId']
                        item['name'] = fixed_heirloom['name']

                        if (
                            fixed_heirloom['icon'] != '0'
                            and item['icon'].lower()
                                != fixed_heirloom['icon'].lower()
                        ):
                            item['icon'] = fixed_heirloom['icon']

    def run(self):
        self.fix_missing_heirlooms()
        self.fix_types_data()
        return [self.heirlooms]
