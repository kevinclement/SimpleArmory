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
        self.api_url = 'https://{}.api.blizzard.com/'.format(OAUTH_REGION)

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

    async def query(self, path):
        url = urljoin(self.api_url, path)
        oauth = {'Authorization': 'Bearer ' + self.access_token}
        r = await self.session.get(url, headers=oauth)
        res = await r.json(content_type=None)
        if 'status' in res and res['status'] == 'nok':
            raise RuntimeError("Request failed: " + res['reason']
                               + "\nURL: " + url)
        return res

    async def achievements(self):
        return (await self.query('wow/data/character/achievements'))

    async def mounts(self):
        return (await self.query('wow/mount/'))

    async def pets(self):
        return (await self.query('wow/pet/'))

    async def pets_species(self, species_id):
        return (await self.query('wow/pet/species/{}'.format(species_id)))

    async def pet_source(self, species_id):
        species = await self.pets_species(species_id)
        return species['source'].split(':')[0].strip()


def get_master_list(name):
    assert name in ('mounts', 'pets', 'achievements')

    async def get():
        async with BnetClient() as client:
            return (await getattr(client, name)())
    return asyncio.run(get())
