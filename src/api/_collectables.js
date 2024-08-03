import { getShowHiddenSetting } from "../util/utils"

function getHigherQualityBattlePet(currentPet, newPet) {
    function getPetsQuality(type) {
        switch (type) {
            case "RARE": return 5
            case "UNCOMMON": return 4
            case "COMMON": return 3
            case "POOR": return 2
            default: return 1
        }
    }

    if (currentPet != undefined &&
            getPetsQuality(currentPet.quality.type)
            >= getPetsQuality(newPet.quality.type)) {
        return currentPet
    }
    return newPet
}

export async function parseCollectablesObject(categories, profile, collected_data, collectedProperty, collectedId, isPet) {
    var obj = { 'categories': [] };
    var collected = {};
    var totalCollected = 0;
    var totalPossible = 0;

    var showHiddenItems = getShowHiddenSetting();

    // Build up lookup for items that character has
    collected_data[collectedProperty].forEach((item) => {
        if (isPet) {
            collected[item[collectedId].id] = getHigherQualityBattlePet(
                collected[item[collectedId].id], item
            );
        } else {
            collected[item[collectedId].id] = item;
        }
    });

    // Lets parse out all the categories and build out our structure
    categories.forEach((category) => {

        // Add the item category to the item list
        var cat = { 'name': category.name, 'subCategories': [] };
        obj.categories.push(cat);

        category.subcats.forEach((subCategory) => {
            var subCat = { 'name': subCategory.name, 'items':[] };

            subCategory.items.forEach((item) => {
                var itm = item;

                // fix spellid typo
                itm.spellId = item.spellid;
                delete itm.spellid;

                if (collected[itm.ID]) {
                    var fullItem = collected[itm.ID];
                    itm.collected =  true;

                    // only add quality info if on battlepets or companions site
                    if (isPet && fullItem.quality) {
                        itm.quality = fullItem.quality.type.toLowerCase();
                    }

                    if (fullItem.stats) {
                        if (fullItem.stats.breed_id) {
                            var breed = '';
                            switch(fullItem.stats.breed_id)
                            {
                                case 4:
                                case 14:
                                    breed = 'P/P';
                                    break;
                                case 5:
                                case 15:
                                    breed = 'S/S';
                                    break;
                                case 6:
                                case 16:
                                    breed = 'H/H';
                                    break;
                                case 7:
                                case 17:
                                    breed = 'H/P';
                                    break;
                                case 8:
                                case 18:
                                    breed = 'P/S';
                                    break;
                                case 9:
                                case 19:
                                    breed = 'H/S';
                                    break;
                                case 10:
                                case 20:
                                    breed = 'P/B';
                                    break;
                                case 11:
                                case 21:
                                    breed = 'S/B';
                                    break;
                                case 12:
                                case 22:
                                    breed = 'H/B';
                                    break;
                                case 3:
                                case 13:
                                    breed = 'B/B';
                                    break;
                            }

                            itm.breed = breed;
                        }

                        itm.level = fullItem.level;
                    }
                }

                // Need to some extra work to determine what our url should be
                // By default we'll use a spell id
                var link = 'spell='+itm.spellId;

                // If the item id is available lets use that
                if (item.itemId) {
                    link = 'item='+item.itemId;
                } else if (item.allianceId && (profile.factionMapped === 'A')) {
                    link = 'item='+item.allianceId;
                } else if (item.hordeId && (profile.factionMapped === 'H')) {
                    link = 'item='+item.hordeId;
                } else if (item.creatureId) {
                    link = 'npc='+item.creatureId;
                }

                itm.link = link;

                // What would cause it to show up in the UI:
                //    1) You have the item
                //    2) Its still obtainable 
                //    3) You meet the class restriction
                //    4) You meet the race restriction
                var hasthis = itm.collected;
                var showthis = (hasthis || !item.notObtainable || (showHiddenItems == "shown" && !item.notReleased));

                if (item.side && item.side !== profile.factionMapped) {
                    showthis = false;
                }

                if (item.allowableRaces && item.allowableRaces.length > 0)
                {
                    var foundRace = false;
                    item.allowableRaces.forEach((race) => {
                        if (race === profile.raceMapped) {
                            foundRace = true;
                        }
                    })

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
                    })

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
