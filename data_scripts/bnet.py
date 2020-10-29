import asyncio
import aiohttp
from aiohttp.helpers import BasicAuth
from urllib.parse import urljoin
from settings import OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REGION, NAMESPACE, LOCALE


class BnetClient:
    def __init__(self):
        self.access_token = None
        self.session = aiohttp.ClientSession()
        self.battle_net_url = 'https://{}.battle.net/'.format(OAUTH_REGION)
        self.api_url = 'https://{}.api.blizzard.com/'

    async def __aenter__(self):
        await self.session.__aenter__()
        await self.login()
        return self

    async def __aexit__(self, exc_type, exc_value, tb):
        await self.session.__aexit__(exc_type, exc_value, tb)

    async def get_access_token(self):
        """Returns a new access token for the battle.net API"""
        response = await self.session.post(
            self.battle_net_url + 'oauth/token',
            auth=BasicAuth(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET),
            data={'grant_type': 'client_credentials'}
        )
        return (await response.json())['access_token']

    async def login(self):
        """Tries to get a new access token"""
        if self.access_token is None:
            self.access_token = await self.get_access_token()

    async def query(self, path, region='eu', **kwargs):
        """Queries the battle.net API"""
        url = urljoin(self.api_url, path).format(region)
        headers = {
            'Authorization': 'Bearer ' + self.access_token
        }
        client_response = await self.session.get(url, headers=headers, **kwargs)
        json_response = await client_response.json(content_type=None)
        if 'status' in json_response and json_response['status'] == 'nok':
            raise RuntimeError("Request failed: " + json_response['reason'] + "\nURL: " + url)
        return json_response

    async def achievement_category(self, category_id=None):
        """Queries the battle.net API for a list of all achievement categories"""
        category = 'index' if category_id is None else str(category_id)
        url = 'data/wow/achievement-category/{}'.format(category)
        params = {
            'locale': LOCALE,
            'namespace': get_namespace('static')
        }
        return await self.query(url, params=params)

    async def achievement(self, achievement_id):
        """Queries the battle.net API for a list of all achievements"""
        url = 'data/wow/achievement/{}'.format(achievement_id)
        params = {
            'locale': LOCALE,
            'namespace': get_namespace('static')
        }
        return await self.query(url, params=params)

    async def achievement_media(self, achievement_id):
        """Queries the battle.net API for image data of a specific achievement"""
        url = 'data/wow/media/achievement/{}'.format(achievement_id)
        params = {
            'locale': LOCALE,
            'namespace': get_namespace('static')
        }
        return await self.query(url, params=params)

    async def mounts(self):
        """Queries the battle.net API for a list of all mounts"""
        params = {
            'locale': LOCALE,
            'namespace': get_namespace('static')
        }
        return await self.query('data/wow/mount/index', params=params)

    async def realms(self, region):
        """Queries the battle.net API for a list of all realms for the given region"""
        params = {
            'locale': LOCALE,
            'namespace': get_namespace('dynamic'),
        }
        return await self.query('data/wow/realm/', region=region, params=params)

    async def item(self, item_id):
        """Queries the battle.net API for the data of a given item"""
        url = 'data/wow/item/{}'.format(item_id)
        params = {
            'locale': LOCALE,
            'namespace': get_namespace('static')
        }
        return await self.query(url, params=params)

    async def pets(self):
        """Queries the battle.net API for a list of all pets"""
        params = {
            'locale': LOCALE,
            'namespace': get_namespace('static')
        }
        return await self.query('data/wow/pet/index', params=params)

    async def pets_species(self, species_id):
        return await self.query('wow/pet/species/{}'.format(species_id))

    async def pet_source(self, species_id):
        species = await self.pets_species(species_id)
        return species['source'].split(':')[0].strip()


def get_namespace(namespace):
    return namespace + '-{}'.format(OAUTH_REGION.lower())


def get_master_list(name, *args, **kwargs):
    assert name in ('mounts', 'pets', 'realms')

    async def get():
        async with BnetClient() as client:
            return await getattr(client, name)(*args, **kwargs)
    return asyncio.get_event_loop().run_until_complete(get())
