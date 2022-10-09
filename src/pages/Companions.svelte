<script>
    import { onMount } from 'svelte'
    import { t, locale } from 'svelte-i18n'
    import { region, realm, character } from '$stores/user'
    import { getCompanions } from '$api/companions'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import { getWowHeadUrl } from '$util/url'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';

    const wowheadBaseUrl = getWowHeadUrl($locale)

    let companions
    $: promise = getCompanions($region, $realm, $character).then(_ => {
        init(_)
    })

    function init(_) {
        if (!_) return;
        companions = _;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Companions');
    });
</script>

<svelte:head>
	<title>{getTitle($character, $t('companions'))}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        {$t('companions')}
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
  <h3 class="categoryHeader">{ $t(category.name) }</h3>

  {#each category.subCategories as subCategory}
    <div class="sect">
        <div class="subCatHeader">{ $t(subCategory.name) }</div>
        {#each subCategory.items as item}
            <div class="pbCell">
                <a 
                  class="thumbnail pbThumbnail" 
                  target="{settings.anchorTarget}"
                  href="//{wowheadBaseUrl}/battle-pet/{ item.ID }"
                  class:borderOn={!item.collected}
                  class:borderOff={item.collected}>
	        	    <img height="36" width="36" src="{getImageSrc(item)}" alt>
	      	    </a>
            </div>
        {/each}
    </div>
  {/each}
  <div class="clear"/> 
{/each}
{:else}
<ErrorInline page="companions"/>
{/if}

{/await}

</div>