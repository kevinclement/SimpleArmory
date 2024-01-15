<script>
    import { onMount } from 'svelte'
    import { region, realm, character, category } from '$stores/user'
    import { getAchievements } from '$api/achievements'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';
    import Category from '$components/Category/Category.svelte';

    $: superCat = prettySuperCategory($category);

    // Note: we do this here and not in the promise so we don't have to wait for it to display 100 if FoS
    $: percWidth = superCat == 'Feats of Strength' || superCat == 'Legacy' ? 100 : percent(completed, possible);

    let promise;
    let completed = 0;
    let possible = 0;
    let percentage = "";
    let achievements;
    let all;
    $: {
        promise = getAchievements($region, $realm, $character).then(_ => {           
            // NOTE: don't use superCat here to populate other parts yet
            // because doing so would put a dependency on category
            // then when only the category changed in the url, we'd do
            // an extra refresh when that isn't needed.
            all = _;
        })
    }
    $: if (all) {
        achievements = all[superCat];
        completed = achievements.completed;
        possible = achievements.possible;
        percentage = percentFormat(completed, possible);
    }
   
    onMount(async () => {
        window.ga('send', 'pageview', 'Achievements/' + $category);
    });

    function prettySuperCategory(supercat) {
        let prettyCatName = supercat;

        switch(supercat) {
            case 'character':
                prettyCatName = 'Character';
                break;
            case 'quests':
                prettyCatName = 'Quests';
                break;
            case 'exploration':
                prettyCatName = 'Exploration';
                break;
            case 'pvp':
                prettyCatName = 'Player vs. Player';
                break;          
            case 'dungeons':
                prettyCatName = 'Dungeons & Raids';
                break;          
            case 'professions':
                prettyCatName = 'Professions';
                break;
            case 'reputation':
                prettyCatName = 'Reputation';
                break;
            case 'events':
                prettyCatName = 'World Events';
                break;
            case 'pets':
                prettyCatName = 'Pet Battles';
                break;
            case 'collections':
                prettyCatName = 'Collections';
                break;
            case 'expansions':
                prettyCatName = 'Expansion Features';
                break;
            case 'legacy':
                prettyCatName = 'Legacy';
                break;                       
            case 'feats':
                prettyCatName = 'Feats of Strength';
                break;                    
        }

        return prettyCatName;
    }
</script>

<svelte:head>
	<title>{getTitle($character, 'Achievements')}</title>
</svelte:head>

<div class="container">
<div class="page-header">
    <h2>
        Achievements <small>{superCat}</small>
        <ProgressBar rightSide={true} width={percWidth} percentage={percentage}/>
    </h2>
</div>

{#await promise}
<Loading/>
{:then value}
{#if achievements}
    {#each achievements.categories as category}
        <Category {category} getItemPath={item => `achievement=${item.id}`} {superCat} subCategoriesKey={'subcats'} itemsKey={'achievements'}></Category>
    {/each}
{/if}   
{/await}
</div>