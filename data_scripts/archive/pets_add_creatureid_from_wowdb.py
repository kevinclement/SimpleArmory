#!/usr/bin/env python3

import aiohttp
import asyncio
import json
import logging
import sys
import tqdm


WOWDB_API_SPELL = 'https://www.wowdb.com/api/spell/{}'


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


class PetsCreatureIdFixer:
    def __init__(self, pets):
        self.pets = pets

    async def get_creature_id(self, session, spell_id):
        res = await session.get(WOWDB_API_SPELL.format(spell_id))
        d = await res.text()
        d = d.rstrip(')').lstrip('(')
        d = json.loads(d)
        return d['Effects'][0]['Misc1']

    async def update_creature_id(self, sem, session, pbar, pet):
        if 'creatureId' in pet and pet['creatureId']:
            return
        async with sem:
            creature_id = await self.get_creature_id(session, pet['spellid'])
        pet['creatureId'] = creature_id
        # tqdm.tqdm.write('Got creatureId {} for pet {}'.format(
        #     pet['creatureId'], pet['spellid']))
        pbar.update(1)

    async def update_all_creature_ids(self):
        sem = asyncio.Semaphore(30)  # 30 parallel requests
        session = aiohttp.ClientSession()
        tasks = []
        async with session:
            with tqdm.tqdm(total=0) as pbar:
                for cat in self.pets:
                    for subcat in cat['subcats']:
                        for item in subcat['items']:
                            pbar.total += 1
                            tasks.append(self.update_creature_id(sem, session,
                                                                 pbar, item))
            await asyncio.gather(*tasks)

    def run(self):
        asyncio.run(self.update_all_creature_ids())
        json.dump(self.pets, sys.stdout, indent=2, sort_keys=True)


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    if len(sys.argv) < 2:
        sys.exit("Usage: {} pets.json")

    pets = json.load(open(sys.argv[1]))

    fixer = PetsCreatureIdFixer(pets)
    fixer.run()
