<script>
	import { region, realm, character, page, category } from '$stores/user'
	import { preferences } from '$stores/preferences'
	import { getProfileMedia } from '$api/profile'
	import { getUrl } from '$util/url'
	import { getWowheadUrl } from '$util/utils'
	import { onMount } from 'svelte'
	let menuCollapsed = true

	let menuItems = {
		'Achievements': {
			items: [ 
				{ txt: 'Character',          link: 'character'   },
				{ txt: 'Quests',             link: 'quests'      },
				{ txt: 'Exploration',        link: 'exploration' },
				{ txt: 'Player vs. Player',  link: 'pvp'         },
				{ txt: 'Dungeons & Raids',   link: 'dungeons'    },
				{ txt: 'Professions',        link: 'professions' },
				{ txt: 'Reputation',         link: 'reputation'  },
				{ txt: 'World Events',       link: 'events'      },
				{ txt: 'Pet Battles',        link: 'pets'        },
				{ txt: 'Collections',        link: 'collections' },
				{ txt: 'Expansion Features', link: 'expansions'  },
				{ txt: 'Legacy',             link: 'legacy'      },
				{ txt: 'Feats of Strength',  link: 'feats'       },
			],
			isOpen: false
		},
		'Collectable': {
			items: [ 
				{ txt: 'Mounts',      link: 'mounts'     },
				{ txt: 'Companions',  link: 'companions' },
				{ txt: 'Battle Pets', link: 'battlepets' },
				{ txt: 'Toys',        link: 'toys'       },
				{ txt: 'Heirlooms',	  link: 'heirlooms'  },
				{ txt: 'Titles',	  link: 'titles'     },
			],
			isOpen: false,
		},
		'Profile': {
			locales: [
				{ txt: 'EN',      link: 'wowhead.com'     },
				{ txt: 'DE',      link: 'de.wowhead.com'  },
				{ txt: 'ES',      link: 'es.wowhead.com'  },
				{ txt: 'FR',      link: 'fr.wowhead.com'  },
				{ txt: 'IT',	  link: 'it.wowhead.com'  },
				{ txt: 'PT',	  link: 'pt.wowhead.com'  },
				{ txt: 'RU',	  link: 'ru.wowhead.com'  },
				{ txt: 'KO',	  link: 'ko.wowhead.com'  },
				{ txt: 'CN',	  link: 'cn.wowhead.com'  },
			],
			isOpen: false
		}
	}

	$: isLoggedIn = $region && $region !== '' && $region !== 'error' &&
	    $realm && $realm !== '' && 
	    $character && $character !== ''
	$: armoryUrl = !$character ? '' : 'https://worldofwarcraft.com/character/' + $region + '/' + $realm + '/' + $character.toLowerCase();
	$: imgUrl = getProfileMedia($region, $realm, $character)

	const toggleCollapsed = (e) => {
		menuCollapsed = !menuCollapsed;
	};

	onMount(() => {
		// TODO: what behavior do we want for active when clicking and another one comes active
		//       I'm doing the same thing I did before, but not sure I'm totally sold on it

		window.document.addEventListener('click', onDocumentClick, false);
		window.document.addEventListener('keydown', onDocumentKeydown, false)
	})
	
	function onDocumentClick(e) {		
		// ignore clicks on the profile name as to allow text selection
		if (!e.target || 
			 e.target.className === "signin-label" ||
			 e.target.className === "signin-name" ||
			(e.target.className === "dropdown-menu" && e.target.getAttribute('aria-labelledby') === "profileDrop")) {
			 return;
		}

		// ignore clicks on the locale submenu
		if (e.target.id === "localeSubmenu") {
			return;
		}

		closeMenus();
	}

	function onDocumentKeydown(e) {
		// if escape was pressed, close all menus
		if (e.which === 27) {
			closeMenus();
		}
	}

	const toggleDropDown = (e,menuItem) => {
		// prevent anchor navigation and further propagation
		e.preventDefault();
		e.stopPropagation()

		let alreadyOpened = menuItem.isOpen;

		closeMenus();

		// toggle the one we want
		menuItem.isOpen = !alreadyOpened;

		// need to hint svelte that we had a change
		menuItems = menuItems      
	}

	function closeMenus() {
		// close any item currently opened
		Object.keys(menuItems).forEach((mi) => {
			menuItems[mi].isOpen = false;
		})

		// need to hint svelte that we had a change
		menuItems = menuItems
	}

	const toggleTheme = (e) => {
		e.preventDefault()
		$preferences.theme = $preferences.theme === 'light' ? 'dark' : 'light'

		localStorage.setItem('darkTheme', $preferences.theme !== 'light');
	};

    const NavbarClicked = (e) => {
		// if an anchor was clicked, collapse the overflow menu
		if (e.target.tagName === "A") {
			menuCollapsed = true;
		}
	}

	function setLocale(e, wowhead_url) {
		e.preventDefault()

		// if clicked on same locale already set ignore it
		if (getWowheadUrl() === wowhead_url) {
			return;
		}

		localStorage.setItem('wowhead_url', wowhead_url);
		window.location.reload();
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<nav class="navbar navbar-default navbar-fixed-top" on:click={NavbarClicked}>
	<div class="container">
		<div class="navbar-header">
			{#if isLoggedIn }
				<button type="button" class="navbar-toggle" on:click={toggleCollapsed}>
					<span class="sr-only">Toggle navigation</span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
			{/if}		
			<a class="navbar-brand" href="/#/" aria-label="Login"><span id="logo"></span></a>
		</div>

		<div class="navbar-collapse" class:collapse="{menuCollapsed}">
			{#if isLoggedIn }
			<ul class="nav navbar-nav">
				<li class:active="{$page === undefined}"><a href="{getUrl($region, $realm, $character, '')}">Overview</a></li>
				
				<li class:active="{$page === 'achievements'}" class="dropdown" class:open={menuItems.Achievements.isOpen} >
					<a id="achDrop" href="#/" on:click="{(e) => toggleDropDown(e,menuItems.Achievements)}" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Achievements
						<b class="caret"></b>
					</a>
					<ul class="dropdown-menu" aria-labelledby="achDrop">
						{#each menuItems.Achievements.items as item} 
							<li class:active="{$page === 'achievements' && $category === item.link}"><a href="{getUrl($region, $realm, $character, 'achievements/' + item.link)}">{item.txt}</a></li>	
						{/each}
					</ul>
				</li>

				<li class:active="{$page === 'collectable'}" class="dropdown" class:open={menuItems.Collectable.isOpen}>
					<a id="collectDrop" href="#/" on:click="{(e) => toggleDropDown(e,menuItems.Collectable)}"  class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Collectable
						<b class="caret"></b>
					</a>
					<ul class="dropdown-menu" aria-labelledby="collectDrop">
					  {#each menuItems.Collectable.items as item} 
					    <li class:active="{$page === 'collectable' && $category === item.link}"><a href="{getUrl($region, $realm, $character, 'collectable/' + item.link)}">{item.txt}</a></li>	
					  {/each}
					</ul>
				</li>

				<li class:active="{$page === 'calendar'}"><a href="{getUrl($region, $realm, $character, 'calendar')}">Calendar</a></li>
				<li class:active="{$page === 'reputation'}"><a href="{getUrl($region, $realm, $character, 'reputation')}">Reputation</a></li>
			</ul>
			<ul class="nav navbar-nav navbar-right">
				<li class="dropdown" class:open={menuItems.Profile.isOpen}>
					<a id="profileDrop" href="#/" aria-label="Profile" on:click="{(e) => toggleDropDown(e,menuItems.Profile)}" class="navbar-char-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
						{#await imgUrl then value}
						<img width="32" height="32" class="navbar-char-image" src="{value}" alt="Profile"/>
						{/await}
						<b class="caret"></b>
					</a>

					<ul class="dropdown-menu" aria-labelledby="profileDrop">
					  <li class="signin-label"><span>Signed in as</span></li>
					  <li><strong class="signin-name">{$character} @ {$realm}</strong></li>
					  <li role="separator" class="divider"></li> 
					  <li><a href="/#/">Signout</a></li>
					  <li role="separator" class="divider"></li>
					  <li><a href="{armoryUrl}" target="_blank">Armory profile</a></li>
					  <li><a href="#/" on:click={toggleTheme} >Use {$preferences.theme === 'light' ? 'Dark' : 'Light'} Theme</a></li>
					  <li>
						<a id="localeSubmenu" class="dropdown-item" href="#/" on:click={(e) => e.preventDefault()}>
							Locale
							<b class="caret-right"></b>
						</a>
						<ul class="dropdown-menu dropdown-submenu">
						  {#each menuItems.Profile.locales as locale}
							<li class:active="{getWowheadUrl() === locale.link}"><a class="dropdown-item" href="#/" on:click={(e) => setLocale(e, locale.link)}>{locale.txt}</a></li>
						  {/each}
						</ul>
					  </li>
					  <li><a href="{getUrl($region, $realm, $character, 'settings')}">Settings</a></li>
					  <li role="separator" class="divider"></li>
					  <li><a href="https://github.com/kevinclement/SimpleArmory/issues" target="_blank">Report Bug</a></li>
					</ul>
				</li>
			</ul>
			{/if}		
		</div>
	</div>

</nav>
