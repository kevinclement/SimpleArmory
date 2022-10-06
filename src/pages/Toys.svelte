<script>
    import { onMount } from 'svelte'
    import { t, locale } from 'svelte-i18n'
    import { region, realm, character } from '$stores/user'
    import { getToys } from '$api/toys'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import { getWowHeadurl } from '$util/url'
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
	<title>{getTitle($character, $t('toys'))}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        {$t('toys')}
        {#if !showExport}
        <small class="pbSmall">
            <a href class="tupd" on:click|preventDefault={() => showExport = true}>{$t('update')}</a>
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
        <strong>{$t('toysNoAPI')}</strong>
        {$t('toysInstructions1')}
        <strong>{$t('toysExportString')}</strong>
        {$t('toysInstructions2')}
        <a href="https://wow.curseforge.com/projects/simple-armory">Simple Armory</a>
        {$t('toysInstructions3')}
        <code>/sa toys</code>
        {$t('toysInstructions4')}
    </p>
    <p>
      <small>({$t('toysSmallMessage')})</small>
    </p>

    <textarea name="toys" bind:value={toyString} cols="80" placeholder={$t('toysExportPlaceholder')}></textarea>
    <div>
      <button type="button" class="btn btn-default" on:click={save}>{$t('save')}</button>
      <button type="button" class="btn btn-default" on:click={cancel}>{$t('cancel')}</button>
    </div>
  </div>
{/if}

{#await promise}
    <Loading/>
{:then value}
  <div>
    {#if toys}
    {#each toys.categories as category}
        {#if category.name !== 'toys'}
            <h3 class="categoryHeader">{ $t(category.name) }</h3>
        {/if}
        {#each category.subCategories as subCategory}
            <div class="sect">
                <div class="subCatHeader">{ $t(subCategory.name) }</div>
                {#each subCategory.items as item}
                    <a 
                      target="{settings.anchorTarget}" 
                      href="//{getWowHeadurl($locale)}/{ item.link }" 
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