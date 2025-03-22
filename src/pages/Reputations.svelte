<script>
    import { region, realm, character } from '$stores/user'
    import { getReputations } from '$api/reputations'
    import { getTitle } from '$util/utils'
    import ReputationRow from '$components/ReputationRow.svelte'
    import Loading from '$components/Loading.svelte';

    // State variables
    let categories = $state([]);
    let promise = $state(null);

    // Initialize the promise
    $effect(() => {
        promise = getReputations(region, realm, character)
            .then(result => {
                categories = result.categories;
                return result;
            });
    });

    // Replace onMount with $effect.pre
    $effect.pre(() => {
        window.ga('send', 'pageview', 'Reputation');
    });
</script>

<svelte:head>
    <title>{getTitle(character, 'Reputation')}</title>
</svelte:head>

<div class="container rep">
    <div class="page-header">
      <h2>Reputation</h2>
    </div>

{#await promise}
    <Loading/>
{:then value}
    {#each categories as category}
        <h3>{ category.name }</h3>
        <ul>
            {#each category.factions as faction}
                <li>
                    <ReputationRow faction={faction}/>
                </li>
            {/each}
        </ul>
    {/each}
{/await}

</div>
