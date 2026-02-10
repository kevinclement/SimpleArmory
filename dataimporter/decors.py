#!/usr/bin/env python3

from .tools import icat, changelog
from .fixer import WowToolsFixer


IGNORE_DECOR_ID = []


class DecorFixer(WowToolsFixer):
    def _store_init(self, decors):
        self.decors = decors
        self.id_to_old_decor = {}

        self.dbc_decor = {
            int(e['ID']): e for e in self.dbc_get_table('housedecor')
        }

        self.dbc_item = {
            int(e['ID']): e for e in self.dbc_get_table('item')
        }

        self.register_old_decors()

    def register_old_decors(self):
        for cat in self.decors:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_decor[int(item['ID'])] = item

    def get_decor(self, decor_id: int):
        name = self.dbc_decor[int(decor_id)]['Name_lang']
        if 'DNT' in name:
            return None
        item_id = self.dbc_decor[decor_id]['ItemID']

        try:
            icon_id = self.dbc_item[int(item_id)]['IconFileDataID']
        except KeyError:
            icon_name = None
        else:
            icon_name = self.get_icon_name(int(icon_id))

        return {
            'ID': int(decor_id),
            'icon': icon_name,
            'name': name,
            'new': True,
            **({'itemId': item_id} if item_id else {})
        }

    def fix_missing_decors(self):
        for decor_id in self.dbc_decor:
            if (
                int(decor_id) not in self.id_to_old_decor
                and decor_id not in IGNORE_DECOR_ID
            ):
                self.fix_missing_decor(int(decor_id))

    def fix_missing_decor(self, decor_id: int):
        decor = self.get_decor(decor_id)
        if decor is None:
            raise RuntimeError(f"Cannot find missing decor {decor_id}")
        changelog(
            f"Decor {decor_id} \"{decor['name']}\" missing:"
            f" https://www.wowhead.com/decor/{decor['ID']}"
        )
        icat(self.decors, 'TODO', 'TODO')['items'].append(decor)

    def fix_types_data(self):
        for cat in self.decors:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    fixed_decor = self.get_decor(int(item['ID']))
                    if fixed_decor:
                        item['ID'] = int(fixed_decor['ID'])
                        item['name'] = fixed_decor['name']
                        if fixed_decor.get('nameF'):
                            item['nameF'] = fixed_decor['nameF']
                        if not item.get('icon'):
                            item['icon'] = fixed_decor['icon']
                    else:
                        item['ID'] = int(item['ID'])

    def run(self):
        self.fix_missing_decors()
        self.fix_types_data()
        return [self.decors]
