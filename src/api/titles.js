import { getData } from '$api/_blizzard'
import { getProfile } from '$api/profile'
import { getJsonDb } from '$api/_db'
import Cache from '$api/_cache'

let _cache;
export async function getTitles(region, realm, character) {   
    if (!_cache) {
        _cache = new Cache(region, realm, character);
    }
    else if (_cache.isValid(region, realm, character)) {
        return _cache.cache;
    }

    // get profile
    const profile = await getProfile(region, realm, character);
    if (!profile || (profile.status && profile.status === 404)) {
        return undefined;
    }

    // get json
    const db = await getJsonDb('titles');
    
    // get character collected
    const earned = await getData(region, realm, character, 'titles');
    if (!earned || (earned.status && earned.status === 404)) {
        return undefined;
    }

    // combine
    _cache.update(
        region,
        realm,
        character,
        parseTitlesObject(db, profile, earned.titles)
    )
    return _cache.cache;
}

function parseTitlesObject(db, profile, earned) {
    var obj = { 'categories': [] };
    var collected = {};
    var totalCollected = 0;
    var totalPossible = 0;

    // Build up lookup for titles that character has
    earned.forEach((title) => {
        collected[title.id] = title;
    });

    // Lets parse out all the categories and build out our structure
    db.forEach((category) => {

        // Add the title category to the title list
        var cat = { 'name': category.name, 'subCategories': [] };
        obj.categories.push(cat);

        category.subcats.forEach((subCategory) => {
            var subCat = { 'name': subCategory.name, 'items':[] };

            //Determine if each title has been collected and if it should be shown
            subCategory.items.forEach((item) => {

                if (collected[item.titleId]) {
                    var fullItem = collected[item.titleId];
                    item.collected =  true;
                }

                var hasthis = item.collected;
                var showthis = (hasthis || !item.notObtainable);

                if (item.side && item.side !== profile.factionMapped) {
                    showthis = false;
                }

                if (item.gender && item.gender !== profile.genderMapped) {
                    showthis = false;
                }

                if (showthis) {
                    subCat.items.push(item);
                    if (hasthis) {
                        totalCollected++;
                    }

                    totalPossible++;
                }
                });

            if (subCat.items.length > 0) {
                cat.subCategories.push(subCat);
            }
        })
    })

    // Add totals
    obj.collected = totalCollected;
    obj.possible = totalPossible;
    obj.lookup = collected;

    // Add stuff that planner needs
    obj.isAlliance = (profile.factionMapped === 'A');

    // Data object we expose externally
    return obj;
}