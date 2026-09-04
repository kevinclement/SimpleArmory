<script>
    export let text = "";

    let showTooltip = false;
    let tooltipStyle = "";
    let triggerEl;

    function handleMouseEnter() {
        if (!triggerEl) return;
        if (!text) return;
        const rect = triggerEl.getBoundingClientRect();
        const top = rect.top + window.scrollY - 8;
        const left = rect.left + window.scrollX + (rect.width / 2);

        tooltipStyle = `top: ${top}px; left: ${left}px;`;
        showTooltip = true;
    }

    function handleMouseLeave() {
        showTooltip = false;
    }

    function mountToBody(node) {
        document.body.appendChild(node);
        return {
        destroy() {
            if (node.parentNode) node.parentNode.removeChild(node);
        }
        };
    }
    </script>

    <span 
    class="tooltip-trigger" 
    bind:this={triggerEl} 
    on:mouseenter={handleMouseEnter} 
    on:mouseleave={handleMouseLeave}
    >
    <slot />
    </span>

    {#if showTooltip}
    <div class="info-tooltip" style={tooltipStyle} use:mountToBody>
        {text}
    </div>
    {/if}