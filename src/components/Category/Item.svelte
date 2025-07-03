<script>
  import settings from "$util/settings";
  import { getImageSrc } from "$util/utils";

  export let item;
  export let getItemPath = (item) => item.link;
  export let hideCollected = false;

  $: href = item.new || item.ptr ? "//" + settings.WowHeadUrl + "/ptr-2/" + getItemPath(item) : "//" + settings.WowHeadUrl + "/" + getItemPath(item);
  $: src = getImageSrc(item, true);
</script>

<a
  target={settings.anchorTarget}
  {href}
  rel={item.rel}
  class:notCollected={!(item.collected || item.completed)}
  class="thumbnail"
  class:hideCollected={hideCollected && (item.collected || item.completed)}
>
  <img height="36" width="36" {src} alt />
</a>
