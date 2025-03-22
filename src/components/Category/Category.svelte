<!-- @migration-task Error while migrating Svelte code: `$props` cannot be called with arguments -->
<!-- @migration-task Error while migrating Svelte code: `$props` cannot be called with arguments -->
<script>
  import Item from "./Item.svelte";

  // Props using $props rune
  const props = $props({
    category: undefined,
    getItemPath: undefined, 
    superCat: "",
    subCategoriesKey: "subCategories",
    itemsKey: "items"
  });

  // State using $state rune
  let totalItems = $state(0);
  let totalItemsCompleted = $state(0);

  // Replace reactive statement with $effect
  $effect(() => {
    totalItems = 0;
    totalItemsCompleted = 0;
    props.category[props.subCategoriesKey].forEach((subCategory) => {
      subCategory[props.itemsKey].forEach((item) => {
        totalItems += 1;
        if (item.completed || item.collected) {
          totalItemsCompleted += 1;
        }
      });
    });
  });
</script>

<div class="categoryHeader">
  {#if totalItems > 0}
    <h3>
      {props.category.name !== props.superCat ? props.category.name : "General"}
      <small class="pbSmall">
        {#if props.superCat === 'Feats of Strength' || props.superCat === 'Legacy'}
          ({`${totalItemsCompleted}`})
        {:else}
          ({`${totalItemsCompleted}/${totalItems}`})
        {/if}
      </small>
    </h3>
  {/if}
</div>

{#each props.category[props.subCategoriesKey] as subCategory}
  <div class="sect">
    <div class="subCatHeader">{subCategory.name}</div>
    {#each subCategory[props.itemsKey] as item}
      {#if $$slots.item}
        <slot name="item" {item} />
      {:else}
        <Item item={item} getItemPath={props.getItemPath}></Item>
      {/if}
    {/each}
  </div>
{/each}

<div class="clear" />
