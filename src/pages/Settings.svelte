<script>
  import { region, realm, character } from "$stores/user";
  import { preferences } from "$stores/preferences";
  import { getWowheadUrl } from "$util/utils";
  import Category from "$components/Category/Category.svelte";

  let locales = [
    { txt: "EN", link: "wowhead.com" },
    { txt: "DE", link: "de.wowhead.com" },
    { txt: "ES", link: "es.wowhead.com" },
    { txt: "FR", link: "fr.wowhead.com" },
    { txt: "IT", link: "it.wowhead.com" },
    { txt: "PT", link: "pt.wowhead.com" },
    { txt: "RU", link: "ru.wowhead.com" },
    { txt: "KO", link: "ko.wowhead.com" },
    { txt: "CN", link: "cn.wowhead.com" },
  ];

  let exampleCategory = {
    name: "Example Category",
    subCategories: [
      {
        name: "Example Subcategory",
        items: [
          {
            collected: true,
            icon: "inv_infernalmount",
            link: "item=137574",
          },
          {
            collected: false,
            icon: "inv_infernalmount",
            link: "item=137574",
          },
        ],
      },
    ],
  };

  let useDarkMode = $state($preferences.theme === "light" ? false : true);

  const toggleTheme = (e) => {
    e.preventDefault();
    $preferences.theme = useDarkMode == true ? "dark" : "light";

    localStorage.setItem("darkTheme", $preferences.theme !== "light");
  };

  let useClassicSkin = $state($preferences.itemSkin === "classic" ? true : false);

  const toggleItemSkin = (e) => {
    e.preventDefault();
    $preferences.itemSkin = useClassicSkin == true ? "classic" : "new";

    localStorage.setItem("itemSkin", $preferences.itemSkin);
  };

  let showHidden = $state($preferences.showHidden == "hidden" ? false : true);

  const toggleShowHidden = (e) => {
		e.preventDefault();
		$preferences.showHidden = showHidden == true ? "shown" : "hidden";

    localStorage.setItem('showHiddenUpdated',Date.now());
		localStorage.setItem('showHidden', $preferences.showHidden);
	}

  let showFeats = $state($preferences.showHiddenFeat == "hidden" ? false : true);

  const toggleHiddenFeat = (e) => {
		e.preventDefault();
		$preferences.showHiddenFeat = showFeats == true ? "shown" : "hidden";

    localStorage.setItem('showHiddenUpdated',Date.now());
		localStorage.setItem('showHiddenFeat', $preferences.showHiddenFeat);
	}

  let showUnobtainedOnly = $state($preferences.showUnobtainedOnly == "false" ? false : true);

  const toggleShowUnobtained = (e) => {
    e.preventDefault();
		$preferences.showUnobtainedOnly = showUnobtainedOnly == true ? "true" : "false";

    localStorage.setItem('showHiddenUpdated',Date.now());
		localStorage.setItem('showUnobtainedOnly', $preferences.showUnobtainedOnly);
  }

  let showUpcoming = $state($preferences.showUpcoming == "false" ? false : true);

  const toggleShowUpcoming = (e) => {
    e.preventDefault();
		$preferences.showUpcoming = showUpcoming == true ? "true" : "false";

    localStorage.setItem('showHiddenUpdated',Date.now());
		localStorage.setItem('showUpcoming', $preferences.showUpcoming);
  }

  function setLocale(e, wowhead_url) {
    e.preventDefault();

    // if clicked on same locale already set ignore it
    if (getWowheadUrl() === wowhead_url) {
      return;
    }

    localStorage.setItem("wowhead_url", wowhead_url);
    window.location.reload();
  }

  let selectedLocale = $state(getWowheadUrl());
</script>

<div class="container">
  <div class="page-header">
    <h2>Settings</h2>
  </div>
  <div class="sect">
    <div>
      Signed in as
      <strong class="signin-name">
        {$character} @ {$realm}
        <span class="text-uppercase">({$region})</span>
      </strong>
      <a class="ml-2" href="/#/">Signout</a>
    </div>

    <div>
      <input type="checkbox" id="useDarkMode" bind:checked={useDarkMode} onchange={toggleTheme}><label for="useDarkMode">&nbsp Use Dark Mode</label>
    </div>

    <div>
      <input type="checkbox" id="useClassicSkin" bind:checked={useClassicSkin} onchange={toggleItemSkin}><label for="useClassicSkin">&nbsp Use Classic Appearance</label>
    </div>

    <div>
        <input type="checkbox" id="showHidden" bind:checked={showHidden} onchange={toggleShowHidden}><label for="showHidden">&nbsp Show Unobtainable Collectibles</label>
    </div>

    <div>
      <input type="checkbox" id="showFeats" bind:checked={showFeats} onchange={toggleHiddenFeat}><label for="showFeats">&nbsp Show Obtainable Feat of Strengths</label>
    </div>

    <div>
      <input type="checkbox" id="showUnobtainedOnly" bind:checked={showUnobtainedOnly} onchange={toggleShowUnobtained}><label for="showUnobtainedOnly">&nbsp Show Only Unobtained Collectibles</label>
    </div>

    <div>
      <input type="checkbox" id="showUpcoming" bind:checked={showUpcoming} onchange={toggleShowUpcoming}><label for="showUpcoming">&nbsp Show Upcoming Content</label>
    </div>

    <div>
      Locale
      <select
        name="locale"
        bind:value={selectedLocale}
        onchange={(e) => setLocale(e, selectedLocale)}
      >
        {#each locales as locale}
          <option value={locale.link}>
            {locale.txt}
          </option>
        {/each}
      </select>
    </div>
  </div>
  <div class="clear"></div>
  <Category category={exampleCategory}></Category>
</div>
