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

        var tillerCategory = false;

        factionCategory.factions.forEach((faction) => {
            var f = {
                id: faction.id,
                name: faction.name
            };

            var stand = standing[f.id];

            if (stand)
            {
                // fill out the faction values for this user
                if (isTillerFaction(faction.id)) { 
                    f.stranger = calculateLevelPercent(0, stand);
                    f.acquaintance = calculateLevelPercent(1, stand);
                    f.buddy = calculateLevelPercent(2, stand);
                    f.friend = calculateLevelPercent(3, stand);
                    f.goodFriends = calculateLevelPercent(4, stand);
                    f.bestFriends = calculateLevelPercent(5, stand);
                    f.value = stand.value;
                    f.max = stand.max;
                    f.isTiller = true;

                    tillerCategory = true;
                }
                else {
                    f.hated = calculateLevelPercent(0, stand);
                    f.hostel = calculateLevelPercent(1, stand);
                    f.unfriendly = calculateLevelPercent(2, stand);
                    f.neutral = calculateLevelPercent(3, stand);
                    f.friendly = calculateLevelPercent(4, stand);
                    f.honored = calculateLevelPercent(5, stand);
                    f.revered = calculateLevelPercent(6, stand);
                    f.exalted = calculateLevelPercent(7, stand);
                    f.value = stand.value;
                    f.max = stand.max;      
                }

                fc.factions.push(f);
            }
        });

        if (tillerCategory) {
            fc.isTiller = true;
        }

        if (fc.factions.length > 0) {
            obj.categories.push(fc);
        }                
    });

    // Data object we expose externally
    return obj;
}

function calculateLevelPercent(level, stand) {
    if (level === stand.level) {
        return stand.perc;
    }
    else if (level < stand.level) {
        return 100;
    }
    else {
        return 0;
    }            
}

function isTillerFaction(id) {
    return id === '1273' || id === '1275' || id === '1276' || 
           id === '1277' || id === '1278' || id === '1279' || 
           id === '1280' || id === '1281' || id === '1282' || 
           id === '1283';
}