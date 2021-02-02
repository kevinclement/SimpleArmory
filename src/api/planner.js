import { getJsonDb } from '$api/_db'
import Cache from '$api/_cache'

let _cache;
export async function getPlannerSteps(mountsPromise, region, realm, character) {
    if (!_cache) {
        _cache = new Cache(region, realm, character);
    }
    else if (_cache.isValid(region, realm, character)) {
        return _cache.cache;
    }

    let items = await mountsPromise;

    console.log('Getting Planner Steps...');
    const all_steps = await getJsonDb('planner');
    
    _cache.update(
        region,
        realm,
        character,
        parseStepsObject(all_steps.steps, items)
    )
    return _cache.cache;
}

// gotta love recursion
function parseStepsObject(steps, items) {
    var neededSteps = [];
    steps.forEach((step) => {
        if (step.steps) {
            var neededChildSteps = parseStepsObject(step.steps, items);

            // if we have child steps and we found ones that were needed, then we can
            // go ahead and add ourself as a step and our children too
            if (neededChildSteps.length > 0) {
                neededSteps.push(step);
                neededSteps = neededSteps.concat(neededChildSteps);
                if (step.finalStep) {
                    neededSteps.push({'title':step.finalStep, 'hearth':true});
                }
            }
        }
        else if (!checkStepCompleted(step, items)) {
            neededSteps.push(step);
        }
    });

    return neededSteps;
}

function checkStepCompleted(step, items) {
    var completed = true;
    var showAll = false; // used for debugging
    var neededBosses = [];

    // check to see if we've finished all the bosses
    if (step.bosses) {
        step.bosses.forEach((boss) => {

            var bossIsNeutral = !boss.isAlliance && !boss.isHorde;
            var character = items; // aliasing for clarity
            var characterNeedsBoss = function(id){ return !character.lookup[id]; };
            var addBoss = function(boss) {
                    neededBosses.push(boss);
                    completed = false;
                };

            if (showAll) { addBoss(boss); return; }
            if (boss.ID === undefined) { return; } // continue the loop, bad boss data
            if (!characterNeedsBoss(boss.ID)) { return; }

            if ( bossIsNeutral || (boss.isAlliance && character.isAlliance) || (boss.isHorde && character.isHorde)) {
                addBoss(boss);
                return;
            }
        });
    }

    // reset bosses array to the ones we need
    step.bosses = neededBosses;

    return completed;
}