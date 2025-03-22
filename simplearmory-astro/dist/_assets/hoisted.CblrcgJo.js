import{g as h,p as E,b as C}from"./Nav.astro_astro_type_script_index_0_lang.CT0JDFuw.js";const m=new Map;async function g(t,e,o){if(!t||!e||!o)throw new Error("Region, realm, and character are required");const n=`${t}_${e}_${o}`;if(m.has(n))return m.get(n);try{const r=`/api/titles?region=${encodeURIComponent(t)}&realm=${encodeURIComponent(e)}&character=${encodeURIComponent(o)}`,a=await fetch(r);if(!a.ok)throw new Error(`Failed to fetch titles: ${a.status} ${a.statusText}`);const i=await a.json();return m.set(n,i),i}catch(r){throw console.error("Error fetching titles:",r),r}}document.addEventListener("DOMContentLoaded",async()=>{try{window.ga&&window.ga("send","pageview","Titles");const t=h();if(!t||!t.region||!t.realm||!t.character){d("Missing character information");return}document.title=getTitle(t.character,"Titles");const e=await g(t.region,t.realm,t.character);if(!e){d("Failed to load titles data");return}f(e),w(e)}catch(t){console.error("Error loading titles:",t),d(t.message||"Failed to load titles")}});function f(t){const e=document.getElementById("progress-container");if(e){const o=`
        <div class="progress">
          <div class="progress-bar" role="progressbar" style="width: ${E(t.collected,t.possible)}%;" aria-valuenow="${t.collected}" aria-valuemin="0" aria-valuemax="${t.possible}"></div>
        </div>
        <div class="progress-text">${C(t.collected,t.possible)}</div>
      `;e.innerHTML=o}}function w(t){const e=document.getElementById("titles-container");if(e){e.innerHTML="";for(const o of t.categories){const n=document.createElement("div");n.className="category";const r=document.createElement("h3");r.textContent=o.name,n.appendChild(r);for(const a of o.subcats){const i=document.createElement("div");i.className="subcategory";const u=document.createElement("h4");u.textContent=a.name,i.appendChild(u);const p=document.createElement("div");p.className="items";for(const s of a.titles){const c=document.createElement("div");c.className=`title-item${s.collected?" collected":""}`;const l=document.createElement("a");l.href=s.source?.link||"#",l.target="_blank",l.rel="noopener noreferrer",l.textContent=s.name.replace("%s",""),c.appendChild(l);const v=`
            <div class="tooltip-content">
              <div class="tooltip-title">${s.name.replace("%s","[Character]")}</div>
              <div class="tooltip-description">${s.description||""}</div>
              ${s.source?`<div class="tooltip-source">Source: ${s.source.text}</div>`:""}
            </div>
          `;c.setAttribute("data-tooltip",v),c.addEventListener("mouseenter",function(){const y=this.getAttribute("data-tooltip");$(this,y)}),c.addEventListener("mouseleave",function(){b()}),p.appendChild(c)}i.appendChild(p),n.appendChild(i)}e.appendChild(n)}}}function d(t){const e=document.getElementById("titles-container");e&&(e.innerHTML=`
        <div class="error">
          <i class="glyphicon glyphicon-exclamation-sign"></i>
          <p>${t}</p>
        </div>
      `)}function $(t,e){let o=document.getElementById("title-tooltip");o||(o=document.createElement("div"),o.id="title-tooltip",o.className="tooltip",document.body.appendChild(o)),o.innerHTML=e;const n=t.getBoundingClientRect(),r=o.getBoundingClientRect();let a=n.top-r.height-10,i=n.left+n.width/2-r.width/2;a<0&&(a=n.bottom+10),i<0&&(i=0),i+r.width>window.innerWidth&&(i=window.innerWidth-r.width),o.style.top=`${a+window.scrollY}px`,o.style.left=`${i}px`,o.style.display="block"}function b(){const t=document.getElementById("title-tooltip");t&&(t.style.display="none")}document.addEventListener("router:update",async()=>{const t=h();if(window.location.hash.startsWith("#/titles")&&t.region&&t.realm&&t.character){document.title=getTitle(t.character,"Titles");try{const e=await g(t.region,t.realm,t.character);if(!e){d("Failed to load titles data");return}f(e),w(e)}catch(e){console.error("Error loading titles:",e),d(e.message||"Failed to load titles")}}});
