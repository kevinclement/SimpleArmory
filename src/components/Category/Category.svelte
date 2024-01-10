<script>
  import Item from "./Item.svelte";

  export let category;
  export let getItemPath;
  export let superCat = "";
  export let subCategoriesKey = "subCategories"
  export let itemsKey = "items"
</script>

{#if category.name != superCat}
  <h3 class="categoryHeader">{category.name}</h3>
{/if}

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
