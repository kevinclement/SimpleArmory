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
        0: 'Hated',
        36000: 'Hostile',
        39000: 'Unfriendly',
        42000: 'Neutral',
        45000: 'Friendly',
        51000: 'Honored',
        63000: 'Revered',
        84000: 'Exalted',
    }

    // Build up lookup for factions
    my_reputations.reputations.forEach((rep) => {
        var calculatedPerc = (rep.standing.value / rep.standing.max) * 100;

        standing[rep.faction.id] = {
            // tier is called renown_level for renown factions such as those in dragonflight
            level: rep.standing.tier != undefined ? rep.standing.tier : rep.standing.renown_level,
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

            // If it's a faction with renown such as Dragonflight factions
            if (faction.maxRenown) {
                f.levels = maxRenownToLevels(faction.maxRenown);
            }

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

function maxRenownToLevels(maxRenown, step = 2500) {
    var items = [];
    for (i = 0; i <= maxRenown; i++) {
        items.push([i * step, "Renown 0" + i])
    }
    return items;
}
