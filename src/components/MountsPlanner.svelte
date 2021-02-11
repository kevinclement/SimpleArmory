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
    
    $: {
        promise = getPlannerSteps(mounts, $region, $realm, $character).then(_ => {           
            steps = _;
        })
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
            return step.title + (isAlliance ? 'Stormwind' : 'Orgrimmar');
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
<table class="table table-condensed">
    <thead>
      <tr>
        <th>#</th>
        <th>Step</th>
        <th class="mnt-plan-boss-col">Boss</th>
        <th class="mnt-plan-mount-col" style="padding-left:0px;">Mount</th>
        <th>Notes</th>
      </tr>
    </thead>
    {#each steps as step, index}
        <tbody>
            <tr>
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
                                    <td class="mnt-plan-boss-col">{boss.name}</td>
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
</table>
{/if}

{/await}