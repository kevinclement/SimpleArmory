<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getDecors } from '$api/decors'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';
    import Category from '$components/Category/Category.svelte';

    let promise
    let decors
    let showDecorItem
    $: {
        promise = getDecors($region, $realm, $character).then(_ => {           
            init(_);
        })
    }

    function init(_) {
        if (!_) return;
        decors = _;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Decors');
    });

</script>

<svelte:head>
	<title>{getTitle($character, 'Decors')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Decors <small class="pbSmall"><input type="checkbox" id="showDecorItem" bind:checked={showDecorItem}><label for="showDecorItem">Show Item Tooltips</label></small>
        <ProgressBar 
            rightSide={true}
            width={decors ? percent(decors.collected, decors.possible) : 0} 
            percentage={decors ? percentFormat(decors.collected, decors.possible) : ""}/>
    </h2>
</div>

{#await promise}
<Loading/>
{:then value}
{#if decors}

    <div>
    {#each decors.categories as category}
        {#if showDecorItem}
            <Category {category} superCat="Decors"></Category>
        {:else}
            <Category {category} getItemPath={item => `decor/${item.ID}`} superCat="Decors"></Category>
        {/if}
    {/each}
    </div>
{:else}
<ErrorInline page="decors"/>
{/if}   
{/await}
</div>
