<script>
    /** @type {{width?: number, styleWidth?: number, percentage?: string, rightSide?: boolean, url?: string, name?: string}} */
    let {
        width = 0,
        styleWidth = 250,
        percentage = "",
        rightSide = false,
        url = "",
        name = ""
    } = $props();
</script>

<div class="progress" class:progressRight={rightSide} style="width: { styleWidth == 'auto' ? 'auto' : styleWidth + 'px' }">
{#if url !== ""}
    <a href={url} aria-label="{name}">
        <div class="progress-bar progress-bar-success" style="width: {width}%;">
            <span>{ percentage }</span>
        </div>
    </a>
{:else}
    <div class="progress-bar progress-bar-success" style="width: {width}%;">
        <span>{ percentage }</span>
    </div>
{/if}
</div>