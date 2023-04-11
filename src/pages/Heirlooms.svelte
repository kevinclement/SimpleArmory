<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getHeirlooms } from '$api/heirlooms'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';

    let heirlooms
    $: promise = getHeirlooms($region, $realm, $character).then(_ => {
        init(_);
    })

    function init(_) {
        if (!_) return;
        heirlooms = _;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Heirlooms');
    });
</script>

<svelte:head>
	<title>{getTitle($character, 'Heirlooms')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Heirlooms
        <ProgressBar 
                rightSide={true}
                width={heirlooms ? percent(heirlooms.collected, heirlooms.possible) : 0} 
                percentage={heirlooms ? percentFormat(heirlooms.collected, heirlooms.possible) : ""}/>
    </h2>
</div>

{#await promise}
    <Loading/>
{:then value}
  <div>
    {#if heirlooms}
    {#each heirlooms.categories as category}
        {#if category.name !== 'Heirlooms'}
            <h3 class="categoryHeader">{ category.name }</h3>
        {/if}
        {#each category.subCategories as subCategory}
            <div class="sect">
                <div class="subCatHeader">{ subCategory.name }</div>
                {#each subCategory.items as item}
                    <a 
                      target="{settings.anchorTarget}" 
                      href="//{settings.WowHeadUrl}/{ item.link }" 
                      class="thumbnail"
                      class:borderOn={!item.collected}
                      class:borderOff={item.collected}>
                        <img height="36" width="36" src="{getImageSrc(item)}" alt>
                    </a>
                {/each}
            </div>
        {/each}
        <div class="clear"/>
    {/each}
    {/if}
  </div>
{/await}

</div>

<style>
.tupd {
  margin-left: 3px;
  font-size:18px;
}
</style>
