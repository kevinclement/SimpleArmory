import binascii
import os
import sys


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


def genid():
    return binascii.b2a_hex(os.urandom(4)).decode('ascii')


def list_find(L, pred):
    return next(item for item in L if pred(item))


def filter_del(L, cond, deleted=None, format_deleted=None):
    kept = [item for item in L if cond(item)]
    if deleted is not None:
        if format_deleted is None:
            format_deleted = lambda x: x  # noqa
        deleted.extend(format_deleted(item) for item in L if not cond(item))
    return kept


def sort_try_respect_order(L, order_list, key='name'):
    d = {k: v for v, k in enumerate(order_list)}
    L.sort(key=lambda k: d.get(k[key], float('inf')))


def find_or_create_item(L, name, subitems_name=None, error_absent=False):
    try:
        return list_find(L, lambda x: x['name'] == name)
    except StopIteration:
        if not error_absent:
            d = {'id': genid(), 'name': name}
            if subitems_name:
                d[subitems_name] = []
            L.append(d)
            return d
        else:
            raise


def icat(dct, cat=None, subcat=None, error_absent=False):
    res = None
    if cat is not None:
        res = find_or_create_item(dct, cat, 'subcats', error_absent)
    if subcat is not None and res is not None:
        res = find_or_create_item(
            res['subcats'], subcat, 'items', error_absent
        )
    return res


def iscat(dct, supercat=None, cat=None, subcat=None, *, error_absent=False):
    res = None
    if supercat is not None:
        res = find_or_create_item(
            dct['supercats'], supercat, 'cats', error_absent
        )
    if cat is not None and res is not None:
        res = find_or_create_item(res['cats'], cat, 'subcats', error_absent)
    if subcat is not None and res is not None:
        res = find_or_create_item(
            res['subcats'], subcat, 'items', error_absent
        )
    return res
