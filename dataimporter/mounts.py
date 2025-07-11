#!/usr/bin/env python3

from .tools import icat, changelog
from .fixer import WowToolsFixer


IGNORE_MOUNT_ID = [
    7,     # Gray Wolf https://www.wowhead.com/mount/7
    8,     # White Stallion https://www.wowhead.com/mount/8
    12,    # Black Wolf https://www.wowhead.com/mount/12
    13,    # Red Wolf https://www.wowhead.com/mount/13
    15,    # Winter Wolf https://www.wowhead.com/mount/15
    22,    # Black Ram https://www.wowhead.com/mount/22
    28,    # Skeletal Horse https://www.wowhead.com/mount/28
    35,    # Ivory Raptor https://www.wowhead.com/mount/35
    43,    # Green Mechanostrider https://www.wowhead.com/mount/43
    70,    # Riding Kodo https://www.wowhead.com/mount/70
    123,   # Nether Drake https://www.wowhead.com/mount/123
    145,   # Blue Mechanostrider https://www.wowhead.com/mount/145
    206,   # Merciless Nether Drake https://www.wowhead.com/mount/206
    222,   # Swift Zhevra https://www.wowhead.com/mount/222
    225,   # Brewfest Riding Kodo https://www.wowhead.com/mount/225
    238,   # Swift Spectral Gryphon https://www.wowhead.com/mount/238
    251,   # Black Polar Bear https://www.wowhead.com/mount/251
    273,   # Grand Caravan Mammoth https://www.wowhead.com/mount/273
    274,   # Grand Caravan Mammoth https://www.wowhead.com/mount/274
    308,   # Blue Skeletal Warhorse https://www.wowhead.com/mount/308
    333,   # Magic Rooster https://www.wowhead.com/mount/333
    334,   # Magic Rooster https://www.wowhead.com/mount/334
    335,   # Magic Rooster https://www.wowhead.com/mount/335
    776,   # Swift Spectral Rylak https://www.wowhead.com/mount/776
    934,   # Swift Spectral Hippogryph https://www.wowhead.com/mount/934
    935,   # Blue Qiraji War Tank https://www.wowhead.com/mount/935
    936,   # Red Qiraji War Tank https://www.wowhead.com/mount/936
    1269,  # Swift Spectral Fathom Ray https://www.wowhead.com/mount/1269
    1270,  # Swift Spectral Magnetocraft https://www.wowhead.com/mount/1270
    1271,  # Swift Spectral Armored Gryphon https://www.wowhead.com/mount/1271
    1272,  # Swift Spectral Pterrordax https://www.wowhead.com/mount/1272
    1578,  # [DND] Test Mount JZB https://www.wowhead.com/mount/1578
    1605,  # Dragon Isles Drake Model Test https://www.wowhead.com/mount/1605
    1771,  # Azeroth Dragonriding Highland Drake: https://www.wowhead.com/mount/1771
    1786,  # Azeroth Dragonriding Renewed Proto-Drake: https://www.wowhead.com/mount/1786
    1787,  # Azeroth Dragonriding Windborne Velocidrake: https://www.wowhead.com/mount/1787
    1788,  # Azeroth Dragonriding Cliffside Wylderdrake: https://www.wowhead.com/mount/1788
    1789,  # Azeroth Dragonriding Winding Slitherdrake: https://www.wowhead.com/mount/1789
    1796,  # Temp: https://www.wowhead.com/mount/1796
    1953,  # Grotto Netherwing Drake: https://www.wowhead.com/mount/1953 : dupe of 1744
    1954,  # Flourishing Whimsydrake: https://www.wowhead.com/mount/1954 : dupe of 1830
    2115,  # Dracthyr Racial
    1715,  # Placeholder Mecha-Done Mount - Never Added
]

MOUNT_SOURCE_ENUM = {
    0: 'Drop',
    1: 'Quest',
    2: 'Vendor',
    3: 'Profession',
    5: 'Achievement',
    6: 'World Event',
    7: 'Promotion',
    8: 'Trading Card Game',
    9: 'Store',
    10: 'Discovery',
}


class MountFixer(WowToolsFixer):
    def _store_init(self, mounts):
        self.mounts = mounts
        self.id_to_old_mount = {}

        self.dbc_mount = {
            int(e['ID']): e for e in self.dbc_get_table('mount')
        }
        self.dbc_itemeffectbyspell = {
            e['SpellID']: e for e in self.dbc_get_table('itemeffect')
        }
        self.dbc_itembyeffect = {
            e['ItemEffectID']: e for e in self.dbc_get_table('itemxitemeffect')
        }
        self.dbc_spellmisc = {
            e['SpellID']: e for e in self.dbc_get_table('spellmisc')
        }

        self.register_old_mounts()

    def register_old_mounts(self):
        for cat in self.mounts:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_mount[int(item['ID'])] = item

    def get_mount(self, mount_id: int):
        spell_id = self.dbc_mount[int(mount_id)]['SourceSpellID']
        name = self.dbc_mount[int(mount_id)]['Name_lang']

        # Icon
        try:
            icon_id = self.dbc_spellmisc[spell_id]['SpellIconFileDataID']
        except KeyError:
            icon_name = None
        else:
            icon_name = self.get_icon_name(int(icon_id))

        # Item
        try:
            item_effect_id = self.dbc_itemeffectbyspell[spell_id]['ID']
            item_id = self.dbc_itembyeffect[item_effect_id]['ItemID']
        except KeyError:
            item_id = None

        return {
            'ID': int(mount_id),
            'name': name,
            'icon': icon_name,
            'spellid': int(spell_id),
            **({'itemId': item_id} if item_id else {})
        }

    def get_mount_source(self, mount_id: int):
        return MOUNT_SOURCE_ENUM.get(
            int(self.dbc_mount[mount_id]['SourceTypeEnum']),
            'Unknown'
        )

    def fix_missing_mount(self, mount_id: int):
        if (
            # No summon spell ID
            not int(self.dbc_mount[mount_id]['SourceSpellID'])
            # Flag 0x100 : Invalid mount
            or int(self.dbc_mount[mount_id]['Flags']) & 0x100
        ):
            return

        mount = self.get_mount(mount_id)
        if mount is None:
            return

        changelog(
            f"Mount {mount_id} \"{mount['name']}\" missing:"
            f" https://www.wowhead.com/mount/{mount_id}"
        )

        source = self.get_mount_source(mount_id)
        icat(self.mounts, 'TODO', source)['items'].append(mount)

    def fix_missing_mounts(self):
        for mount_id in self.dbc_mount:
            if (int(mount_id) not in self.id_to_old_mount
                    and int(mount_id) not in IGNORE_MOUNT_ID):
                self.fix_missing_mount(int(mount_id))

    def fix_types_data(self):
        for cat in self.mounts:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    
                    # NOTE: If we're upgraded to a new version of the database and then try to update back
                    # you will have mounts that are not found, so print them out so I can trim them out
                    # and get to a good base state. 
                    #if int(item['ID']) not in self.dbc_mount:
                    #    print("DEBUG: MISSING MOUNT: " + str(item['ID']))
                    #    continue

                    fixed_mount = self.get_mount(int(item['ID']))
                    item['ID'] = fixed_mount['ID']
                    item['name'] = fixed_mount['name']
                    item['spellid'] = fixed_mount['spellid']

                    # There can be multiple valid itemID, do not overwrite
                    if item.get('itemId'):
                        item['itemId'] = int(item['itemId'])
                    elif fixed_mount.get('itemId'):
                        item['itemId'] = fixed_mount['itemId']

                    if (
                        fixed_mount['icon'] is not None
                        and item['icon'].lower() != fixed_mount['icon'].lower()
                    ):
                        item['icon'] = fixed_mount['icon']

    def run(self):
        self.fix_missing_mounts()
        self.fix_types_data()
        return [self.mounts]
