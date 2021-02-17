<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getBattlePets } from '$api/battlePets'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';

    let showLevel
    let battlePets
    $: promise = getBattlePets($region, $realm, $character).then(_ => {
        init(_);
    })
   
    onMount(async () => {
        window.ga('send', 'pageview', 'BattlePets');
    });

    function init(_) {
        if (!_) return;
        battlePets = _;
    }

    function qualityToBackground(item) {
        var bgColor = '#fff';

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
  <h3 class="categoryHeader">{ category.name }</h3>

  {#each category.subCategories as subCategory}
    <div class="sect">
        <div class="subCatHeader">{ subCategory.name }</div>
        {#each subCategory.items as item}
            <div class="pbCell">
                <a 
                  class="thumbnail pbThumbnail" 
                  target="{settings.anchorTarget}"
                  href="//{settings.WowHeadUrl}/{ item.link }"
                  class:borderOn={!item.collected}
                  class:borderOff={item.collected}>
	        	    <img height="36" width="36" src="{getImageSrc(item)}" alt>
	        	    <div class="pbLevel" class:opacityOn={showLevel}>{ item.level }</div>
	        	    <div class="pbBreed" class:opacityOn={showLevel}>{ item.breed }</div>
	      	    </a> 
	   		    <div class="pbQual" style="{ qualityToBackground(item) }"></div>        		      	
            </div>
        {/each}
    </div>
  {/each}
  <div class="clear"/> 
{/each}
{:else}
<ErrorInline page="pets"/>
{/if}

{/await}
</div>
