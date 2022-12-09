import asyncio
import aiohttp
import csv
import functools


# An HTTP link from which the dbc CSVs can be fetched.
# TODO: make it a cmdline parameter, or configurable in some other way.
BASE_URL = 'https://github.com/maxdekrieger/wow-csv-from-db2s/raw/main/versions/{build}/csv/{table}.csv'


def csv_to_list(csv_text, **kwargs):
    return list(csv.DictReader(csv_text.splitlines(), **kwargs))


@functools.lru_cache(maxsize=None)
def get_table(table_name, build=None):
    if build is None:
        build='10.0.2.46999'

    async def _get_table():
        async with aiohttp.ClientSession() as session:
            url = BASE_URL.format(build=build, table=table_name)
            res = await session.get(url)
            if res.status != 200:
                raise aiohttp.ClientError(
                    f"URL {url} returned status: {res.status}"
                )
            return csv_to_list(await res.text(encoding='utf-8'))
    return asyncio.run(_get_table())
