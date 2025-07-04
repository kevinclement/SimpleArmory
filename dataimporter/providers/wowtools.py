import asyncio
import aiohttp
import csv
import functools


def csv_to_list(csv_text, **kwargs):
    return list(csv.DictReader(csv_text.splitlines(), **kwargs))


class WowToolsClient:
    def __init__(self):
        self.session = None
        self.base_url = 'https://wow.tools'
        self.api_url = 'https://api.wow.tools'
        self.export_url = f'{self.base_url}/dbc/api/export'

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        await self.session.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_value, tb):
        if self.session is not None:
            await self.session.__aexit__(exc_type, exc_value, tb)

    async def get_table_versions(self, table_name):
        if self.session is not None:
            versions_url = f'{self.api_url}/databases/{table_name}/versions'
            versions_response = await self.session.get(versions_url)
            res = (await versions_response.json())
            return res

    async def get_matching_build_version(self, table_name, build=None):
        versions = (await self.get_table_versions(table_name))
        if versions is not None:
            versions.sort(
                key=lambda s: list(map(int, s.split('.'))),
                reverse=True
            )
            if build is None:
                return versions[0]
            else:
                for v in versions:
                    if v.startswith(build):
                        return v
                versions_error_msg = ', '.join(versions[:10] + ['...'])
                raise RuntimeError(
                    f"No matching version found for build {build} in table"
                    f" {table_name}. Available versions: [{versions_error_msg}]."
                )

    async def get_table(self, table_name, build=None):
        if self.session is not None:
            build = (await self.get_matching_build_version(table_name, build))
            if table_name is not None and build is not None:
                table_response = await self.session.get(
                    self.export_url,
                    params={'name': table_name, 'build': build}
                )
                return csv_to_list(await table_response.text(encoding='utf-8'))


@functools.lru_cache(maxsize=None)
def get_table(table_name, build=None):
    async def _get_table():
        async with WowToolsClient() as c:
            return (await c.get_table(table_name, build=build))
    return asyncio.run(_get_table())
