import asyncio
import aiohttp
from aiohttp.helpers import BasicAuth
from urllib.parse import urljoin
from settings import OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REGION


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
            'Authorization': 'Bearer ' + self.access_token,
            'Battlenet-Namespace': 'static-us',
        }
        r = await self.session.get(url, headers=headers, **kwargs)
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
