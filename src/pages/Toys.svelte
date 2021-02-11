<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getToys } from '$api/toys'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';

    let showExport = localStorage.getItem('toys') === null;
    let toyString
    let toys
    $: promise = getToys($region, $realm, $character).then(_ => {
        init(_);
    })

    function init(_) {
        if (!_) return;
        toys = _;
    }

    function save() {
        try {
            JSON.parse(toyString);
        } catch (e) {
            // NOTE: display json error? do more consistency checks?
            return;
        }

        localStorage.setItem('toys', toyString);
        
        // refetch toys given newly stored local storage
        getToys($region, $realm, $character, true).then(_ => { init(_); })
        showExport = false;
    }

    function cancel() {
        showExport = false;
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
        {#if !showExport}
        <small class="pbSmall">
            <a href class="tupd" on:click|preventDefault={() => showExport = true}>Update</a>
        </small>
        {/if}
        <ProgressBar 
                rightSide={true}
                width={toys ? percent(toys.collected, toys.possible) : 0} 
                percentage={toys ? percentFormat(toys.collected, toys.possible) : ""}/>
    </h2>
</div>

{#if showExport}
<div style="padding-bottom:10px">
    <p>
        <strong>The Blizzard API doesn't currently support fetching toys.</strong>
        To see what toys you have earned, you have to paste a <strong>toy export string</strong> in the field below.
        You can get this string by downloading the <a href="https://wow.curseforge.com/projects/simple-armory">Simple Armory</a>
        addon, then typing <code>/sa toys</code> in your chat window.
    </p>
    <p>
      <small>(If you find this frustrating, feel free to post on the forums to ask for
      the Toys to be exported in the API along with the mounts and pets)</small>
    </p>

    <textarea name="toys" bind:value={toyString} cols="80" placeholder="Copy your export string here..."></textarea>
    <div>
      <button type="button" class="btn btn-default" on:click={save}>Save</button>
      <button type="button" class="btn btn-default" on:click={cancel}>Cancel</button>
    </div>
  </div>
{/if}

{#await promise}
    <Loading/>
{:then value}
  <div>
    {#if toys}
    {#each toys.categories as category}
        {#if category.name !== 'Toys'}
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