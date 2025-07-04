#!/usr/bin/env python3

from .fixer import WowToolsFixer
from .tools import icat, changelog


IGNORE_PET_NPCID = [
    125494,     # SpeedyNumberIII https://www.wowhead.com/npc=125494
    185475,     # Tezpet https://www.wowhead.com/npc=185475
    200004,     # [DNT] Storm Pet Boss - Rare
    200685,     # Vortex https://www.wowhead.com/npc=200685
    200689,     # Wildfire https://www.wowhead.com/npc=200689
    200693,     # Tremblor https://www.wowhead.com/npc=200693
    200697,     # Flow https://www.wowhead.com/npc=200697
]

PET_SOURCE_ENUM = {
    0: 'Drop',
    1: 'Quest',
    2: 'Vendor',
    3: 'Profession',
    4: 'Wild',
    5: 'Achievement',
    6: 'World Event',
    7: 'Promotion',
    8: 'Trading Card Game',
    9: 'Store',
    10: 'Discovery',
}


class PetFixer(WowToolsFixer):
    def _store_init(self, *args):
        pets, battlepets = args
        self.pets = pets
        self.battlepets = battlepets
        self.id_to_old_pet = {}

        self.dbc_battlepetspecies = {
            e['ID']: e
            for e in self.dbc_get_table('battlepetspecies')
        }
        self.dbc_creature = {
            e['ID']: e for e in self.dbc_get_table('creature')
        }
        self.dbc_itemeffectbyspell = {
            e['SpellID']: e
            for e in self.dbc_get_table('itemeffect')
        }
        self.dbc_itembyeffect = {
            e['ItemEffectID']: e
            for e in self.dbc_get_table('itemxitemeffect')
        }

        self.register_old_pets()

    def register_old_pets(self):
        for cat in self.pets + self.battlepets:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_pet[int(item['ID'])] = item

    def get_pet(self, pet_id):
        pet_id = str(pet_id)
        # Name
        spell_id = self.dbc_battlepetspecies[pet_id]['SummonSpellID']
        creature_id = self.dbc_battlepetspecies[pet_id]['CreatureID']
        if creature_id not in self.dbc_creature:
            return
        name = self.dbc_creature[creature_id]['Name_lang']

        # Icon
        icon_id = self.dbc_battlepetspecies[pet_id]['IconFileDataID']
        icon_name = self.get_icon_name(int(icon_id))

        # Item
        try:
            item_effect_id = self.dbc_itemeffectbyspell[spell_id]['ID']
            item_id = self.dbc_itembyeffect[item_effect_id]['ItemID']
        except KeyError:
            item_id = None

        return {
            'ID': int(pet_id),
            'name': name,
            'icon': icon_name,
            'creatureId': int(creature_id),
            'spellid': int(spell_id),
            **({'itemId': int(item_id)} if item_id else {})
        }

    def get_pet_source(self, pet_id):
        return PET_SOURCE_ENUM.get(
            int(self.dbc_battlepetspecies[pet_id]['SourceTypeEnum']),
            'Unknown'
        )

    def fix_missing_pet(self, pet_id):
        if (
            # Flag 0x20 : HideFromJournal
            int(self.dbc_battlepetspecies[pet_id]['Flags']) & 0x20
            or (
                int(self.dbc_battlepetspecies[pet_id]['CreatureID'])
                in IGNORE_PET_NPCID
            )
        ):
            return
        pet = self.get_pet(pet_id)
        if pet is None:
            return

        changelog('Pet {} missing: https://www.wowhead.com/npc={}'
                  .format(pet_id, pet['creatureId']))

        source = self.get_pet_source(pet_id)
        if source == 'Wild':
            cat = icat(self.battlepets, 'TODO', 'TODO')
            if cat is not None:
                cat['items'].append(pet)
        else:
            cat = icat(self.pets, 'TODO', source)
            if cat is not None:
                cat['items'].append(pet)

    def fix_missing_pets(self):
        for pet_id in self.dbc_battlepetspecies:
            if (int(pet_id) not in self.id_to_old_pet):
                self.fix_missing_pet(pet_id)

    def fix_types_data(self):
        for cat in list(self.pets) + list(self.battlepets):
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    fixed_pet = self.get_pet(int(item['ID']))
                    if fixed_pet is None:
                        continue
                    item['ID'] = fixed_pet['ID']
                    item['name'] = fixed_pet['name']
                    item['creatureId'] = fixed_pet['creatureId']

                    if fixed_pet.get('spellid'):
                        item['spellid'] = fixed_pet['spellid']

                    # Remove null/0 spellID
                    if 'spellid' in item and not item['spellid']:
                        item.pop('spellid')

                    # There can be multiple valid itemID, do not overwrite
                    if item.get('itemId'):
                        item['itemId'] = int(item['itemId'])
                    elif fixed_pet.get('itemId'):
                        item['itemId'] = fixed_pet['itemId']

                    if (item['icon'].lower() != fixed_pet['icon'].lower()):
                        item['icon'] = fixed_pet['icon']

    def run(self):
        self.fix_missing_pets()
        self.fix_types_data()
        return [self.pets, self.battlepets]
