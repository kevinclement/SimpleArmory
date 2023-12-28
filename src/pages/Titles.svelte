<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getTitles } from '$api/titles'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';
    import Category from '$components/Category/Category.svelte';

    let promise
    let titles
    $: {
        promise = getTitles($region, $realm, $character).then(_ => {           
            init(_);
        })
    }

    function init(_) {
        if (!_) return;
        titles = _;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Titles');
    });

</script>

<svelte:head>
	<title>{getTitle($character, 'Titles')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Titles
        <ProgressBar 
            rightSide={true}
            width={titles ? percent(titles.collected, titles.possible) : 0} 
            percentage={titles ? percentFormat(titles.collected, titles.possible) : ""}/>
    </h2>
</div>

{#await promise}
<Loading/>
{:then value}
{#if titles}

    <div>
    {#each titles.categories as category}
     <Category {category} getItemPath={item => `${item.type}=${item.id}`} superCat="Titles"></Category>
    {/each}
    </div>
{:else}
<ErrorInline page="titles"/>
{/if}   
{/await}
</div>
