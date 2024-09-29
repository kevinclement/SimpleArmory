<script>
    import settings from '$util/settings'
    export let faction;

    let levelColors = [
        '#c22',
        'red',
        '#e62',
        '#d29d01',
        '#55b101',
        '#55b101',
        '#55b101',
        '#0ec077',
    ]

    function getColor(level) {
        return levelColors[
            Math.max(
                0,
                faction.renown ?
                    Math.floor((level / (faction.levels.length-1)) * (levelColors.length - 1)) :
                    levelColors.length - (faction.levels.length - level)
            )
        ];
    }

    function getBorderColor(level) {
        return level <= faction.level ? getColor(faction.level) : "lightgray";
    }

    function calculateLevelRatio(levelIdx) {
        if(faction.renown) {
            if(faction.level == faction.levels.length-1) {
                return 1;
            }
        }
        
        if (levelIdx === faction.level) {
            return faction.perc / 100.;
        }
        else if (levelIdx < faction.level) {
            return 1;
        }
        else {
            return 0;
        }
    }

    function tierProgressString(levelIdx) {
        if (levelIdx == faction.levels.length -1) {
            return ""
        } else {
            var levelMax = (
                faction.levels[levelIdx + 1][0] - faction.levels[levelIdx][0]
            );
            var levelCur;
            if (levelIdx === faction.level) {
                levelCur = faction.value;
            }
            else if (levelIdx < faction.level) {
                levelCur = levelMax;
            }
            else {
                levelCur = 0;
            }
            return ": " + levelCur + " / " + levelMax;
        }
    }

    function getLevelWidth(levelIdx) {
        var startThreshold = faction.levels[levelIdx][0];
        if (levelIdx < faction.levels.length - 1) {
            var endThreshold = faction.levels[levelIdx + 1][0];
            var maxThreshold = faction.levels[faction.levels.length - 1][0];
            var baseRatio = (endThreshold - startThreshold) / maxThreshold;
            return Math.max(
                baseRatio * 400.0 - 1,
                0
            );
        } else {
            return 10;
        }
    }
</script>

<div>
    <h4 class="factionLabel">
        <a target="{settings.anchorTarget}" href="//{settings.WowHeadUrl}/faction={faction.id}">{ faction.name }</a>
    </h4>
    {#each faction.levels as level, levelIdx}
        <div title="{level[1] + tierProgressString(levelIdx)}" class="repProgressBlock" style="width: {getLevelWidth(levelIdx)}px; border: 1px solid {getBorderColor(levelIdx)};">
            <div style="background-color: {getColor(faction.level)}; height: 100%; width: {calculateLevelRatio(levelIdx) * 100}%"></div>
        </div>
    {/each}
    <span>
        <b style="color: {getColor(faction.level)}">{faction.levels[faction.level][1]}</b>
        {#if faction.max !== 0 && !(faction.renown && faction.level == faction.levels.length-1)}<span style="color: grey">• {faction.value} / {faction.max}</span>{/if}
    </span>
</div>
