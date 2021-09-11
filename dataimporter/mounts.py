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
    293,   # Illidari Doomhawk https://www.wowhead.com/mount/293
    308,   # Blue Skeletal Warhorse https://www.wowhead.com/mount/308
    333,   # Magic Rooster https://www.wowhead.com/mount/333
    334,   # Magic Rooster https://www.wowhead.com/mount/334
    335,   # Magic Rooster https://www.wowhead.com/mount/335
    462,   # White Riding Yak https://www.wowhead.com/mount/462
    484,   # Black Riding Yak https://www.wowhead.com/mount/484
    485,   # Brown Riding Yak https://www.wowhead.com/mount/485
    776,   # Swift Spectral Rylak https://www.wowhead.com/mount/776
    934,   # Swift Spectral Hippogryph https://www.wowhead.com/mount/934
    935,   # Blue Qiraji War Tank https://www.wowhead.com/mount/935
    936,   # Red Qiraji War Tank https://www.wowhead.com/mount/936
    1269,  # Swift Spectral Fathom Ray https://www.wowhead.com/mount/1269
    1270,  # Swift Spectral Magnetocraft https://www.wowhead.com/mount/1270
    1271,  # Swift Spectral Armored Gryphon https://www.wowhead.com/mount/1271
    1272,  # Swift Spectral Pterrordax https://www.wowhead.com/mount/1272
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
    load_files = True

    def _store_init(self, mounts):
        self.mounts = mounts
        self.id_to_old_mount = {}

        self.wt_mount = {
            e['ID']: e for e in self.wt_get_table('mount')
        }
        self.wt_itemeffectbyspell = {
            e['SpellID']: e for e in self.wt_get_table('itemeffect')
        }
        self.wt_itembyeffect = {
            e['ItemEffectID']: e for e in self.wt_get_table('itemxitemeffect')
        }
        self.wt_spellmisc = {
            e['SpellID']: e for e in self.wt_get_table('spellmisc')
        }

        self.register_old_mounts()

    def register_old_mounts(self):
        for cat in self.mounts:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_mount[int(item['ID'])] = item

    def get_mount(self, mount_id):
        spell_id = self.wt_mount[mount_id]['SourceSpellID']
        name = self.wt_mount[mount_id]['Name_lang']

        # Icon
        try:
            icon_id = self.wt_spellmisc[spell_id]['SpellIconFileDataID']
        except KeyError:
            icon_name = None
        else:
            icon_name = self.get_icon_name(int(icon_id))

        # Item
        try:
            item_effect_id = self.wt_itemeffectbyspell[spell_id]['ID']
            item_id = self.wt_itembyeffect[item_effect_id]['ItemID']
        except KeyError:
            item_id = None

        return {
            'ID': int(mount_id),
            'name': name,
            'icon': icon_name,
            'spellid': int(spell_id),
            **({'itemId': item_id} if item_id else {})
        }

    def get_mount_source(self, mount_id):
        return MOUNT_SOURCE_ENUM.get(
            int(self.wt_mount[mount_id]['SourceTypeEnum']),
            'Unknown'
        )

    def fix_missing_mount(self, mount_id):
        if (
            # No summon spell ID
            not int(self.wt_mount[mount_id]['SourceSpellID'])
            # Flag 0x100 : Invalid mount
            or int(self.wt_mount[mount_id]['Flags']) & 0x100
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
        for mount_id in self.wt_mount:
            if (int(mount_id) not in self.id_to_old_mount
                    and int(mount_id) not in IGNORE_MOUNT_ID):
                self.fix_missing_mount(mount_id)

    def run(self):
        self.fix_missing_mounts()
        return [self.mounts]
