#!/usr/bin/env python3

# Copyright (C) 2018 Antoine Pietri
# SPDX-License-Identifier: MIT

# Minimalist SimpleArmory HTTP proxy for Blizzard character data

import argparse
import datetime
import aiohttp
import aiohttp.web

from aiohttp.helpers import BasicAuth
from urllib.parse import urljoin


OAUTH_REGION = 'us'


async def get_character(request):
    region = request.match_info['region']
    realm = request.match_info['realm']
    character = request.match_info['character']

    # Update access token if needed
    if ((not request.app.last_token
         or request.app.last_token_expires_at > datetime.datetime.now())):
        blizz_oauth_url = 'https://us.battle.net/'
        r = await request.app.session.post(
            urljoin(blizz_oauth_url, 'oauth/token'),
            auth=BasicAuth(request.app.client_id, request.app.client_secret),
            data={'grant_type': 'client_credentials'})
        data = (await r.json())
        request.app.last_token = data['access_token']
        request.app.last_token_expires_at = (
            datetime.datetime.now()
            + datetime.timedelta(seconds=min(3600, data['expires_in'] - 60)))

    # Download character data
    blizz_api_url = ('https://{}.api.blizzard.com/wow/character/{}/{}'
                     .format(region, realm, character))
    oauth_header = {'Authorization': 'Bearer ' + request.app.last_token}
    params = {'fields': 'pets,mounts,achievements,guild,reputation'}
    r = await request.app.session.get(blizz_api_url, headers=oauth_header,
                                      params=params)
    res = await r.json(content_type=None)

    # Forward response to client
    return aiohttp.web.json_response(
        res, headers={'Access-Control-Allow-Origin': '*'})


async def make_app(client_id, client_secret):
    app = aiohttp.web.Application()
    app.add_routes([aiohttp.web.get('/character/{region}/{realm}/{character}',
                                    get_character)])
    app.client_id = client_id
    app.client_secret = client_secret
    app.session = await aiohttp.ClientSession().__aenter__()
    app.last_token = None
    app.last_token_expires_in = None
    return app


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='SimpleArmory HTTP proxy for Blizzard character data')
    parser.add_argument('--host', default='127.0.0.1', help='Bind address')
    parser.add_argument('--port', default=9012, help='Bind port')
    parser.add_argument('oauth_client_id')
    parser.add_argument('oauth_client_secret')

    args = parser.parse_args()

    aiohttp.web.run_app(make_app(args.oauth_client_id,
                                 args.oauth_client_secret),
                        host=args.host, port=args.port)
