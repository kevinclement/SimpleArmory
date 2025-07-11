<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { fade } from 'svelte/transition';

  import settings from '$util/settings';
  import Loading from '$components/Loading.svelte';

  import { getPlannerSteps } from '$api/planner';
  import {
    region,
    realm,
    character,
    hideCompletedStore,
  } from '$stores/user';

  export let mounts;
  export let isAlliance;

  let promise;
  let steps;
  let startStep;
  let filteredSteps = [];
  let checkedAtStore;

  $: filteredSteps = steps ? ($hideCompletedStore ? steps.filter(step => !isValidCheck(step)) : steps) : [];
  
  $: {
    promise = getPlannerSteps(mounts, $region, $realm, $character).then(raw => {
      const loaded = loadCheckedAt(raw);
      startStep = loaded.find(s => s.startStep);
      steps = loaded.filter(s => !s.startStep);
    });
  }

  onMount(async () => {
    window.ga('send', 'pageview', 'Planner');
  });

  function getStorageKey() {
    return `mountsPlannerCheckedAt_${$region}_${$realm}_${$character}`;
  }

  // Check if a step is valid based on its checkedAt timestamp
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

  // Load checkedAt timestamps from localStorage
  function loadCheckedAt(steps) {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
    } catch {}

    return steps.map(step => ({
      ...step,
      checkedAt: saved[step.idx] || null
    }));
  }

  // Save checkedAt timestamps to localStorage
  function saveCheckedAt(steps) {
    const obj = {};
    steps.forEach(step => {
      if (step.checkedAt) obj[step.idx] = step.checkedAt;
    });
    localStorage.setItem(getStorageKey(), JSON.stringify(obj));
  }

  function isStepCheckable(step) {
    return step.title?.startsWith('Run') || step.title?.startsWith('Kill');
  }

  function isChecked(step) {
    return isStepCheckable(step) && isValidCheck(step);
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

  // Helper function to check if all child steps are checked
  function areAllChildrenChecked(stepsArr, parentIdx) {
    // Find all steps that have the given parentIdx
    const children = stepsArr.filter(s => s.parentIdx === parentIdx);
    if (children.length === 0) return true; // No children means parent can be considered "complete"
    return children.every(child => {
      if (isStepCheckable(child)) {
        return isValidCheck(child);
      }
      // If not checkable, check its children recursively
      return areAllChildrenChecked(stepsArr, child.idx);
    });
  }

  function findIndexByIdx(stepsArr, idx) {
    return stepsArr.findIndex(s => s.idx === idx);
  }

  // Get reset times based on region
  function getResetTimes(region) {
      if (region === 'us') {
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

  // Get the next daily and weekly reset times
  function getNextDailyReset(region) {
      const { dailyHourUTC } = getResetTimes(region);
      const now = new Date();
      const reset = new Date(now);
      reset.setUTCHours(dailyHourUTC, 0, 0, 0);
      if (now >= reset) {
          reset.setUTCDate(reset.getUTCDate() + 1);
      }
      return formatResetDateEn(reset);
  }

  function getNextWeeklyReset(region) {
      const { weeklyDay, weeklyHourUTC } = getResetTimes(region);
      const now = new Date();
      const reset = new Date(now);
      const currentDay = now.getUTCDay();
      const daysUntilReset = (weeklyDay - currentDay + 7) % 7 || 7;
      reset.setUTCDate(reset.getUTCDate() + daysUntilReset);
      reset.setUTCHours(weeklyHourUTC, 0, 0, 0);
      return formatResetDateEn(reset);
  }

  function formatResetDateEn(date) {
      const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return date.toLocaleString('en-US', {
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: userTZ,
      });
  }

  let highlighted = new Set();
  let highlightTimeout;

  function toggleCheck(step, index) {
    if (!isStepCheckable(step)) return;

    let updated = [...steps];

    if (isChecked(step)) {
      // Uncheck the step and its parents
      updated = uncheckStep(updated, index);
    } else {
      // Check the step
      const checkedAt = new Date().toISOString();
      updated[index] = { ...updated[index], checkedAt };

      // Highlight the checked step
      highlighted.add(index);

      // Check parents only if all siblings are checked
      let currentIdx = index;
      let parentIdx = updated[currentIdx].parentIdx;

      while (parentIdx !== null && parentIdx !== undefined) {
        const parentStepIndex = findIndexByIdx(updated, parentIdx);
        if (parentStepIndex === -1) break;

        // Only check the parent if all its children are checked
        if (areAllChildrenChecked(updated, parentIdx)) {
          updated[parentStepIndex] = { ...updated[parentStepIndex], checkedAt };
          highlighted.add(parentStepIndex);
        }

        currentIdx = parentStepIndex;
        parentIdx = updated[currentIdx].parentIdx;
      }
    }

    steps = updated;
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

  function getPlanStepImageSrc(step) {
    if (step.capital) return isAlliance ? '/images/alliance.png' : '/images/horde.png';
    if (step.hearth) return '/images/hearth.png';
    return '';
  }

  function getPlanImageSrc(mount) {
    return mount && mount.icon ? `//wow.zamimg.com/images/wow/icons/tiny/${mount.icon}.gif` : '';
  }

  function getCapital() {
    return isAlliance ? 'Stormwind' : 'Orgrimmar';
  }

  function getStartTitle(step) {
    return `${step.title} ${getCapital()}`;
  }

  function getStepTitle(step) {
    return step.capital && !step.startStep
      ? `Hearthstone to ${getCapital()} ${step.title}`
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
<div style="font-size: 13px; margin-bottom: 12px; color: #888;">
  📆 Next daily reset: {getNextDailyReset(region)}<br/>
  📅 Next weekly reset: {getNextWeeklyReset(region)}
</div>
<div class="mnt-controls">
  <div class="mnt-reset-buttons">
    <button class="btn btn-sm btn-default" on:click={resetAll}>Reset all</button>
    <button class="btn btn-sm btn-default" on:click={() => resetByType('Dungeon')}>Reset Dungeons</button>
    <button class="btn btn-sm btn-default" on:click={() => resetByType('Raid')}>Reset Raids</button>
  </div>
  <div class="mnt-toggle-container">
    <span class="mnt-toggle-label">Hide completed steps</span>
    <label class="mnt-toggle-switch">
      <input type="checkbox" bind:checked={$hideCompletedStore} />
      <span class="mnt-toggle-slider"></span>
    </label>
  </div>
</div>
{#if startStep}
  <div class="mnt-start-step">
    <div style="width: 100%; text-align: center;">
      <img src="{getPlanStepImageSrc(startStep)}" class="mnt-icon-step" alt />
      <strong>{getStartTitle(startStep)}</strong>
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
    {#each filteredSteps as step, index (step.idx)}
        <tbody transition:fade="{{ duration: 300 }}">
            <tr class="{getFullLineClass(step, steps.findIndex(s => s.idx === step.idx))}">
                <td class="mnt-plan-col-done" style="text-align:center;">
                  {#if isStepCheckable(step)}
                    <input type="checkbox" checked={isChecked(step)} on:change={() => toggleCheck(step, steps.findIndex(s => s.idx === step.idx))} />
                  {:else}
                    <span>—</span>
                  {/if}
                </td>

                <td class="mnt-plan-col-num" style="text-align:center;">{index + 1}</td>

                <td class="mnt-plan-col-step">
                    {#if getPlanStepImageSrc(step) != ''}
                    <img src="{getPlanStepImageSrc(step)}" class="mnt-icon-step" alt/>
                    {/if}
                    {getStepTitle(step)}
                </td>

                <td class="mnt-plan-boss-col" colspan="2">
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
                
                <td class="mnt-plan-notes-col">
                  {step.notes ? step.notes : ""}
                  {#if step.bosses}
                    <table width="100%">
                        {#each step.bosses as boss}
                            <tr><td>{boss.note ? boss.note : ""} </td></tr>
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