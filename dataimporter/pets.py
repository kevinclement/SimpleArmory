#!/usr/bin/env python3

from .fixer import WowToolsFixer
from .tools import icat, changelog


IGNORE_PET_NPCID = [
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
    load_files = True

    def _store_init(self, pets, battlepets):
        self.pets = pets
        self.battlepets = battlepets
        self.id_to_old_pet = {}

        self.wt_battlepetspecies = {
            e['ID']: e
            for e in self.wt_get_table('battlepetspecies')
        }
        self.wt_creature = {
            e['ID']: e for e in self.wt_get_table('creature')
        }
        self.wt_itemeffectbyspell = {
            e['SpellID']: e
            for e in self.wt_get_table('itemeffect')
        }
        self.wt_itembyeffect = {
            e['ItemEffectID']: e
            for e in self.wt_get_table('itemxitemeffect')
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
        spell_id = self.wt_battlepetspecies[pet_id]['SummonSpellID']
        creature_id = self.wt_battlepetspecies[pet_id]['CreatureID']
        if creature_id not in self.wt_creature:
            return
        name = self.wt_creature[creature_id]['Name_lang']

        # Icon
        icon_id = self.wt_battlepetspecies[pet_id]['IconFileDataID']
        icon_name = self.get_icon_name(int(icon_id))

        # Item
        try:
            item_effect_id = self.wt_itemeffectbyspell[spell_id]['ID']
            item_id = self.wt_itembyeffect[item_effect_id]['ItemID']
        except KeyError:
            item_id = None

        return {
            'ID': int(pet_id),
            'name': name,
            'icon': icon_name,
            'creatureId': int(creature_id),
            'spellid': int(spell_id),
            **({'itemId': item_id} if item_id else {})
        }

    def get_pet_source(self, pet_id):
        return PET_SOURCE_ENUM.get(
            int(self.wt_battlepetspecies[pet_id]['SourceTypeEnum']),
            'Unknown'
        )

    def fix_missing_pet(self, pet_id):
        if (
            # No summon spell ID
            not int(self.wt_battlepetspecies[pet_id]['SummonSpellID'])
            # Flag 0x20 : HideFromJournal
            or int(self.wt_battlepetspecies[pet_id]['Flags']) & 0x20
        ):
            return

        pet = self.get_pet(pet_id)
        if pet is None:
            return

        changelog('Pet {} missing: https://www.wowhead.com/npc={}'
                  .format(pet_id, pet['creatureId']))

        source = self.get_pet_source(pet_id)
        if source == 'Wild':
            icat(self.battlepets, 'TODO', 'TODO')['items'].append(pet)
        else:
            icat(self.pets, 'TODO', source)['items'].append(pet)

    def fix_missing_pets(self):
        for pet_id in self.wt_battlepetspecies:
            if (int(pet_id) not in self.id_to_old_pet
                    and int(pet_id) not in IGNORE_PET_NPCID):
                self.fix_missing_pet(pet_id)

    def fix_types_data(self):
        for cat in self.pets:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    fixed_pet = self.get_pet(int(item['ID']))
                    item['ID'] = fixed_pet['ID']
                    item['name'] = fixed_pet['name']
                    item['creatureId'] = fixed_pet['creatureId']
                    item['spellid'] = fixed_pet['spellid']

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
