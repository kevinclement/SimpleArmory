<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getReputations } from '$api/reputations'
    import { getTitle } from '$util/utils'
    import ReputationRow from '$components/ReputationRow.svelte'
    import Loading from '$components/Loading.svelte';

    let categories = null;
    let allFactions = [];
    let todoIds = [];
    let todosObj = {};
    let loading = true;

    onMount(async () => {
        window.ga('send', 'pageview', 'Reputation');
        const data = await getReputations($region, $realm, $character);
        categories = data.categories;
        allFactions = categories ? categories.flatMap(cat => cat.factions) : [];
        todosObj = getTodosReps();
        todoIds = getAllTodoIds(todosObj);
        loading = false;
    });

    $: todoFactions = allFactions.filter(f => todoIds.includes(f.id));

    function getStorageKey() {
        return `simpleArmoryReputationsTodo_${$region}_${$realm}_${$character}`;
    }

    function getTodosReps() {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
        } catch {}
        return saved;
    }

    function getAllTodoIds(todosObj) {
        return Object.values(todosObj).flat();
    }

    function saveTodosReps(todos) {
        localStorage.setItem(getStorageKey(), JSON.stringify(todos));
    }

    function addTodoRep(cat, factionId) {
        let todos = { ...todosObj };
        if (!todos[cat]) {
            todos[cat] = [];
        }
        if (!todos[cat].includes(factionId)) {
            todos[cat] = [...todos[cat], factionId];
            todosObj = { ...todos, [cat]: todos[cat] };
            saveTodosReps(todosObj);
            todoIds = getAllTodoIds(todosObj);
        }
    }

    function removeTodoRep(factionId) {
        let todos = { ...todosObj };
        let changed = false;
        for (const cat in todos) {
            if (todos[cat].includes(factionId)) {
                todos[cat] = todos[cat].filter(id => id !== factionId);
                if (todos[cat].length === 0) {
                    delete todos[cat];
                }
                changed = true;
            }
        }
        if (changed) {
            todosObj = { ...todos };
            saveTodosReps(todosObj);
            todoIds = getAllTodoIds(todosObj);
        }
    }
</script>

<svelte:head>
    <title>{getTitle($character, 'Reputation')}</title>
</svelte:head>



<div class="container rep">
    <div class="page-header">
      <h2>Reputation</h2>
    </div>

    {#if loading}
        <Loading/>
    {:else if categories}
        {#if Object.keys(todosObj).length > 0}
            <h2 style="margin-bottom:10px;">Todo</h2>
            {#each Object.entries(todosObj) as [catName, ids]}
                {#if ids.length > 0}
                    <h3 style="margin:18px 0 12px 0;">{catName}</h3>
                    <ul>
                        {#each ids as factionId}
                            {#if allFactions.find(f => f.id === factionId)}
                                <li style="display:flex;align-items:center;gap:8px;">
                                    <ReputationRow faction={allFactions.find(f => f.id === factionId)} inTodo={true} on:removeTodo={() => removeTodoRep(factionId)}/>
                                </li>
                            {/if}
                        {/each}
                    </ul>
                {/if}
            {/each}
            <hr class="rep-separator"/>
        {/if}

        {#each categories as category}
            <h3>{ category.name }</h3>
            <ul>
                {#each category.factions as faction}
                    {#if !todoFactions.find(f => f.id === faction.id)}
                        <li>
                            <ReputationRow faction={faction} on:addTodo={() => addTodoRep(category.name, faction.id)}/>
                        </li>
                    {/if}
                {/each}
            </ul>
        {/each}
    {/if}
</div>
