<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getCompanions } from '$api/companions'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';
    import Category from '$components/Category/Category.svelte';

    let companions = $state()
    let showQuality = $state()

    function init(_) {
        if (!_) return;
        companions = _;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Companions');
    });

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
    let promise = $derived(getCompanions($region, $realm, $character).then(_ => {
        init(_)
    }))
</script>

<svelte:head>
	<title>{getTitle($character, 'Companions')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Companions <small class="pbSmall"><input type="checkbox" id="showquality" bind:checked={showQuality}><label for="showquality">Show quality</label></small>
        <ProgressBar 
            rightSide={true}
            width={companions ? percent(companions.collected, companions.possible) : 0} 
            percentage={companions ? percentFormat(companions.collected, companions.possible) : ""}/>
    </h2>
</div>

{#await promise}
  <Loading/>
{:then value}

{#if companions}
    {#each companions.categories as category}
        <Category {category}>
        {#snippet item({ item })}
                    <div class="pbCell"  >
              <a 
              class="thumbnail pbThumbnail" 
              target="{settings.anchorTarget}"
              href="{item.ptr || item.new ? `//${settings.WowHeadUrl}/ptr/battle-pet/${ item.ID }` : `//${settings.WowHeadUrl}/battle-pet/${ item.ID }`}"
              class:notCollected={!item.collected}
              >
                  <img height="36" width="36" src="{ getImageSrc(item, true) }" alt>
              </a> 
              {#if showQuality}<div class="pbQual" style="{ qualityToBackground(item) }"></div> {/if}
          </div>
                  {/snippet}
    </Category>
    {/each}
    {:else}
    <ErrorInline page="companions"/>
{/if}

{/await}

</div>