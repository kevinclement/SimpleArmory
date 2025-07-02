<script>
    import { region, realm, character } from '$stores/user'
    import { onMount } from 'svelte'
    import { getPlannerSteps } from '$api/planner'
    import settings from '$util/settings'
    import Loading from '$components/Loading.svelte';

    export let mounts
    export let isAlliance;
    let promise;
    let steps;
    
    // Clé de stockage unique par personnage
    function getStorageKey() {
        return `mountsPlannerCheckedUntil_${$region}_${$realm}_${$character}`;
    }

    // Charger l'état sauvegardé
    function loadCheckedUntil(steps) {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
        } catch {}
        return steps.map((step, i) => ({
            ...step,
            checkedUntil: saved[i] || null
        }));
    }

    // Sauvegarder l'état
    function saveCheckedUntil(steps) {
        const obj = {};
        steps.forEach((step, i) => {
            if (step.checkedUntil) obj[i] = step.checkedUntil;
        });
        localStorage.setItem(getStorageKey(), JSON.stringify(obj));
    }

    $: {
        promise = getPlannerSteps(mounts, $region, $realm, $character).then(_ => {           
            steps = loadCheckedUntil(_);
        })
    }

    // Gestion des cases à cocher
    function isChecked(step) {
        if (!step.checkedUntil) return false;
        const now = new Date();
        const until = new Date(step.checkedUntil);
        return now < until;
    }

    function toggleCheck(step, index) {
        if (isChecked(step)) {
            steps[index].checkedUntil = null;
        } else {
            // Rayure immédiate : on met une date future lointaine (ex: 2100-01-01)
            steps[index].checkedUntil = '2100-01-01T23:59:59';
        }
        saveCheckedUntil(steps);
    }

    function resetAll() {
        steps = steps.map(step => ({ ...step, checkedUntil: null }));
        saveCheckedUntil(steps);
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Planner');
    });

    function getPlanStepImageSrc(step) {
        if (step.capital) {
            if (isAlliance) {
                return '/images/alliance.png';
            }
            else {
                return '/images/horde.png';
            }
        }
        else if (step.hearth) {
            return '/images/hearth.png';
        }

        return '';
    }

    function getPlanImageSrc(boss) {
        if (!boss.icon) {
            return '';
        }

        return '//wow.zamimg.com/images/wow/icons/tiny/' + boss.icon + '.gif';
    };

    function getStepTitle(step) {
        if (step.capital) {
            return 'Hearthstone to ' + (isAlliance ? 'Stormwind ' : 'Orgrimmar ') + step.title;
        }
        else {
            return step.title;
        }
    }

    function anchorCss(boss) {
        if (boss.epic) {
            return 'mnt-plan-epic';
        }

        return 'mnt-plan-rare';
    }
</script>

{#await promise}
<Loading/>
{:then value}
{#if steps && steps.length == 0}
<div>
    <img src="/images/success.png" alt/>
    <p>
      Grats! You've farmed all the mounts. <br/>
      You should post on <a href="http://reddit.com/r/wow">/r/wow</a>!
    </p>
</div>
{:else}
<button class="btn btn-sm btn-default" on:click={resetAll} style="margin-bottom:10px;">Reset all</button>
<table class="table table-condensed">
    <thead>
      <tr>
        <th>Done</th>
        <th>#</th>
        <th>Step</th>
        <th class="mnt-plan-boss-col">Boss</th>
        <th class="mnt-plan-mount-col" style="padding-left:0px;">Mount</th>
        <th>Notes</th>
      </tr>
    </thead>
    {#each steps as step, index}
        <tbody>
            <tr class={isChecked(step) ? 'mnt-planner-checked' : ''}>
                <td>
                  <input type="checkbox" checked={isChecked(step)} on:change={() => toggleCheck(step, index)} />
                </td>
                <td>{index + 1}</td>
                <td>
                    {#if getPlanStepImageSrc(step) != ''}
                    <img src="{getPlanStepImageSrc(step)}" class="mnt-icon-step" alt/>
                    {/if}
                    {getStepTitle(step)}
                </td>
                <td colspan="2">
                  <table width="100%">
                      {#if step.bosses}
                        {#each step.bosses as boss}
                            <tbody>
                                <tr>
                                    {#if boss.boosted}
                                    <td class="mnt-plan-boss-col mnt-plan-boss-boosted">{boss.name}</td>
                                    {:else}
                                    <td class="mnt-plan-boss-col">{boss.name}</td>
                                    {/if}
                                    <td class="mnt-plan-mount-col">
                                        {#if boss.itemId}
                                            <a class="{anchorCss(boss)}" target="{settings.anchorTarget}" href="//{settings.WowHeadUrl}/item={ boss.itemId }">
                                                <img class="mnt-plan-icon" src="{getPlanImageSrc(boss)}" alt>{boss.mount}</a>
                                        {/if}
                                        
                                    </td>
                                </tr>
                            </tbody>
                        {/each}
                      {/if}
                    
                  </table>
                </td>
                <td>
                  {step.notes ? step.notes : ""}
                  <table>
                      {#if step.bosses}
                        {#each step.bosses as boss}
                            <tbody>
                                <tr><td>{boss.note ? boss.note : ""}&nbsp;</td></tr>
                            </tbody>
                        {/each}
                      {/if}
                  </table>
                </td>
            </tr>
        </tbody>
    {/each}

<style>
.mnt-planner-checked {
  text-decoration: line-through;
  opacity: 0.5;
}
</style>
</table>
{/if}

{/await}