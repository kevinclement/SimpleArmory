<script>
    import { onMount } from 'svelte'
    import { t, locale } from 'svelte-i18n';
    import { region, realm, character } from '$stores/user'
    import { getTitles } from '$api/titles'
    import { percent, percentFormat, getTitle, getImageSrc } from '$util/utils'
    import { navigate } from '$util/url'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import ErrorInline from '$components/ErrorInline.svelte';

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
        {$t('titles')}
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
 
        {#if category.name !== "titles" }
        <h3 class="categoryHeader">{ $t(category.name) }</h3>
        {/if}
        
        {#each category.subCategories as subCategory}
            <div class="sect">
                <div class="subCatHeader">{ $t(subCategory.name) }</div>
                {#each subCategory.items as item}
                    <div class="thumbnail" 
                         class:borderOn={!item.collected}
                         class:borderOff={item.collected}>
                        <a 
                        target="{settings.anchorTarget}"
                        href="//{settings.WowHeadUrl}/{item.type}={item.id}"
                        >
                            <img height="36" width="36" src="{getImageSrc(item)}" alt>
                        </a>
                        <div class="title">{item.name}</div>
                    </div>
                {/each}
            </div>

        {/each}
        
        <div class="clear" />
    {/each}
    </div>
{:else}
<ErrorInline page="titles"/>
{/if}   
{/await}
</div>