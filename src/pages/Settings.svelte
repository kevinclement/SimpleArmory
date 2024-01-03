<script>
  import { region, realm, character, page, category } from "$stores/user";
  import { preferences } from "$stores/preferences";
  import { getWowheadUrl } from "$util/utils";

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

  const toggleTheme = (e) => {
    e.preventDefault();
    $preferences.theme = $preferences.theme === "light" ? "dark" : "light";

    localStorage.setItem("darkTheme", $preferences.theme !== "light");
  };

  function setLocale(e, wowhead_url) {
    e.preventDefault();

    // if clicked on same locale already set ignore it
    if (getWowheadUrl() === wowhead_url) {
      return;
    }

    localStorage.setItem("wowhead_url", wowhead_url);
    window.location.reload();
  }

  let selectedLocale = getWowheadUrl();
</script>

<div class="container">
  <div class="page-header">
    <h2>Settings</h2>
  </div>

  <div>
    Signed in as
    <strong class="signin-name">
      {$character} @ {$realm}
      <span class="text-uppercase">({$region})</span>
    </strong>
    <a class="ml-2" href="/#/">Signout</a>
  </div>

  <div>
    <a href="#/" on:click={toggleTheme}
      >Use {$preferences.theme === "light" ? "Dark" : "Light"} Theme</a
    >
  </div>

  <div>
    Locale
    <select
      name="locale"
      bind:value={selectedLocale}
      on:change={(e) => setLocale(e, selectedLocale)}
    >
      {#each locales as locale}
        <option value={locale.link}>
          {locale.txt}
        </option>
      {/each}
    </select>
  </div>
</div>
