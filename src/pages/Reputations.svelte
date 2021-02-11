<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getReputations } from '$api/reputations'
    import { getTitle } from '$util/utils'
    import ReputationRow from '$components/ReputationRow.svelte'
    import Loading from '$components/Loading.svelte';

    let categories;
    $: promise = getReputations($region, $realm, $character).then(_ => {
        categories = _.categories;
    })
    // $: if (categories) { console.dir(categories) }

    onMount(async () => {
        window.ga('send', 'pageview', 'Reputation');
    });

</script>

<svelte:head>
	<title>{getTitle($character, 'Reputation')}</title>
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
            
            {#if !category.isTiller}
                <li>
                    <table>
                        <tr>
                            <td class="factionTd"></td>
                            <td class="hatedTd repLabel">Hated</td>
                            <td class="hostelTd repLabel">Hos</td>
                            <td class="unfriendlyTd repLabel">Unf</td>
                            <td class="neutralTd repLabel">Neu</td>
                            <td class="friendlyTd repLabel">Friend</td>
                            <td class="honoredTd repLabel">Honored</td>
                            <td class="reveredTd repLabel">Revered</td>
                            <td class="exaltedTd repLabel">Ex</td>
                        </tr>
                    </table>
                </li>
            {:else}
                <li>
                    <table>
                        <tr>
                            <td class="factionTd"></td>
                            <td class="strangerTd repLabel">Stranger</td>
                            <td class="acquaintanceTd repLabel">Acq</td>
                            <td class="buddyTd repLabel">Buddy</td>
                            <td class="friendTd repLabel">Friend</td>
                            <td class="goodFriendsTd repLabel">Good</td>
                            <td class="bestFriendsTd repLabel">Best</td>
                        </tr>
                    </table>
                </li>
            {/if}
    
        </ul>
    {/each}

{/await}

</div>

<style>
.factionTd,.hatedTd,.hostelTd,.unfriendlyTd,
.neutralTd,.friendlyTd,.honoredTd, .reveredTd,.exaltedTd,
.strangerTd,.acquaintanceTd,.buddyTd,.friendTd,
.goodFriendsTd,.bestFriendsTd{
    font-size:10px;
    font-style:italic;
    padding-top:3px;
}
.factionTd {
    width:175px;
    text-align:right;
}
.hatedTd {
    padding-left:19px;
    width:170px;
}
.hostelTd {
    width:26px;
    padding-top:3px;
}
.unfriendlyTd {
    width:26px;
}
.neutralTd{
    width:26px;
}
.friendlyTd {
    width:41px;
}
.honoredTd {
    width:61px;
}
.reveredTd {
    width:86px;
}
.exaltedTd {
    width:10px;
}
.strangerTd {
    padding-left:19px;
    width:70px;
}
.acquaintanceTd,.buddyTd,.friendTd,
.goodFriendsTd,.bestFriendsTd {
    width:51px;
}
</style>