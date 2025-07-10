<script>
  import { region, realm, character } from '$stores/user';
  import { onMount } from 'svelte';
  import { getPlannerSteps } from '$api/planner';
  import settings from '$util/settings';
  import Loading from '$components/Loading.svelte';

  export let mounts;
  export let isAlliance;
  let promise;
  let steps;
  let startStep;

  function getStorageKey() {
    return `mountsPlannerCheckedAt_${$region}_${$realm}_${$character}`;
  }

  function getResetTimes(region) {
    if (region === 'US') {
      return {
        dailyHourUTC: 15,
        weeklyDay: 2,
        weeklyHourUTC: 15,
      };
    }
    return {
      dailyHourUTC: 4,
      weeklyDay: 3,
      weeklyHourUTC: 4,
    };
  }

  function isValidCheck(step) {
    if (!step.checkedAt) return false;
    const { dailyHourUTC, weeklyDay, weeklyHourUTC } = getResetTimes($region);
    const now = new Date();
    const checkedDate = new Date(step.checkedAt);

    if (step.type === 'Dungeon') {
      const dailyReset = new Date(now);
      dailyReset.setUTCHours(dailyHourUTC, 0, 0, 0);
      if (now < dailyReset) {
        dailyReset.setUTCDate(dailyReset.getUTCDate() - 1);
      }
      return checkedDate >= dailyReset;
    }

    if (step.type === 'Raid') {
      const currentDay = now.getUTCDay();
      const daysSinceReset = (currentDay + 7 - weeklyDay) % 7;
      const lastWeeklyReset = new Date(now);
      lastWeeklyReset.setUTCDate(now.getUTCDate() - daysSinceReset);
      lastWeeklyReset.setUTCHours(weeklyHourUTC, 0, 0, 0);
      return checkedDate >= lastWeeklyReset;
    }

    return true;
  }

  function loadCheckedAt(steps) {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
    } catch {}

    return steps.map((step, i) => ({
      ...step,
      checkedAt: saved[i] || null
    }));
  }

  function saveCheckedAt(steps) {
    const obj = {};
    steps.forEach((step, i) => {
      if (step.checkedAt) obj[i] = step.checkedAt;
    });
    localStorage.setItem(getStorageKey(), JSON.stringify(obj));
  }

  $: {
    promise = getPlannerSteps(mounts, $region, $realm, $character).then(raw => {
      const loaded = loadCheckedAt(raw);
      startStep = loaded.find(s => s.startStep);
      steps = loaded.filter(s => !s.startStep);
    });
  }

  function isStepCheckable(step) {
    return step.title?.startsWith('Run') || step.title?.startsWith('Kill');
  }

  function isChecked(step) {
    return isStepCheckable(step) && isValidCheck(step);
  }

  function findIndexByIdx(stepsArr, idx) {
    return stepsArr.findIndex(s => s.idx === idx);
  }

  function uncheckStep(stepsArr, index) {
    let updated = [...stepsArr];
    let idx = index;
    while (
      idx !== null &&
      idx !== undefined &&
      updated[idx] &&
      updated[idx].checkedAt
    ) {
      updated[idx] = { ...updated[idx], checkedAt: null };
      const parentIdxValue = updated[idx].parentIdx;
      if (parentIdxValue === null || parentIdxValue === undefined) break;
      idx = findIndexByIdx(updated, parentIdxValue);
      if (idx === -1) break;
    }
    return updated;
  }

  let highlighted = new Set();
  let highlightTimeout;

  function toggleCheck(step, index) {
    if (!isStepCheckable(step)) return;
    if (isChecked(step)) {
      steps = uncheckStep(steps, index);
    } else {
      const checkedAt = new Date().toISOString();
      let updated = [...steps];
      let idx = index;
      while (idx !== null && idx !== undefined && updated[idx]) {
        updated[idx] = { ...updated[idx], checkedAt };
        highlighted.add(idx);
        const parentIdx = updated[idx].parentIdx;
        if (parentIdx === null || parentIdx === undefined) break;
        idx = findIndexByIdx(updated, parentIdx);
        if (idx === -1) break;
      }
      steps = updated;
    }

    saveCheckedAt(steps);

    clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      highlighted = new Set();
    }, 600);
  }

  function resetByType(type) {
    let updated = [...steps];
    steps.forEach((step, idx) => {
      if (step.type === type && step.checkedAt) {
        updated = uncheckStep(updated, idx);
      }
    });
    steps = updated;
    saveCheckedAt(steps);
  }

  function resetAll() {
    steps = steps.map(s => ({ ...s, checkedAt: null }));
    saveCheckedAt(steps);
  }

  onMount(() => {
    window.ga('send', 'pageview', 'Planner');
  });

  function getPlanStepImageSrc(step) {
    if (step.capital) return isAlliance ? '/images/alliance.png' : '/images/horde.png';
    if (step.hearth) return '/images/hearth.png';
    return '';
  }

  function getPlanImageSrc(mount) {
    return mount && mount.icon ? `//wow.zamimg.com/images/wow/icons/tiny/${mount.icon}.gif` : '';
  }

  function getStepTitle(step) {
    return step.capital && !step.startStep
      ? 'Hearthstone to ' + (isAlliance ? 'Stormwind ' : 'Orgrimmar ') + step.title
      : step.title;
  }

  function anchorCss(boss) {
    return boss.epic ? 'mnt-plan-epic' : 'mnt-plan-rare';
  }

  function getFullLineClass(step, index) {
    let classes = [];
    if (isValidCheck(step)) classes.push('mnt-planner-checked');
    if (highlighted.has(index)) classes.push('mnt-highlight');
    return classes.join(' ');
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
<div style="margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap;">
  <button class="btn btn-sm btn-default" on:click={resetAll}>Reset all</button>
  <button class="btn btn-sm btn-default" on:click={() => resetByType('Dungeon')}>Reset Dungeons</button>
  <button class="btn btn-sm btn-default" on:click={() => resetByType('Raid')}>Reset Raids</button>
</div>
{#if startStep}
  <div class="mnt-start-step">
    <div style="width: 100%; text-align: center;">
      <img src="{getPlanStepImageSrc(startStep)}" class="mnt-icon-step" alt />
      <strong>{getStepTitle(startStep)}</strong>
    </div>
  </div>
{/if}
<table class="table table-condensed mnt-planner-table">
    <thead>
      <tr>
        <th class="mnt-plan-col-done">Done</th>
        <th class="mnt-plan-col-num">#</th>
        <th class="mnt-plan-col-step">Step</th>
        <th class="mnt-plan-boss-col">Boss</th>
        <th class="mnt-plan-mount-col">Mount</th>
        <th class="mnt-plan-notes-col">Notes</th>
      </tr>
    </thead>
    {#each steps as step, index}
        <tbody>
            <tr class="{getFullLineClass(step, index)}">
                <td class="mnt-plan-col-done" style="text-align:center;">
                  {#if isStepCheckable(step)}
                    <input type="checkbox" checked={isChecked(step)} on:change={() => toggleCheck(step, index)} />
                  {:else}
                    <span>&mdash;</span>
                  {/if}

                </td>
                <td class="mnt-plan-col-num" style="text-align:center;">{index + 1}</td>
                <td class="mnt-plan-col-step">
                    {#if getPlanStepImageSrc(step) != ''}
                    <img src="{getPlanStepImageSrc(step)}" class="mnt-icon-step" alt/>
                    {/if}
                    {getStepTitle(step)}
                </td>
                <td class="mnt-plan-boss-col">
                  {#if step.bosses}
                    <table width="100%">
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
                    </table>
                  {/if}
                </td>
                <td class="mnt-plan-mount-col">
                  {#if step.bosses}
                    <table width="100%">
                        {#each step.bosses as boss}
                            <tr>
                                <td class="mnt-plan-mount-col">
                                    {#if boss.mount && boss.mount.itemId}
                                        <a class="{anchorCss(boss)}" target="{settings.anchorTarget}" href="//{settings.WowHeadUrl}/item={ boss.mount.itemId }">
                                            <img class="mnt-plan-icon" src="{getPlanImageSrc(boss.mount)}" alt>{boss.mount.name}</a>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </table>
                  {/if}
                </td>
                <td class="mnt-plan-notes-col">
                  {step.notes ? step.notes : ""}
                  {#if step.bosses}
                    <table width="100%">
                        {#each step.bosses as boss}
                            <tr><td>{boss.note ? boss.note : ""}&nbsp;</td></tr>
                        {/each}
                    </table>
                  {/if}
                </td>
            </tr>
        </tbody>
    {/each}
</table>
{/if}
{/await}
