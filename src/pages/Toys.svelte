<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getToys } from '$api/toys'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import Category from '$components/Category/Category.svelte';

    let toys
    $: promise = getToys($region, $realm, $character).then(_ => {
        init(_);
    })

    function init(_) {
        if (!_) return;
        toys = _;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Toys');
    });
</script>

<svelte:head>
	<title>{getTitle($character, 'Toys')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Toys
        <ProgressBar 
                rightSide={true}
                width={toys ? percent(toys.collected, toys.possible) : 0} 
                percentage={toys ? percentFormat(toys.collected, toys.possible) : ""}/>
    </h2>
</div>

{#await promise}
    <Loading/>
{:then value}
  <div>
    {#if toys}
    {#each toys.categories as category}
        <Category {category} superCat="Toys"></Category>
    {/each}
    {/if}
  </div>
{/await}

</div>
