<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getCompanions } from '$api/companions'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';
    import Category from '$components/Category/Category.svelte';

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
	<title>{getTitle($character, 'Companions')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Companions
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
    <Category {category} getItemPath={item => `battle-pet/${ item.ID }`}></Category>
{/each}
{:else}
<ErrorInline page="companions"/>
{/if}

{/await}

</div>