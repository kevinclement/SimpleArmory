from .providers import wago


class WowToolsFixer:
    """Base class for Wodbcools-based data fixers."""
    def __init__(self, *args, build=None):
        self.build = build
        self._store_init(*args)
        self._dbc_manifest_interface_data = None

    def _store_init(self, *args):
        raise NotImplementedError

    def run(self):
        raise NotImplementedError

    def dbc_get_table(self, table_name):
        return wago.get_table(table_name, self.build) or {}

    def get_icon_name(self, icon_id: int):
        if self._dbc_manifest_interface_data is None:
            self._dbc_manifest_interface_data = {
                int(e['ID']): e
                for e in self.dbc_get_table('manifestinterfacedata')
            }
        icon_name = str(icon_id)
        if icon_id in self._dbc_manifest_interface_data:
            icon_path = self._dbc_manifest_interface_data[icon_id]['FileName']
            icon_name = icon_path.rsplit('.', 1)[0].lower().replace(' ', '-')
        return icon_name
