<script>
    import { getProfile } from '$api/profile'
    import { getRealms } from '$api/realms'
    import { getUrl } from '$util/url'
    import { onMount, onDestroy } from 'svelte'
    import { getTitle } from '$util/utils'
    import Select from '$components/ext/svelte-select/src/Select.svelte';

    $: realms = getRealms()
    
    let modal;
    let backdrop;
    let characterName;
    let isFocused = false;   
    let selectedValue;
    let characterNameInput;
    
    $: isValid = characterName != undefined && characterName != "" && selectedValue && selectedValue.slug != ""

    function handleSelect(event) {
        selectedValue = event.detail

        // focus the next input field when selection occurs
        if (characterNameInput) {
          characterNameInput.focus();
        }
    }
    const getSelectionLabel = (option) => option.name;
    const groupBy = (realm) => realm.region;

    onMount(async () => {
        showModal()

        // clear local storage
        console.log(`Clearing local storage of user...`);
			  localStorage.removeItem('region');
			  localStorage.removeItem('realm');
			  localStorage.removeItem('character');

        // Focus realm select on load
        window.setTimeout(() => {
            isFocused = true;
        }, 1000)
    });

    onDestroy(() => {
        // remove modal opened class
        document.body.classList.remove('modal-open')
    })

    // Wrote this function to remove the need to have all of the jquery and bootstrap javascript
    // this is the essence of what .modal() was doing after debugging it.  I don't use those
    // scripts anywhere else
    function showModal() {
        // tag body as opened
        document.body.classList.add('modal-open')

        // animate backdrop in
        backdrop.classList.add("in");
        backdrop.offsetWidth // force reflow

        // animate dialog in
        modal.style.display = "block";
        modal.offsetWidth // force reflow
        modal.classList.add("in");
    }
    
    const ok = (e) => {
        let region = selectedValue.region
        let realm = selectedValue.slug
        let char = characterName.toLowerCase() // Blizzard API doesn't place nice with chars like Ä at start of names
        
        if (characterName && characterName !== '') {
            let url = getUrl(region, realm, char)
            console.log(`Logging in as ${url}`)
            
            // NOTE:
            // Do a test fetch of the profile, if it works we can change hash
            // and it will pull it from the cache.  If it doesn't work, then
            // the profile api will change the hash to the error page for us.
            // 
            // We do this here instead of blindly redirecting to the url like
            //  before because we want to be able to click the back and have it work
            getProfile(region, realm, char).then( (p) => {
              if (p && (!p.status || p.status != 404)) {
                window.document.location.hash = url;
              }
            });
        } else {
            // NOTE: better validation?
            console.log("invalid form.  need better validation to user?")
        }       
    }

    const keydown = (e) => {
        // check if enter pressed, and simulate ok click
        if(e.which === 13 && isValid) {
            e.preventDefault();
            ok();
        }
    }

    const getOptionLabel = (option, filterText) => {
      function escapeRegexp(queryToEscape) {
        return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
      }

      return option.name.replace(new RegExp(escapeRegexp(filterText), 'gi'), '<b>$&</b>');
    };

</script>

<svelte:head>
	<title>{getTitle('', 'Login')}</title>
</svelte:head>

<div class="modal fade" bind:this={modal} id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document" style="z-index:1050">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title" id="myModalLabel">Enter realm and character</h3>
      </div>
      <div class="modal-body">
        <div class="input-group">
          <label for="mySelect" class="input-group-addon input-group-label">Realm</label>
          <div class="themed">
            {#await realms}
            <div class="form-control" style="font-style: italic;">Loading realms...</div>
            {:then value}
            <Select 
                on:select={handleSelect}
                id="mySelect"
                items={value}
                {isFocused}
                {groupBy} 
                {getOptionLabel}
                {getSelectionLabel}
                optionIdentifier="id"
                containerClasses="selRealm"
                isClearable={false} 
                showIndicator={true} 
                noOptionsMessage="No realms found"
                placeholder={"Enter a realm..."}></Select>
            {/await}           
          </div>
        </div>
        <br/>
        <div class="input-group">
          <label for="myCharName" class="input-group-addon input-group-label">Character</label>
          <input id="myCharName" type="text" class="form-control" bind:this={characterNameInput} bind:value={characterName} on:keydown={keydown} style="z-index:1">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" disabled={isValid === undefined || !isValid} on:click={ok}>Go</button>
      </div>
    </div>
  </div>
</div>

<div class="modal-backdrop fade" style="z-index:1040" bind:this={backdrop}  />
<style>

    /* Missing feature in select that they don't expose these */
    :global(.item.hover:not(.active)) {
        color:#fff;
    }
    :global(.selectContainer input:hover) {
        cursor: pointer !important;
    }
    :global(.selectContainer input:focus) {
        cursor: default !important;
        outline: 0;
        -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);
        box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);
    }
    :global(.selRealm) {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
        --padding:6px 12px !important; 
        box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
    }
    :global(.themed) {
        --groupTitleColor: #777;
        --groupTitleFontSize: 12px;
        --groupTitleFontWeight: normal;
        --groupTitlePadding:0px 20px;
        --groupItemPaddingLeft:20px;
        --inputPadding: 0px 12px;
        --inputColor: #333;
        --height:34px;
        --placeholderColor: #777;
        --border: 1px solid #ccc;
        --borderFocusColor: #66afe9;
        --indicatorTop: 6px;
        --listShadow: 0 6px 12px rgba(0,0,0,.175) ;
        --itemIsActiveBG:#3071a9;
        --itemIsActiveColor:#fff;
        --itemHoverBG:#428bca;

        --background: #fff;
        --listBackground: #fff;
    }

    /* 
      #303030
      #424242
      #212121
    */

    :global(body.dark .themed) {
        --background: #212121;
        --inputColor: #fff;
        --placeholderColor: #777;
        --border: 1px solid #0f0f0f;
        --borderFocusColor: #66afe9;
        --groupTitleColor: #777;
        --listBackground: #212121;
        --itemIsActiveBG:#030303;
        --itemIsActiveColor:#fff;
        --itemHoverBG:#424242;
        --indicatorColor: #fff;
        --listEmptyColor: #777;
        --itemColor:#fff;
        --borderHoverColor:#b2b8bf;

        --groupTitleFontSize: 12px;
        --groupTitleFontWeight: normal;
        --groupTitlePadding:0px 20px;
        --groupItemPaddingLeft:20px;
        --inputPadding: 0px 12px;
        --height:34px;
        --indicatorTop: 6px;
        --listShadow: 0 6px 12px rgba(0,0,0,.175) ;
    }
</style>