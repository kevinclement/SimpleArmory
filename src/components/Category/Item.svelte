<script>
  import settings from "$util/settings";
  import { getImageSrc } from "$util/utils";

  export let item;
  export let getItemPath = (item) => item.link;

  const href = "//" + settings.WowHeadUrl + "/" + getItemPath(item);
</script>

<a
  target={settings.anchorTarget}
  {href}
  rel={item.rel}
  class:notCollected={!(item.collected || item.completed)}
  class="thumbnail"
>
  <img height="36" width="36" src={ getImageSrc(item, true) } alt />
</a>
