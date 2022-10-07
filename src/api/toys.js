import { getData } from '$api/_blizzard'
import { getJsonDb } from '$api/_db'
import { getProfile } from '$api/profile'
import Cache from '$api/_cache'

let _cache;
export async function getToys(region, realm, character, skipCache) {
    if (!_cache) {
        _cache = new Cache(region, realm, character);
    }
    else if (_cache.isValid(region, realm, character && !skipCache)) {
        return _cache.cache;
    }
   
    const profile = await getProfile(region, realm, character);
    if (!profile || (profile.status && profile.status === 404)) {
        return undefined;
    }

    console.log('Getting toys...');
    const all_toys = await getJsonDb('toys');
    const my_toys = fetchToysFromLocalStorage();
    
    _cache.update(
        region,
        realm,
        character,
        parseToys(all_toys, my_toys, profile)
    )
    return _cache.cache;
}

function fetchToysFromLocalStorage() {
    let toys = JSON.parse(localStorage.getItem('toys'));
    let collected = {}

    toys && toys.forEach((item) => {
        collected[item] = true;
    });

    return collected
}

function parseToys(all_toys, my_toys, profile) {
    var obj = { 'categories': [] };
    var totalCollected = 0;
    var totalPossible = 0;

    all_toys.forEach((category) => {

        // Add the item category to the item list
        var cat = { 'name': category.name, 'subCategories': [] };
        obj.categories.push(cat);

        category.subcats.forEach((subCategory) => {

            var subCat = { 'name': subCategory.name, 'items':[] };

            subCategory.items.forEach((item) => {

                var itm = item;

                if (my_toys[itm.itemId]) {
                    itm.collected =  true;
                }

                itm.link = 'item='+item.itemId;

                // What would cause it to show up in the UI:
                //    1) You have the item
                //    2) Its still obtainable 
                //    3) You meet the class restriction
                //    4) You meet the race restriction
                var hasthis = itm.collected;
                var showthis = (hasthis || !item.notObtainable);

                if (item.side && item.side !== profile.factionMapped) {
                    showthis = false;
                }

                if (item.allowableRaces && item.allowableRaces.length > 0)
                {
                    var foundRace = false;
                    item.allowableRaces.forEach((race) => {
                        if (race === profile.race) {
                            foundRace = true;
                        }
                    });

                    if (!foundRace) {
                        showthis = false;
                    }
                }

                if (item.allowableClasses && item.allowableClasses.length > 0)
                {
                    var foundClass = false;
                    item.allowableClasses.forEach((allowedClass) => {
                        if (allowedClass === profile.classMapped) {
                            foundClass = true;
                        }
                    });

                    if (!foundClass) {
                        showthis = false;
                    }
                }

                if (showthis) {
                    subCat.items.push(itm);
                    if (hasthis) {
                        totalCollected++;
                    }

                    totalPossible++;
                }
            });

            if (subCat.items.length > 0) {
                cat.subCategories.push(subCat);
            }
        });
    }); 

    // Add totals
    obj.collected = totalCollected;
    obj.possible = totalPossible;
    obj.lookup = my_toys;

    // Data object we expose externally
    return obj;
}
