import asyncio
import aiohttp
from aiohttp.helpers import BasicAuth
from urllib.parse import urljoin
from settings import OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REGION
from tqdm.asyncio import tqdm


class BnetClient:
    def __init__(self):
        self.access_token = None
        self.session = aiohttp.ClientSession()
        self.bliz_url = 'https://{}.battle.net/'.format(OAUTH_REGION)
        self.api_url = 'https://{}.api.blizzard.com/'

    async def __aenter__(self):
        await self.session.__aenter__()
        await self.login()
        return self

    async def __aexit__(self, exc_type, exc_value, tb):
        await self.session.__aexit__(exc_type, exc_value, tb)

    async def get_access_token(self):
        r = await self.session.post(self.bliz_url + 'oauth/token',
                                    auth=BasicAuth(OAUTH_CLIENT_ID,
                                                   OAUTH_CLIENT_SECRET),
                                    data={'grant_type': 'client_credentials'})
        return (await r.json())['access_token']

    async def login(self):
        if self.access_token is None:
            self.access_token = await self.get_access_token()

    async def query(self, path, region='us', **kwargs):
        url = urljoin(self.api_url, path).format(region)
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Battlenet-Namespace': 'static-us',
        }
        for i in range(5):  # retry 5 times if too many requests
            r = await self.session.get(url, headers=headers, **kwargs)
            if r.status == 429:
                await asyncio.sleep(2)
            else:
                break
        else:
            raise RuntimeError("Doing requests too fast")

        res = await r.json(content_type=None)
        if 'status' in res and res['status'] == 'nok':
            raise RuntimeError("Request failed: " + res['reason']
                               + "\nURL: " + url)
        return res

    async def achievement_category(self, cat_id=None):
        category = 'index' if cat_id is None else str(cat_id)
        return (await self.query(
            'data/wow/achievement-category/{}'.format(category),
            params={'locale': 'en_US'},
        ))

    async def achievement(self, ach_id):
        return (await self.query(
            'data/wow/achievement/{}'.format(ach_id),
            params={'locale': 'en_US'},
        ))

    async def achievement_media(self, ach_id):
        return (await self.query(
            'data/wow/media/achievement/{}'.format(ach_id),
            params={'locale': 'en_US'},
        ))

    async def mounts(self):
        return (await self.query('wow/mount/'))

    async def pets(self):
        return (await self.query('wow/pet/'))

    async def realms(self, region):
        params = {'namespace': 'dynamic-' + region,
                  'locale': 'en_US'}
        return (await self.query('data/wow/realm/', region=region,
                                 params=params))

    async def pets_species(self, species_id):
        return (await self.query('wow/pet/species/{}'.format(species_id)))

    async def item(self, item_id):
        return (await self.query(
            'data/wow/item/{}'.format(item_id),
            params={'locale': 'en_US'}
        ))

    async def item_media(self, ach_id):
        return (await self.query(
            'data/wow/media/item/{}'.format(ach_id),
            params={'locale': 'en_US'},
        ))

    async def pet_source(self, species_id):
        species = await self.pets_species(species_id)
        return species['source'].split(':')[0].strip()


def get_master_list(name, *args, **kwargs):
    assert name in ('mounts', 'pets', 'realms')

    async def get():
        async with BnetClient() as client:
            return (await getattr(client, name)(*args, **kwargs))
    return asyncio.run(get())


def media_to_icon(media):
    bnet_icon = media['assets'][0]['value']
    bnet_icon = bnet_icon[:-len('.jpg')]
    bnet_icon = bnet_icon.split('/')[-1]
    return bnet_icon


async def build_achievement_master_list():
    """
    This builds an old API-style achievement master list which can then be
    processed by the achievement fixer.
    """
    res = {}
    semaphore = asyncio.Semaphore(30)  # concurrent reqs

    async def enrich_achievement(ach):
        async with semaphore:
            data = await client.achievement(ach['id'])
            media = await client.achievement_media(ach['id'])
            ach.update(data)
            ach.update(media)

    async def enrich_achievement_list(achs):
        tasks = [enrich_achievement(ach) for ach in achs]
        for f in tqdm.as_completed(
            tasks,
            position=2,
            leave=False
        ):
            await f

    async with BnetClient() as client:
        index = await client.achievement_category()
        res['achievements'] = index['root_categories']
        res['achievements'] = [
            i for i in res['achievements'] if i['name'] != 'Guild'
        ]
        for supercat in tqdm(res['achievements'], position=0):
            supercat_data = await client.achievement_category(supercat['id'])
            supercat['display_order'] = supercat_data['display_order']
            if 'achievements' in supercat_data:
                supercat['achievements'] = supercat_data['achievements']
                await enrich_achievement_list(supercat['achievements'])
                supercat['achievements'].sort(
                    key=lambda x: x.get('display_order', 0)
                )
            if 'subcategories' in supercat_data:
                supercat['categories'] = supercat_data['subcategories']
                for cat in tqdm(
                    supercat['categories'],
                    position=1,
                    leave=False
                ):
                    cat_data = await client.achievement_category(cat['id'])
                    cat['display_order'] = cat_data['display_order']
                    cat['achievements'] = cat_data['achievements']
                    await enrich_achievement_list(cat['achievements'])
                    cat['achievements'].sort(
                        key=lambda x: x.get('display_order', 0)
                    )
                supercat['categories'].sort(
                    key=lambda x: x.get('display_order', 0)
                )
        res['achievements'].sort(key=lambda x: x.get('display_order', 0))

    return res
