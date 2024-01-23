<script>
    import { onDestroy } from "svelte";

    // Show the loading placeholder only after a small time 
    // so if you're on a fast connection it doesn't flash
    let show = false;   
    const timeoutId = setTimeout(() => {
        show = true
    }, 600);
    
    onDestroy(()=>clearTimeout(timeoutId));
</script>

<div class="loading" style="width:110px;height:30px;" >
  {#if show}
    Loading<svg xmlns="http://www.w3.org/2000/svg" style="position:relative;left:2px;top:8px;width:20px;height:20px;" viewBox="0 0 24 24"><g class="a-dot"><g class="nc-loop_dots-07-24"> <circle cx="12" cy="12" r="2" style="opacity:0.9870927999999374;"></circle> <circle class="a-dot" cx="3" cy="12" r="2" style="opacity:0.4;"></circle> <circle class="a-dot" cx="21" cy="12" r="2" style="opacity:0.41290720000006265;"></circle> </g> <script>!function(){function t(t){this.element=t,this.dots=[this.element.getElementsByTagName("circle")[1],this.element.getElementsByTagName("circle")[0],this.element.getElementsByTagName("circle")[2]],this.animationId,this.start=null,this.init()}if(!window.requestAnimationFrame){var e=null;window.requestAnimationFrame=function(t,i){var n=(new Date).getTime();e||(e=n);var a=Math.max(0,16-(n-e)),s=window.setTimeout(function(){t(n+a)},a);return e=n+a,s}}t.prototype.init=function(){var t=this;this.animationId=window.requestAnimationFrame(t.triggerAnimation.bind(t))},t.prototype.reset=function(){var t=this;window.cancelAnimationFrame(t.animationId)},t.prototype.triggerAnimation=function(t){var e=this;this.start||(this.start=t);var i=t-this.start,n=Math.min(i/250,4),a=(n=4==n?0:n)%1,s=Math.ceil(n);1e3>i||(this.start=this.start+1e3);var r=[];switch(r[0]=r[1]=r[2]=.4,s){case 1:r[0]=1-3*a/5,r[1]=.4+3*a/5;break;case 2:r[1]=1-3*a/5,r[2]=.4+3*a/5;break;case 3:r[1]=.4+3*a/5,r[2]=1-3*a/5;break;case 4:r[0]=.4+3*a/5,r[1]=1-3*a/5;break;default:r[0]=1}for(var o=0;3>o;o++)this.dots[o].setAttribute("style","opacity:"+r[o]+";");if(document.documentElement.contains(this.element))window.requestAnimationFrame(e.triggerAnimation.bind(e))};var i=document.getElementsByClassName("nc-loop_dots-07-24"),n=[];if(i)for(var a=0;i.length>a;a++)!function(e){n.push(new t(i[e]))}(a);document.addEventListener("visibilitychange",function(){"hidden"==document.visibilityState?n.forEach(function(t){t.reset()}):n.forEach(function(t){t.init()})})}();</script></g></svg>    
  {/if}
</div>