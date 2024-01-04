import aiohttp
import asyncio
import csv
import functools
import html
import json
import re

def csv_to_list(csv_text, **kwargs):
    return list(csv.DictReader(csv_text.splitlines(), **kwargs))


# Converts 'Colname_0' -> 'Colname[0]' for compatibility with other providers
def fix_wago_csv_brackets(csv_list):
    res = [row.copy() for row in csv_list]
    for i, row in enumerate(csv_list):
        for k, v in row.items():
            res[i][re.sub(r'_([0-9]+)$', r'[\1]', k)] = v
    return res


class WowToolsClient:
    def __init__(self):
        self.session = None
        self.base_url = 'https://wago.tools'
        self.versions_url = f'{self.base_url}/db2/{{name}}'
        self.export_url = f'{self.base_url}/db2/{{name}}/csv'

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        await self.session.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_value, tb):
        await self.session.__aexit__(exc_type, exc_value, tb)

    async def get_table_versions(self, table_name):
        versions_url = self.versions_url.format(name=table_name)
        versions_response = await self.session.get(versions_url)
        page = (await versions_response.text())
        if (m := re.search(r'data-page="([^"]+)"', page)) is None:
            raise RuntimeError(f"Cannot find data-page= in {versions_url}")
        page_data = json.loads(html.unescape(m.group(1)))
        return page_data['props']['versions']

    async def get_matching_build_version(self, table_name, build=None):
        versions = (await self.get_table_versions(table_name))
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
    
    async def get_available_build_versions(self):
        # NOTE: passing in mount here for table, I think any table we 
        # pass or use should be the same, shouldn't need to specify
        versions = (await self.get_table_versions('mount'))
        versions.sort(
            key=lambda s: list(map(int, s.split('.'))),
            reverse=True
        )

        mainBuilds = {}
        print("Versions available:")
        for v in versions:
            vparts = v.split('.')
            mainBuild =  vparts[0] + "." + vparts[1] + "." + vparts[2]
            
            if mainBuild not in mainBuilds:
                mainBuilds[mainBuild] = []

            mainBuilds[mainBuild].append(vparts[3])
        
        for mainBuild in list(mainBuilds):
            print(mainBuild)
            for minorBuild in mainBuilds[mainBuild]:
                print("  " + mainBuild + "." + minorBuild + " ")

    async def get_table(self, table_name, build=None):
        build = (await self.get_matching_build_version(table_name, build))
        table_response = await self.session.get(
            self.export_url.format(name=table_name),
            params={'build': build}
        )
        return fix_wago_csv_brackets(
            csv_to_list(await table_response.text(encoding='utf-8'))
        )


@functools.lru_cache(maxsize=None)
def get_table(table_name, build=None):
    async def _get_table():
        async with WowToolsClient() as c:
            return (await c.get_table(table_name, build=build))
    return asyncio.run(_get_table())

@functools.lru_cache(maxsize=None)
def get_available_build_versions():
    print("Getting available versions from wago...")
    async def _get_available_build_versions():
        async with WowToolsClient() as c:
            return (await c.get_available_build_versions())
    return asyncio.run(_get_available_build_versions())
