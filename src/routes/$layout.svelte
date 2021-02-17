<script>
	import { region, realm, character, page, category, subcat } from '$stores/user.js';
	import { preferences } from '$stores/preferences'
	import { navigate } from '$util/url'
	import { getDarkMode } from '$util/utils'

	import Achievements from '$pages/Achievements.svelte';
	import Overview from '$pages/Overview.svelte';
	import Mounts from '$pages/Mounts.svelte';
	import Companions from '$pages/Companions.svelte';
	import Toys from '$pages/Toys.svelte';
	import BattlePets from '$pages/BattlePets.svelte';
	import Calendar from '$pages/Calendar.svelte';
	import Reputations from '$pages/Reputations.svelte';
	import Nav from '$components/Nav.svelte';
	import Login from '$pages/Login.svelte';
	import Error from '$pages/Error.svelte';
	
	import { onMount } from 'svelte'

	let _errorCount = 0;
    onMount(() => {
		preferences.subscribe(value => {
			let isDark = value.theme === 'dark';
			if (isDark) {
				document.body.classList.add('dark')
			} else {
				document.body.classList.remove('dark')
			}
		});

        getCharInfoFromURL();
		window.addEventListener('hashchange', getCharInfoFromURL, false);
		
		// if this is root route, need to navigate it to login route
		if (window.document.location.hash === "") {
			// check if we have info in localstorage, if we do, use that
			// otherwise redirect to login
			let ls_region = localStorage.getItem('region');
			let ls_realm = localStorage.getItem('realm');
			let ls_character = localStorage.getItem('character');

			if (ls_region && ls_realm && ls_character) {
				navigate("", ls_region, ls_realm, ls_character);
			} else {
				navigate("");
			}
		}

		// dark mode detection
		getDarkMode(window, (isDark) => {
			$preferences.theme = isDark ? 'dark' : 'light'
		})
	})

    function getCharInfoFromURL() {
		let [,loc_region,loc_realm,loc_character,loc_page,loc_category,loc_subcat] = decodeURIComponent(window.document.location.hash).slice(1).split("/");

		// NOTE: Might be totally overkill
		//
		// This is a special case where the user got an error
		// then looked at the url and saw the wrong name, and updated it.
		// However, since it still has /error it wont fix it.
		if (loc_region === 'error') {
			if (_errorCount === 1) {
				console.log(`Handling special case url change.  Trying to redirect.`);
				_errorCount = 0;
				navigate("", loc_realm, loc_character, loc_page);
			} else {
				_errorCount++;
			}
		} else {
			_errorCount = 0;
		}

		// update the store properties to reflect 'login'
		region.set(loc_region);
		realm.set(loc_realm);
		character.set(loc_character);
		page.set(loc_page);
		category.set(loc_category);
		subcat.set(loc_subcat);

		if (Rollbar && loc_region && loc_realm && loc_character) {
			Rollbar.configure({
				payload: {
					person: {
						id: `${loc_region}_${loc_realm}_${loc_character}`,
						email: `${loc_character}@${loc_realm}.${loc_region}`
					}
				}
			});
		}

		// update local storage with current user
		if (loc_region && localStorage.getItem('region') != loc_region &&
		    loc_realm && localStorage.getItem('realm') != loc_realm && 
			loc_character && localStorage.getItem('character') != loc_character) {
			console.log(`Updating local storage user to ${loc_region}.${loc_realm}.${loc_character}...`);
			localStorage.setItem('region', loc_region);
			localStorage.setItem('realm', loc_realm);
			localStorage.setItem('character', loc_character);
		}		
	}
</script>

<!-- 
    {@debug $character}
-->

<Nav></Nav>

<div>

	{#if $region !== undefined}
		<!-- error page -->
		{#if $region === 'error'}
			<!-- Little funky here, but with error in route, it offsets the other variables -->
			<Error region={$realm} realm={$character} character={$page} />
		{:else if $realm !== undefined && $character !== undefined}
			<!-- overview -->
			{#if ($page === undefined || $page === '') && $category == undefined} 
			<Overview/>

			<!-- achievements/quests -->
			{:else if $page === 'achievements'}
			<Achievements/>

			<!-- collectable/mounts -->
			{:else if $page === 'collectable' && ($category === 'mounts')}
			<Mounts planner={$subcat === 'planner'}/>

			<!-- collectable/companions -->
			{:else if $page === 'collectable' && $category === 'companions'} 
			<Companions/>

			<!-- collectable/battlepets -->
			{:else if $page === 'collectable' && $category === 'battlepets'} 
			<BattlePets/>

			<!-- collectable/toys -->
			{:else if $page === 'collectable' && $category === 'toys'} 
			<Toys/>

			<!-- calendar -->
			{:else if $page === 'calendar'}
			<Calendar/>

			<!-- reputations -->
			{:else if $page === 'reputation'}
			<Reputations></Reputations>

			{/if}
		{:else}
			<Login></Login>
		{/if}
	{/if}

	<slot />
</div>
