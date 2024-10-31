import { getData } from '$api/_blizzard'
import { getProfile } from '$api/profile'
import { getJsonDb } from '$api/_db'
import settings from '$util/settings'
import Cache from '$api/_cache'
import { getShowHiddenSetting, getShowHiddenFeatSetting } from '../util/utils'

let _cache;
export async function getAchievements(region, realm, character) {
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
    const db = await getJsonDb('achievements');
    
    // get character earned  
    const earned = await getData(region, realm, character, 'achievements');
    
    // combine and cache
    _cache.update(
        region,
        realm,
        character,
        parseAchievementObject(db, earned, character, profile.factionMapped)
    )
    return _cache.cache
}

function parseAchievementObject(db, earned, character, faction) {
    console.log(`Parsing achievements.json...`)
    var showHiddenItems = getShowHiddenSetting();
    var showHiddenFeats = getShowHiddenFeatSetting();

    let obj            = {}
     ,  completed      = {}
     ,  critCompleted  = {}
     ,  critsOfAchiev  = {}
     ,  totalPossible  = 0
     ,  totalCompleted = 0
     ,  totalFoS       = 0
     ,  totalLegacy    = 0
     ,  found          = {};

    // Build up lookup for achievements that character has completed
    earned.achievements.forEach((ach, index) => {
        
        if (ach.completed_timestamp) {
            // hash the achievement and its timestamp
            completed[ach.id] = ach.completed_timestamp;
        }

        // Build up lookup for criteria that character has completed
        if (ach.criteria) {
            if (ach.criteria.is_completed) {
                critCompleted[ach.criteria.id] = true;
            }

            // Recursively mark child criteria as potentially completed
            critsOfAchiev[ach.id] = [];
            let stack = [ach.criteria];
            while (stack.length > 0) {
                let crit = stack.pop();
                if (crit.is_completed) {
                    critCompleted[crit.id] = true;
                    critsOfAchiev[ach.id].push(crit.id);
                }
                if (crit.child_criteria) {
                    crit.child_criteria.forEach((child_crit, index) => {
                        stack.push(child_crit);
                    });
                }
            }
        }
    });

    // Lets parse out all the super categories and build out our structure
    db.supercats.forEach((supercat) => {
        let possibleCount  = 0
         ,  completedCount = 0;
    
        // Add the supercategory to the object, so we can do quick lookups on category
        obj[supercat.name] = {};
        obj[supercat.name].categories = [];

        supercat.cats.forEach((cat) => {
            let myCat = {'name': cat.name, 'subcats': []};

            cat.subcats.forEach((subcat) => {
                let mySubCat = {'name': subcat.name, 'achievements': []};

                subcat.items.forEach((ach) => {
                    // Mark this achievement in our found tracker
                    found[ach.id] = true;

                    let myAchievement = ach
                      , added         = false;

                    // Store the date we completed it
                    myAchievement.completed = completed[ach.id];

                    // if we're forcing all completed then set those up
                    if (!myAchievement.completed && settings.debug) {
                        myAchievement.completed = settings.fakeCompletionTime;    
                    }

                    // Hack: until blizz fixes api, don't stamp with date
                    if (myAchievement.completed && myAchievement.completed !== settings.fakeCompletionTime) {
                        myAchievement.rel = 'who=' + character + '&when=' + myAchievement.completed;
                    }

                    // Always add it if we've completed it, it should show up regardless if its available
                    if (myAchievement.completed) {
                        added = true;
                        mySubCat.achievements.push(myAchievement);    

                        // if this is feats of strength then I want to keep a seperate count for that 
                        // since its not a percentage thing
                        if (supercat.name === 'Feats of Strength') {
                            totalFoS++;
                        } else if (supercat.name === 'Legacy') {
                            totalLegacy++;
                        }
                    }
                    else if (critsOfAchiev[ach.id]) {
                        // build up rel based on completed criteria for the achievement 
                        // and pass that along to wowhead
                        //cri=40635:40636:40637:40638:40640:40641:40642:40643:40644:40645
                        var criCom = [];
                        critsOfAchiev[ach.id].forEach((blizzCrit) => {
                            if (critCompleted[blizzCrit]) {
                                criCom.push(blizzCrit);
                            }
                        })
                        
                        if (criCom.length > 0) {
                            myAchievement.rel = 'cri=' + criCom.join(':');
                        }
                    }

                    // Update counts proper
                    if ((supercat.name !== 'Feats of Strength' || showHiddenFeats == "shown") && supercat.name !== 'Legacy' && !ach.notReleased && ((showHiddenItems == "shown" && ach.notObtainable) || !ach.notObtainable) && 
                        (!ach.side || ach.side === faction)){

                        if (supercat.name !== 'Feats of Strength') {
                            possibleCount++;
                            totalPossible++;
                            if(myAchievement.completed) {
                                completedCount++;
                                totalCompleted++;
                            }
                        }

                        // if we haven't already added it, then this is one that should show up in the page of achievements
                        // so add it
                        if (!added) {
                            mySubCat.achievements.push(myAchievement);
                        }
                    }
                })

                if (mySubCat.achievements.length > 0) {
                    myCat.subcats.push(mySubCat);
                }
            })

            // Add the category to the obj
            obj[supercat.name].categories.push(myCat);
        })

        obj[supercat.name].possible = possibleCount;
        obj[supercat.name].completed = completedCount;

        // Add the FoS count if this is the FoS
        if (supercat.name === 'Feats of Strength') {
            obj[supercat.name].foSTotal = totalFoS;
        } else if (supercat.name === 'Legacy') {
            obj[supercat.name].legacyTotal = totalLegacy;
        }
    })

    for (var achId in found) {
        if (found.hasOwnProperty(achId) && !found[achId]) {
            window.ga('send', 'event', 'MissingAchievement', achId);
            console.log('WARN: Found achievement "' + achId + '" from character but not in db.');
        }
    }

    // Add totals
    obj.possible = totalPossible;
    obj.completed = totalCompleted;

    // Data object we expose externally
    return obj;
}
