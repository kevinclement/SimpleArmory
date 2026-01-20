<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getAchievements } from '$api/achievements'
    import { percent, percentFormat, getTitle } from '$util/utils'
    import ProgressBar from '$components/ProgressBar.svelte';
    import { getUrl } from '$util/url'

    let promise;
    let overallWidth = 0;
    let overallPercentage = "";

    // NOTE: crazy bug where I need have have url set to non null for animation transition to work
    let cats = {
        'Characters':         { w:0, txt:'', url:'INIT', seg:'character', }, 
        'Quests':             { w:0, txt:'', url:'INIT', seg:'quests' }, 
        'Exploration':        { w:0, txt:'', url:'INIT', seg:'exploration' }, 
        'Delves':             { w:0, txt:'', url:'INIT', seg:'delves'},
        'Player vs. Player':  { w:0, txt:'', url:'INIT', seg:'pvp' }, 
        'Dungeons & Raids':   { w:0, txt:'', url:'INIT', seg:'dungeons' }, 
        'Professions':        { w:0, txt:'', url:'INIT', seg:'professions' }, 
        'Reputation':         { w:0, txt:'', url:'INIT', seg:'reputation' }, 
        'World Events':       { w:0, txt:'', url:'INIT', seg:'events' }, 
        'Pet Battles':        { w:0, txt:'', url:'INIT', seg:'pets' }, 
        'Collections':        { w:0, txt:'', url:'INIT', seg:'collections' }, 
        'Expansion Features': { w:0, txt:'', url:'INIT', seg:'expansions' },
        'Legacy':             { w:0, txt:'', url:'INIT', seg:'legacy' }, 
        'Feats of Strength':  { w:0, txt:'', url:'INIT', seg:'feats' }, 
    };
    
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

        Object.keys(cats).forEach((cat) => {
            if (cats[cat].seg === 'legacy') {
                cats[cat].w = 100;
                cats[cat].txt = achievements[cat].legacyTotal;
            } else if (cats[cat].seg === 'feats') {
                cats[cat].w = 100;
                cats[cat].txt = achievements[cat].foSTotal;
            } else {
                cats[cat].w = percent(achievements[cat].completed, achievements[cat].possible)
                cats[cat].txt = percentFormat(achievements[cat].completed, achievements[cat].possible)
            }
            
            cats[cat].url = getUrl($region, $realm, $character, 'achievements/' + cats[cat].seg)
        })
    }
</script>

<svelte:head>
	<title>{getTitle($character, 'Overview')}</title>
</svelte:head>

<div class="container">
    <!-- Progress Overview -->
    <div class="page-header">
      <h2>Progress Overview</h2>
    </div>
    <strong class="desc">Total Complete</strong>
    <ProgressBar width={overallWidth} percentage={overallPercentage} styleWidth="auto"/>
  
    {#each Object.keys(cats) as cat}
        <div class="achGrid">
            <strong class="desc">{cat}</strong>
            <ProgressBar name="{cat}" width={cats[cat].w} percentage={cats[cat].txt} url={cats[cat].url} styleWidth="auto" />
        </div>
    {/each}
    
</div>