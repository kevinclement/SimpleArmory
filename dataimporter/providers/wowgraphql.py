# I want this program to be usable without getting a token in the official API.
# They have an unofficial GraphQL API that you can query to get the list of
# realms, so I'm using that instead.

import asyncio
import aiohttp


async def get_realm_list(session, region):
    api_url = 'https://worldofwarcraft.blizzard.com/en-us/graphql'
    graphql_realm_query = {
        "operationName": "GetRealmStatusData",
        "variables": {
            "input": {
                "compoundRegionGameVersionSlug": region
            }
        },
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": (
                    "b37e546366a58e211e922b8c96cd1ff7"
                    "4249f564a49029cc9737fef3300ff175"
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
