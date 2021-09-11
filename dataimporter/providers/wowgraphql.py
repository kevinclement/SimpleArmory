# I want this program to be usable without getting a token in the official API.
# They have an unofficial GraphQL API that you can query to get the list of
# realms, so I'm using that instead.

import asyncio
import aiohttp


async def get_realm_list(session, region):
    api_url = 'https://worldofwarcraft.com/graphql'
    graphql_realm_query = {
        "operationName": "GetInitialRealmStatusData",
        "variables": {
            "input": {
                "compoundRegionGameVersionSlug": region
            }
        },
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": (
                    "9c7cc66367037fda3007b7f592201c26"
                    "10edb2c9a9292975cd131a37bbe61930"
                )
            }
        }
    }
    res = await session.post(
        api_url,
        json=graphql_realm_query,
    )
    return (await res.json())


def get_realm_list_sync(region):
    async def _run():
        async with aiohttp.ClientSession() as session:
            return (await get_realm_list(session, region))
    return asyncio.run(_run())
