<script>
  import settings from "$util/settings";
  import { getImageSrc } from "$util/utils";

  export let item;
  export let getItemPath;

  $: href = "//" + settings.WowHeadUrl + "/" + getItemPath(item);
</script>

<a
  target={settings.anchorTarget}
  {href}
  class:borderOn={!(item.collected || item.completed)}
  class:borderOff={item.collected || item.completed}
  class="thumbnail"
>
  <img height="36" width="36" src={getImageSrc(item)} alt />
</a>
