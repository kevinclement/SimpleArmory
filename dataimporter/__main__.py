import argparse
import logging
import json
from pathlib import Path

from .achievements import AchievementFixer
from .factions import FactionFixer
from .heirlooms import HeirloomFixer
from .mounts import MountFixer
from .pets import PetFixer
from .realms import RealmFixer
from .titles import TitleFixer
from .toys import ToyFixer

from .providers import wago

FIXERS = {
    'achievements': (AchievementFixer, ['achievements.json']),
    'heirlooms': (HeirloomFixer, ['heirlooms.json']),
    'mounts': (MountFixer, ['mounts.json']),
    'pets': (PetFixer, ['pets.json', 'battlepets.json']),
    'reputations': (FactionFixer, ['factions.json']),
    'titles': (TitleFixer, ['titles.json']),
    'toys': (ToyFixer, ['toys.json']),
}

# BUG: #569: looks like realm graphql API isn't working anymore
# I'm getting error: PersistedQueryNotSupported, which seems to suggest
# that maybe it needs auth now too?  I haven't found documentation anywhere 
# for the graphql API, so kind of blocked here.  I suspect we'll need to switch to
# official wow api with a token, which is a bit of a pain. 
#
#    'realms': (RealmFixer, ['servers.eu.json', 'servers.us.json']),

def parse_args():
    def fixer_arg(value: str):
        fixers = value.split(',')
        for fixer in fixers:
            if fixer not in FIXERS:
                raise argparse.ArgumentTypeError(
                    f"Fixer {fixer} does not exit")
        return fixers

    def datadir_arg(value: str):
        p = Path(value)
        if not p.exists():
            raise argparse.ArgumentTypeError(
                f"Path {value} does not exist. Specify it with --datadir?"
            )
        return p

    parser = argparse.ArgumentParser(
        description="Import WoW data to SimpleArmory's JSON database"
    )
    parser.add_argument(
        '--fixers',
        default=','.join(FIXERS.keys()),
        type=fixer_arg,
        help=(
            "Comma-separated list of data importers to run, among: [{}]"
            .format(', '.join(FIXERS.keys()))
        )
    )
    parser.add_argument(
        '--datadir',
        default='./static/data',
        type=datadir_arg,
        help=("Path to the SimpleArmory JSON database directory."
              " Defaults to ./static/data")
    )
    parser.add_argument(
        '--build',
        help=("WoW build prefix (e.g., '9.1' or '9.1.5.40078')."
              " By default the most recent build is used."),
    )
    parser.add_argument(
        '--format-only',
        action='store_true',
        default=False,
        help="Reformat the data files only, do not import any data"
    )
    parser.add_argument(
        '--print-versions',
        action='store_true',
        help="Print the available versions we can update to"
    )
    args = parser.parse_args()
    return args


def main():
    logging.basicConfig(level=logging.INFO)
    args = parse_args()

    if args.print_versions:
        wago.get_available_build_versions()
        return

    for fixer_name in args.fixers:
        fixer_cls, paths = FIXERS[fixer_name]
        json_paths = [args.datadir / p for p in paths]
        jsons = [json.loads(p.read_text()) for p in json_paths]
        if args.format_only:
            logging.info(f"Reformatting {fixer_name}.")
            fixed_list = jsons
        else:
            logging.info(f"Running fixer '{fixer_name}'.")
            fixer = fixer_cls(*jsons, build=args.build)
            fixed_list = fixer.run()
        for fixed_content, path in zip(fixed_list, json_paths):
            with path.open('w', encoding='utf8') as json_file:
                json.dump(
                    fixed_content,
                    json_file,
                    indent=2,
                    sort_keys=True,
                    ensure_ascii=False
                )
                json_file.write('\n')


if __name__ == '__main__':
    # XXX: Fix asyncio.run() for Windows:
    # https://bugs.python.org/issue39232
    # https://stackoverflow.com/questions/63860576
    import platform
    import asyncio
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    main()
