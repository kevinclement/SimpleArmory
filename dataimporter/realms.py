#!/usr/bin/env python3


from .providers import wowgraphql


class RealmFixer:
    def __init__(self, realms_eu, realms_us, build=None):
        self.realms_eu = realms_eu
        self.realms_us = realms_us

    def fix_realms(self, region):
        master_list = wowgraphql.get_realm_list_sync(region)
        realm_list = [
            {'name': realm['name'], 'slug': realm['slug']}
            for realm in master_list['data']['Realms']
        ]
        realm_list.sort(key=lambda k: k['name'])
        realms = {'realms': realm_list}
        return realms

    def run(self):
        self.realms_eu = self.fix_realms('eu')
        self.realms_us = self.fix_realms('us')
        return [self.realms_eu, self.realms_us]
