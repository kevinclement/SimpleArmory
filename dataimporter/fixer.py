from .providers import wowtools


class WowToolsFixer:
    """Base class for Wowtools-based data fixers."""
    def __init__(self, *args, build=None):
        self.build = build
        self._store_init(*args)
        self._wt_manifest_interface_data = None

    def _store_init(self, *args):
        raise NotImplementedError

    def run(self):
        raise NotImplementedError

    def wt_get_table(self, table_name):
        return wowtools.get_table(table_name, self.build)

    def get_icon_name(self, icon_id: int):
        if self._wt_manifest_interface_data is None:
            self._wt_manifest_interface_data = {
                int(e['ID']): e
                for e in self.wt_get_table('manifestinterfacedata')
            }
        icon_name = str(icon_id)
        if icon_id in self._wt_manifest_interface_data:
            icon_path = self._wt_manifest_interface_data[icon_id]['FileName']
            icon_name = icon_path.rsplit('.', 1)[0].lower().replace(' ', '-')
        return icon_name
