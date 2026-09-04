<script>
  import Item from "./Item.svelte";
  import Tooltip from "../Tooltip.svelte";
  import { getHideTooltipSetting } from '$util/utils'

  export let category;
  export let getItemPath = undefined;
  export let superCat = "";
  export let subCategoriesKey = "subCategories"
  export let itemsKey = "items"

  let totalItems = 0;
  let totalItemsCompleted = 0;

  let tooltipsHidden = getHideTooltipSetting();

  $: {
    totalItems = 0;
    totalItemsCompleted = 0;
    category[subCategoriesKey].forEach((subCategory) => {
      subCategory[itemsKey].forEach((item) => {
        totalItems += 1;
        if (item.completed || item.collected) {
          totalItemsCompleted += 1;
        }
      });
    });
  }
</script>

<div class="categoryHeader">
  {#if totalItems > 0}
    <h3>
      {category.name !== superCat ? category.name : "General"}
      <small class="pbSmall">
        {#if superCat === 'Feats of Strength' || superCat === 'Legacy'}
          ({`${totalItemsCompleted}`})
        {:else}
          ({`${totalItemsCompleted}/${totalItems}`})
        {/if}
      </small>
    </h3>
  {/if}
</div>

{#each category[subCategoriesKey] as subCategory}
  <div class="sect">
  {#if subCategory.info && tooltipsHidden != "true"}
    <div class="subCatHeader"><Tooltip text={subCategory.info}><span class="info-underline">{subCategory.name}</span></Tooltip></div>
  {:else}
    <div class="subCatHeader">{subCategory.name}</div>
  {/if}
    {#each subCategory[itemsKey] as item}
      {#if $$slots.item}
        <slot name="item" {item} />
      {:else}
        <Item {item} {getItemPath}></Item>
      {/if}
    {/each}
  </div>
{/each}

<div class="clear" />
