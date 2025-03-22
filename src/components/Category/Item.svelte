<script>
  import settings from "$util/settings";
  import { getImageSrc } from "$util/utils";

  /** @type {{item: any, getItemPath?: any}} */
  let { item, getItemPath = (item) => item.link } = $props();

  let href = $derived(item.new || item.ptr ? "//" + settings.WowHeadUrl + "/ptr/" + getItemPath(item) : "//" + settings.WowHeadUrl + "/" + getItemPath(item));
  let src = $derived(getImageSrc(item, true));
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
