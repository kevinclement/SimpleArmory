<script>
  import settings from "$util/settings";
  import { getImageSrc } from "$util/utils";

  export let item;
  export let getItemPath;

  const href = "//" + settings.WowHeadUrl + "/" + getItemPath(item);
</script>

<a
  target={settings.anchorTarget}
  {href}
  class:notCollected={!(item.collected || item.completed)}
  class="thumbnail"
>
  <img height="36" width="36" src={ getImageSrc(item, true) } alt />
</a>
