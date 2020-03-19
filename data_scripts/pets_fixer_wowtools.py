
#!/usr/bin/env python3

import csv
import json
import logging
import sys


def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)

class PetsCreatureIdFixer:
    def __init__(self, pets, creatureid_to_id):
        self.pets = pets
        self.creatureid_to_id = creatureid_to_id

    def run(self):
        found_ids = {}
        for cat in self.pets:
            for subcat in cat['subcats']:
                for item in subcat['items']:
                    cid = int(item['creatureId'])
                    if (cid in self.creatureid_to_id):
                        found_ids[cid] = True
                        item['ID'] = self.creatureid_to_id[cid]
                    #else:
                        #print("DIDNT FIND ", cid)
                        #json.dump(item, sys.stdout, indent=2, sort_keys=True)
                        #print()

                    #if (item['creatureId'] not in found_ids):
                    #    creatureIds[item['creatureId']] = True
                    #else:
                    #    print("DUPE: ", item['creatureId'])

        # dump json out of new json
        json.dump(self.pets, sys.stdout, indent=2, sort_keys=True)


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    if len(sys.argv) < 2:
        sys.exit("Usage: {} pets.json wowtools.pets.csv")

    with open(sys.argv[2]) as csvfile:
        creatureid_to_id = {}
        reader = csv.DictReader(csvfile)
        for row in reader:
            cid = int(row['CreatureID'])
            #print(row['CreatureID'],"=>",row['ID'])
            creatureid_to_id[cid] = row['ID']

        pets = json.load(open(sys.argv[1]))

        fixer = PetsCreatureIdFixer(pets, creatureid_to_id)
        fixer.run()
