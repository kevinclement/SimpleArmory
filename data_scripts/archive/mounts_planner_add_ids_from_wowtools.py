#!/usr/bin/env python3

import csv
import json
import logging
import sys

def changelog(*args, **kwargs):
    print(*args, **kwargs, file=sys.stderr)


class PlannerFixer:
    def __init__(self, spellid_to_id, planner):
        self.spellid_to_id = spellid_to_id
        self.planner = planner

    def fixSteps(self, steps, prefix):
        for step in steps:
            #print(prefix, step['title'])
            if ('bosses' in step):
                for boss in step['bosses']:
                    if ('spellId' in boss and boss['spellId'] in self.spellid_to_id):
                        boss['ID'] = self.spellid_to_id[boss['spellId']]
            if ('steps' in step):
                self.fixSteps(step['steps'], prefix + '  ')

    def run(self):
        self.fixSteps(self.planner['steps'], '')
        
        # dump json out of new json
        json.dump(self.planner, sys.stdout, indent=2, sort_keys=True)

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        sys.exit("Usage: {} planner.json wowtools-mounts.csv")

    with open(sys.argv[2]) as csvfile:
        spellid_to_id = {}
        reader = csv.DictReader(csvfile)
        for row in reader:
            # print(row['Name_lang'],row['ID'], row['SourceSpellID'])
            spellid_to_id[int(row['SourceSpellID'])] = row['ID']

        planner = json.load(open(sys.argv[1]))

        fixer = PlannerFixer(spellid_to_id, planner)
        fixer.run()
