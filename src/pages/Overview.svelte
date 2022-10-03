<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getAchievements } from '$api/achievements'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import { getUrl } from '$util/url'
    import { t } from 'svelte-i18n'

    let promise;
    let overallWidth = 0;
    let overallPercentage = "";

    // NOTE: crazy bug where I need have have url set to non null for animation transition to work
    let cats = [
        { w:0, txt:'', url:'INIT', seg:'character', }, 
        { w:0, txt:'', url:'INIT', seg:'quests' }, 
        { w:0, txt:'', url:'INIT', seg:'exploration' }, 
        { w:0, txt:'', url:'INIT', seg:'pvp' }, 
        { w:0, txt:'', url:'INIT', seg:'dungeons' }, 
        { w:0, txt:'', url:'INIT', seg:'professions' }, 
        { w:0, txt:'', url:'INIT', seg:'reputation' }, 
        { w:0, txt:'', url:'INIT', seg:'events' }, 
        { w:0, txt:'', url:'INIT', seg:'pets' }, 
        { w:0, txt:'', url:'INIT', seg:'collections' }, 
        { w:0, txt:'', url:'INIT', seg:'expansions' }, 
        { w:0, txt:'', url:'INIT', seg:'legacy' }, 
        { w:0, txt:'', url:'INIT', seg:'feats' }, 
    ];
    
    $: {
        promise = getAchievements($region, $realm, $character).then(_ => {           
            init(_);
        })
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Overview');
    });

    function init(achievements){
        if (!achievements) return;

        overallWidth = percent(achievements.completed, achievements.possible);
        overallPercentage = percentFormat(achievements.completed, achievements.possible);

        for (const cat of cats) {
            if (cat.seg === 'legacy') {
                cat.w = 100;
                cat.txt = achievements[cat.seg].legacyTotal;
            } else if (cat.seg === 'feats') {
                cat.w = 100;
                cat.txt = achievements[cat.seg].foSTotal;
            } else {
                cat.w = percent(achievements[cat.seg].completed, achievements[cat.seg].possible);
                cat.txt = percentFormat(achievements[cat.seg].completed, achievements[cat.seg].possible);
            }

            cat.url = getUrl($region, $realm, $character, 'achievements/' + cat.seg)
        }

        // Trigger re-render with initialized values
        cats = cats;
    }
</script>

<svelte:head>
	<title>{getTitle($character, $t('overview'))}</title>
</svelte:head>

<div class="container">
    <!-- Progress Overview -->
    <div class="page-header">
      <h2>{$t('progressOverview')}</h2>
    </div>
    <strong class="desc">{$t('totalComplete')}</strong>
    <ProgressBar width={overallWidth} percentage={overallPercentage} styleWidth="auto"/>
  
    {#each cats as cat}
        <div class="achGrid">
            <strong class="desc">{$t(cat.seg)}</strong>
            <ProgressBar name="{$t(cat.seg)}" width={cat.w} percentage={cat.txt} url={cat.url} styleWidth="auto" />
        </div>
    {/each}
    
</div>