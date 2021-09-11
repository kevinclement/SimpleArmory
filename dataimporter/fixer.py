from .providers import wowtools


class WowToolsFixer:
    """Base class for Wowtools-based data fixers."""
    load_files = False

    def __init__(self, *args, build=None):
        self.build = build
        self._store_init(*args)
        if self.load_files:
            self.wt_files = {
                int(e['ID']): e for e in self.wt_get_table('files')
            }

    def _store_init(self, *args):
        raise NotImplementedError

    def run(self):
        raise NotImplementedError

    def wt_get_table(self, table_name):
        return wowtools.get_table(table_name, self.build)

    def get_icon_name(self, icon_id: int):
        assert self.load_files
        if icon_id not in self.wt_files:
            icon_name = str(icon_id)
        else:
            icon_path = self.wt_files[icon_id]['Path']
            icon_name = icon_path.split('/')[-1].rsplit('.', 1)[0].lower()
            icon_name = icon_name.replace(' ', '-')
        return icon_name
