<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getBattlePets } from '$api/battlePets'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';
    import Category from '$components/Category/Category.svelte';

    let showLevel = $state()
    let battlePets = $state()

    onMount(async () => {
        window.ga('send', 'pageview', 'BattlePets');
    });

    function init(_) {
        if (!_) return;
        battlePets = _;
    }

    function qualityToBackground(item) {
        var bgColor = 'transparent';

        switch(item.quality) {
            case 'poor':
                bgColor = '#7F7F7F';
                break;
            case 'common':
                bgColor = '#F0F0F0';
                break;
            case 'uncommon':
                bgColor = '#22B14C';
                break;
            case 'rare':
                bgColor = '#3F48CC';
                break;
        }

        return 'background:' + bgColor;
    };
    let promise = $derived(getBattlePets($region, $realm, $character).then(_ => {
        init(_);
    }))
</script>

<svelte:head>
	<title>{getTitle($character, 'Battle Pets')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Battle Pets <small class="pbSmall"><input type="checkbox" id="showlevels" bind:checked={showLevel}><label for="showlevels">Show levels and breeds</label></small>
        <ProgressBar
            rightSide={true}
            width={battlePets ? percent(battlePets.collected, battlePets.possible) : 0} 
            percentage={battlePets ? percentFormat(battlePets.collected, battlePets.possible) : ""}/>
    </h2>
</div>

{#await promise}
<Loading/>
{:then value}

{#if battlePets}
{#each battlePets.categories as category}
    <Category {category}>
        {#snippet item({ item })}
                                        <div class="pbCell"  >
                <a 
                class="thumbnail pbThumbnail" 
                target="{settings.anchorTarget}"
                href="{item.ptr || item.new ? `//${settings.WowHeadUrl}/ptr-2/battle-pet/${ item.ID }` : `//${settings.WowHeadUrl}/battle-pet/${ item.ID }`}"
                class:notCollected={!item.collected}
                >
                    <img height="36" width="36" src="{ getImageSrc(item, true) }" alt>
                    {#if item.level}<div class="pbLevel" class:opacityOn={showLevel}>{ item.level }</div>{/if}
                    {#if item.breed}<div class="pbBreed" class:opacityOn={showLevel}>{ item.breed }</div>{/if}
                </a> 
                <div class="pbQual" style="{ qualityToBackground(item) }"></div>        		      	
            </div>
                                    {/snippet}
    </Category>
{/each}
{:else}
<ErrorInline page="pets"/>
{/if}

{/await}
</div>
