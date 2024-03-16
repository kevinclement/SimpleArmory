<script>
  import Item from "./Item.svelte";
  import ProgressBar from '$components/ProgressBar.svelte';
  import { percent, percentFormat } from '$util/utils'

  export let category;
  export let getItemPath = undefined;
  export let superCat = "";
  export let subCategoriesKey = "subCategories"
  export let itemsKey = "items"

  let totalItems = 0;
  let totalItemsCompleted = 0;
  category[subCategoriesKey].forEach((subCategory) => {
    subCategory[itemsKey].forEach((item) => {
      totalItems += 1;
      if (item.completed || item.collected) {
        totalItemsCompleted += 1;
      }
    });
  });
</script>

<div class="categoryHeader">
  <h3>{category.name !== superCat ? category.name : "General"}</h3>

  <ProgressBar
    rightSide={true}
    width={percent(totalItemsCompleted, totalItems)}
    percentage={percentFormat(totalItemsCompleted, totalItems)}
    isEmpty={totalItemsCompleted === 0}
    emptyValue={`${totalItemsCompleted} / ${totalItems} (${percent(totalItemsCompleted, totalItems)}%)`}
  />
</div>

{#each category[subCategoriesKey] as subCategory}
  <div class="sect">
    <div class="subCatHeader">{subCategory.name}</div>
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
