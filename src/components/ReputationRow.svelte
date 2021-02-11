<script>   
    import settings from '$util/settings'
    export let faction;

    let showHover = false;

    // Pixel widths of the different level types
    let levelWidths = {
        'hated': 150,
        'hostel': 25,
        'unfriendly': 25,
        'neutral': 25,
        'friendly': 40,
        'honored': 60,
        'revered': 85,
        'exalted': 10,
        'stranger': 50,
        'acquaintance': 50,
        'buddy': 50,
        'friend': 50,
        'goodFriends': 50,
        'bestFriends': 50
    };

    let levels = [
        'hated',
        'hostel',
        'unfriendly',
        'neutral',
        'friendly',
        'honored',
        'revered',
        'exalted',
    ]
    if (faction.isTiller) {
        levels = [
            'stranger',
            'acquaintance',
            'buddy',
            'friend',
            'goodFriends',
            'bestFriends',
        ]
    }

    function getWidth(level) {
        var num = faction[level] ? faction[level] : 0;

        // pulls out the faction level percentage from the scope
        // applies that percentage to the possible fixed width for the div
        return (num / 100) * levelWidths[level] + 'px';
    }

    function handleMouseEnter(event) {
		showHover = faction.max !== 0
    }
</script>

<div on:mouseenter={handleMouseEnter} on:mouseleave={e => showHover=false}>
    <h4 class="factionLabel">
        <a target="{settings.anchorTarget}" href="//{settings.WowHeadUrl}/faction={faction.id}">{ faction.name }</a>
    </h4>
    {#each levels as level, index}
        <div class="{level}" style="width: {getWidth(level)}">
            {#if index===0 && showHover}
                <span class="repValue">{faction.value} / {faction.max}</span>
            {/if}
        </div>
    {/each}
</div>