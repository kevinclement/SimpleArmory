import { getData } from '$api/_blizzard'
import { getProfile } from '$api/profile'
import { getJsonDb } from '$api/_db'
import Cache from '$api/_cache'
import { getShowHiddenSetting } from '../util/utils'

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

    var showHiddenItems = getShowHiddenSetting();

    // Build up lookup for titles that character has
    earned.forEach((title) => {
        collected[title.id] = title;
    });

    // Lets parse out all the categories and build out our structure
    db.forEach((category) => {

        // Add the title category to the title list
        var cat = {
            'name': category.name,
            'subCategories': [],
            'notObtainable': (category.notObtainable !== undefined && category.notObtainable),
        };

        obj.categories.push(cat);

        category.subcats.forEach((subCategory) => {
            var subCat = { 'name': subCategory.name, 'items':[] };

            //Determine if each title has been collected and if it should be shown
            subCategory.items.forEach((item) => {

                if (collected[item.titleId]) {
                    item.collected =  true;
                }

                var hasthis = item.collected;
                var showthis = (hasthis || !item.notObtainable || (showHiddenItems == "shown" && !item.notReleased));

                if (item.side && item.side !== profile.factionMapped) {
                    showthis = false;
                }

                if (item.gender && item.gender !== profile.genderMapped) {
                    showthis = false;
                }

                // Instead of having two titles, some titles have two name
                // variants. If the profile gender is F and the name of the
                // title has a feminine variant, we change the displayed title
                // name to the nameF variant.
                if (profile.genderMapped == 'F' && item.nameF !== undefined) {
                    item.name = item.nameF;
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

    // Completely remove categories that meet both conditions:
    // - The category only contains non-obtainable items
    // - None of the items are obtained
    obj.categories = obj.categories.filter(cat => cat.notObtainable == false || cat.subCategories.length > 0)

    // Add totals
    obj.collected = totalCollected;
    obj.possible = totalPossible;
    obj.lookup = collected;

    // Add stuff that planner needs
    obj.isAlliance = (profile.factionMapped === 'A');

    // Data object we expose externally
    return obj;
}
