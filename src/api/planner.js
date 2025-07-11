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

export function findIndexByIdx(stepsArr, idx) {
    return stepsArr.findIndex(s => s.idx === idx);
}

  // Get reset times based on region
export function getResetTimes(region) {
    if (region === 'us') {
        return {
        dailyHourUTC: 15,
        weeklyDay: 2,
        weeklyHourUTC: 15,
        };
    }
    return {
        dailyHourUTC: 4,
        weeklyDay: 3,
        weeklyHourUTC: 4,
    };
}

// Get the next daily and weekly reset times
export function getNextDailyReset(region) {
    const { dailyHourUTC } = getResetTimes(region);
    const now = new Date();
    const reset = new Date(now);
    reset.setUTCHours(dailyHourUTC, 0, 0, 0);
    if (now >= reset) {
        reset.setUTCDate(reset.getUTCDate() + 1);
    }
    return formatResetDateEn(reset);
}

export function getNextWeeklyReset(region) {
    const { weeklyDay, weeklyHourUTC } = getResetTimes(region);
    const now = new Date();
    const reset = new Date(now);
    const currentDay = now.getUTCDay();
    const daysUntilReset = (weeklyDay - currentDay + 7) % 7 || 7;
    reset.setUTCDate(reset.getUTCDate() + daysUntilReset);
    reset.setUTCHours(weeklyHourUTC, 0, 0, 0);
    return formatResetDateEn(reset);
}

function formatResetDateEn(date) {
    const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return date.toLocaleString('en-US', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: userTZ,
    });
}