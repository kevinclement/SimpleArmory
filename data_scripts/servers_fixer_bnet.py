#!/usr/bin/env python3

import bnet
import json
import os
import sys


def write_server_json(master_list, path):
    realm_list = [{'name': realm['name'],
                   'slug': realm['slug']}
                  for realm in master_list['realms']]
    realm_list.sort(key=lambda k: k['name'])
    realms = {'realms': realm_list}
    with open(path, 'w') as f:
        json.dump(realms, f, indent=2, sort_keys=True, ensure_ascii=False)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit("Usage: {} path/to/app/data")

    for region in ('eu', 'us'):
        bnet_servers = bnet.get_master_list('realms', region)
        realm_f = os.path.join(sys.argv[1], 'servers.{}.json'.format(region))
        write_server_json(bnet_servers, realm_f)
