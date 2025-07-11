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
    
    globalIdx = 0;
    _cache.update(
        region,
        realm,
        character,
        parseStepsObject(all_steps.steps, items, null)
    )
    return _cache.cache;
}

// gotta love recursion
let globalIdx = 0;
function parseStepsObject(steps, items, parentIdx = null) {
    var neededSteps = [];
    steps.forEach((step) => {
        
        let stepCopy = { ...step };
        stepCopy.parentIdx = parentIdx;
        stepCopy.idx = globalIdx++;
        if (stepCopy.unavailable) return;
        if (stepCopy.steps) {
            var neededChildSteps = parseStepsObject(stepCopy.steps, items, stepCopy.idx);
            if (neededChildSteps.length > 0) {
                neededSteps.push(stepCopy);
                neededSteps = neededSteps.concat(neededChildSteps);
                if (stepCopy.finalStep) {
                    neededSteps.push({'title':stepCopy.finalStep, 'hearth':true, parentIdx: stepCopy.idx, idx: globalIdx++});
                }
            }
        }
        else if (!checkStepCompleted(stepCopy, items)) {
            neededSteps.push(stepCopy);
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
            var characterNeedsBoss = function(mountId){ 
                // The logic seems to be based on the character's collected mounts,
                // which are in `items.lookup`. We need to check if the mountId is in the lookup.
                return !character.lookup[mountId]; 
            };
            var addBoss = function(b) {
                    // Enrich the boss object with the full mount details
                    neededBosses.push(b);
                    completed = false;
                };

            if (showAll) { addBoss(boss); return; }
            if (boss.ID === undefined) { return; } // continue the loop, bad boss data
            if (!characterNeedsBoss(boss.ID)) { return; }

            if ( bossIsNeutral || (boss.isAlliance && character.isAlliance) || (boss.isHorde && !character.isAlliance)) {
                addBoss(boss);
                return;
            }
        });
    }

    // reset bosses array to the ones we need
    step.bosses = neededBosses;

    return completed;
}