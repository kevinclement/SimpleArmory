import { t } from 'svelte-i18n';
import { getData } from '$api/_blizzard'
import { getJsonDb } from '$api/_db'
import Cache from '$api/_cache'

let _cache;
export async function getReputations(region, realm, character) {
    if (!_cache) {
        _cache = new Cache(region, realm, character);
    }
    else if (_cache.isValid(region, realm, character)) {
        return _cache.cache;
    }
   
    console.log('Getting factions...');
    const all_factions = await getJsonDb('factions');
    const my_reputations = await getData(region, realm, character, 'reputations');
    
    _cache.update(
        region,
        realm,
        character,
        parseFactions(all_factions, my_reputations)
    )
    return _cache.cache;
}

function parseFactions(all_factions, my_reputations) {
    var obj = { categories: [] };
    var standing = {};

    let defaultLevels = {
        0: 'hated',
        36000: 'hostile',
        39000: 'unfriendly',
        42000: 'neutral',
        45000: 'friendly',
        51000: 'honored',
        63000: 'revered',
        84000: 'exalted',
    }

    // Build up lookup for factions
    my_reputations.reputations.forEach((rep) => {
        var calculatedPerc = (rep.standing.value / rep.standing.max) * 100;

        standing[rep.faction.id] = {
            level: rep.standing.tier,
            perc: (isNaN(calculatedPerc) ? 100 : calculatedPerc),
            value: rep.standing.value,
            max: rep.standing.max
        };
    });

    // We look up each faction in the character.
    // For each level of the faction, we compare it to the character
    // We fill in the level percentages based on this.
    // The controller takes those percentages and sizes the bars

    // Pull all the factions out of the json
    all_factions.forEach((factionCategory) => {
        var fc = {
            name: factionCategory.name,
            factions: []
        };

        factionCategory.factions.forEach((faction) => {
            var f = {
                id: faction.id,
                name: faction.name,
                levels: levelsAsList(faction.levels ? faction.levels : defaultLevels),
            };

            var stand = standing[faction.id];
            if (stand)
            {
                f.level = stand.level;
                f.perc = stand.perc;
                f.value = stand.value;
                f.max = stand.max;
                fc.factions.push(f);
            }
        });

        if (fc.factions.length > 0) {
            obj.categories.push(fc);
        }
    });

    // Data object we expose externally
    return obj;
}

function levelsAsList(levelsDict) {
    var items = Object.keys(levelsDict).map(function(key) {
        return [key, levelsDict[key]];
    });
    items.sort(function(first, second) {
        return first[0] - second[0];
    });
    for (i = 0; i < items.length; i++) {
        items[i][0] = parseInt(items[i][0]);
    }
    return items;
}
