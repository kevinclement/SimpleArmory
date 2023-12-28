<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getHeirlooms } from '$api/heirlooms'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import Category from '$components/Category/Category.svelte';

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
        <Category {category} superCat="Heirlooms"></Category>
    {/each}
    {/if}
  </div>
{/await}

</div>
