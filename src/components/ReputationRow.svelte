<script>
    import settings from '$util/settings'

    export let faction;
    export let inTodo = false;
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

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

<div class="rep-row-outer">
    <div class="rep-row-btn-col">
        {#if !inTodo && (faction.level !== faction.levels.length-1)}
            <button class="btn btn-xs btn-success rep-todo-btn" title="Add to Todo List" on:click={() => dispatch('addTodo')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="8" fill="#28a745"/>
                  <path d="M8 4v8M4 8h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        {/if}
        {#if inTodo}
            <button class="btn btn-xs btn-danger rep-todo-btn" title="Remove from Todo List" on:click={() => dispatch('removeTodo')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="8" fill="#dc3545"/>
                  <path d="M5 5l6 6M11 5l-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        {/if}
    </div>
    <div class="rep-row-main-col">
        <div class="rep-row-main-horizontal">
            <div class="rep-row-main-info">
                <h4 class="factionLabel">
                    <a target="{settings.anchorTarget}" href="//{settings.WowHeadUrl}/faction={faction.id}">{ faction.name }</a>
                </h4>
            </div>
            <div class="rep-row-main-bars">
                {#each faction.levels as level, levelIdx}
                    <div title="{level[1] + tierProgressString(levelIdx)}" class="repProgressBlock" style="width: {getLevelWidth(levelIdx)}px; border: 1px solid {getBorderColor(levelIdx)};">
                        <div style="background-color: {getColor(faction.level)}; height: 100%; width: {calculateLevelRatio(levelIdx) * 100}%"></div>
                    </div>
                {/each}
            </div>
            <div class="rep-row-main-value">
                <span>
                    <b style="color: {getColor(faction.level)}">{faction.levels[faction.level][1]}</b>
                    {#if faction.max !== 0 && !(faction.renown && faction.level == faction.levels.length-1)}<span style="color: grey">• {faction.value} / {faction.max}</span>{/if}
                </span>
            </div>
        </div>
    </div>
</div>

