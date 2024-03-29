<script>
    export let width = 0;
    export let styleWidth = 250;
    export let percentage = "";
    export let rightSide = false;
    export let url = "";
    export let name = "";
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