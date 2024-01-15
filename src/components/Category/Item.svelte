<script>
  import settings from "$util/settings";
  import { getImageSrc } from "$util/utils";

  export let item;
  export let getItemPath = (item) => item.link;

  $: href = "//" + settings.WowHeadUrl + "/" + getItemPath(item);
  $: src = getImageSrc(item, true)
</script>

<a
  target={settings.anchorTarget}
  {href}
  rel={item.rel}
  class:notCollected={!(item.collected || item.completed)}
  class="thumbnail"
>
  <img height="36" width="36" {src} alt />
</a>
