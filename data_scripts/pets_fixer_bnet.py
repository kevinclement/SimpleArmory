#!/usr/bin/env python3

import aiohttp
import asyncio
import json
import logging
import lxml.etree
import re
import sys
import tqdm


IGNORE_PETS_CREATUREIDS = [
]


WOWDB_NPCS_PAGE = 'https://www.wowdb.com/npcs/{}'
WOWDB_API_ITEM = 'https://www.wowdb.com/api/item/{}'


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


class PetFixer:
    def __init__(self, bnet_pets, pets, battlepets):
        self.bnet_pets = bnet_pets
        self.pets = pets
        self.battlepets = battlepets
        self.id_to_old_pet = {}
        self.id_to_bnet_pet = {}

        self.register_old_pets()
        self.register_bnet_pets()

    def register_old_pets(self):
        for cat in self.pets + self.battlepets:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    self.id_to_old_pet[int(item['creatureId'])] = item

    def register_bnet_pets(self):
        for pet in self.bnet_pets['pets']:
            if pet['creatureId'] not in IGNORE_PETS_CREATUREIDS:
                self.id_to_bnet_pet[int(pet['creatureId'])] = pet

    def removed(self):
        return set(self.id_to_old_pet.keys() - self.id_to_bnet_pet.keys())

    def missing(self):
        return set(self.id_to_bnet_pet.keys() - self.id_to_old_pet.keys())

    async def get_item_spell(self, session, item_id):
        res = await session.get(WOWDB_API_ITEM.format(item_id))
        d = await res.text()
        d = d.rstrip(')').lstrip('(')
        d = json.loads(d)
        spell_id = next(s['SpellID'] for s in d['Spells'] if s['Text'])
        return spell_id

    async def get_pet_source(self, session, creature_id):
        while True:
            res = await session.get(WOWDB_NPCS_PAGE.format(creature_id))
            if res.status == 429:
                retry_after = int(res.headers['Retry-After'])
                tqdm.tqdm.write('Cloudflare Retry-After: {}'
                                .format(retry_after))
                await asyncio.sleep(2)
            else:
                break

        page = await res.text()
        await asyncio.sleep(1)

        dom = lxml.etree.HTML(page)
        learned_from = dom.xpath('//div[@id="tab-learned-from"]')
        if not learned_from:
            # Wild pet
            pet = {'name': self.id_to_bnet_pet[creature_id]['name'],
                   'icon': self.id_to_bnet_pet[creature_id]['icon'],
                   'creatureId': creature_id,
                   'spellid': None}
            return 'wild', pet

        div = learned_from[0]
        item_link = div.xpath('.//a[contains(@href,"item")]')[1]
        img_link = div.xpath('.//img[contains(@src,"media-azeroth")]')[0]

        name = item_link.text

        item_url = item_link.get('href')
        item_id = int(re.search('items/([0-9]+)-', item_url).group(1))

        icon_url = img_link.get('src')
        icon = re.search(r'medium/([^\.]+).', icon_url).group(1)

        spell_id = await self.get_item_spell(session, item_id)

        pet = {'name': name,
               'icon': icon,
               'creatureId': creature_id,
               'itemId': item_id,
               'spellid': spell_id}
        return ('companion', pet)

    async def add_missing_pet(self, sem, session, pbar, creature_id):
        async with sem:
            type, pet = await self.get_pet_source(session, creature_id)
        if type == 'wild':
            self.todo_battlepets.append(pet)
        else:
            self.todo_companions.append(pet)
        pbar.update(1)

    async def retrieve_missing_pets(self):
        sem = asyncio.Semaphore(2)  # 2 parallel requests
        session = aiohttp.ClientSession()
        tasks = []
        missing = self.missing()
        self.todo_battlepets = []
        self.todo_companions = []
        async with session:
            with tqdm.tqdm(total=len(missing)) as pbar:
                for creature_id in missing:
                    tasks.append(self.add_missing_pet(
                        sem, session, pbar, creature_id))
                await asyncio.gather(*tasks)
        json.dump(self.todo_battlepets, sys.stdout, indent=2, sort_keys=True)
        print()
        json.dump(self.todo_companions, sys.stdout, indent=2, sort_keys=True)

    def fix_missing(self):
        for creatureId in self.missing():
            pet = self.id_to_bnet_pet[creatureId]
            print('Pet {} missing: {} https://www.wowhead.com/npc={}'
                  .format(creatureId, pet['name'], creatureId))
        asyncio.run(self.retrieve_missing_pets())

    def run(self):
        self.fix_missing()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 4:
        sys.exit("Usage: {} bnet_pets.json pets.json battlepets.json")

    bnet_pets = json.load(open(sys.argv[1]))
    pets = json.load(open(sys.argv[2]))
    battlepets = json.load(open(sys.argv[3]))

    fixer = PetFixer(bnet_pets, pets, battlepets)
    fixer.run()
