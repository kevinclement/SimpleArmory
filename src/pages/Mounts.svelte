<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getMounts } from '$api/mounts'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import { navigate } from '$util/url'
    import ProgressBar from '$components/ProgressBar.svelte';
    import MountsPlanner from '$components/MountsPlanner.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';
    import Category from '$components/Category/Category.svelte';

    export let planner

    let promise
    let mounts
    $: {
        promise = getMounts($region, $realm, $character).then(_ => {           
            init(_);
        })
    }

    function init(_) {
        if (!_) return;
        mounts = _;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Mounts');
    });

    function togglePlanner(e) {
       
        // this means we're turning it off
        if (planner) {
            navigate("collectable/mounts/", $region, $realm, $character)
        }
        else {
            navigate("collectable/mounts/planner", $region, $realm, $character)
        }        
    }
</script>

<svelte:head>
	<title>{getTitle($character, 'Mounts')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Mounts
        <small class="pbSmall">
            <input type="checkbox" id="planner" bind:checked={planner} on:click={togglePlanner}><label for="planner">Show Planner</label>
        </small>
        <ProgressBar 
            rightSide={true}
            width={mounts ? percent(mounts.collected, mounts.possible) : 0} 
            percentage={mounts ? percentFormat(mounts.collected, mounts.possible) : ""}/>
    </h2>
</div>

{#await promise}
<Loading/>
{:then value}
{#if mounts}
    {#if planner}
    <MountsPlanner mounts={mounts} isAlliance={mounts.isAlliance}></MountsPlanner>
    {/if}
    
    <!-- I do this as a display none, instead of in the else 
         condition since it is faster to toggle it -->
    <div style="display: {planner ? 'none' : 'block' }">
    {#each mounts.categories as category}
        <Category {category}  superCat="Mounts"></Category>
    {/each}
    </div>
{:else}
<ErrorInline page="mounts"/>
{/if}   
{/await}
</div>