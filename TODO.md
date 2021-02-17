[ ] Investigate Rollbar breaks:
  [ ] ie11 crashes
    [ ] wow, people use this
  
  [ ] Uncaught SyntaxError: Unexpected token =>
    [ ] Samsung Internet 12.1
  [ ] Script Error
    [ ] Samsung Internet 12.1
  
  [ ] Attempt to use history.replaceState() more than 100 times per 30 seconds
    [ ] ios 14

[ ] armoryinfo returns all locals, might want to trim that to save size?

[ ] seems like I lost events in ga

[ ] take a look at percy.io

[ ] use race-id and gender-id as a fallback for char image
[ ] prob need to do another update for all the wowhead hover states
[ ] see how expensive removing unused bootstrap css

## Punted for now #######
[ ] split out css overrides so they sit next to components/views
[ ] Update bootstrap version

## Finished #######
[x] services
  [x] profile
  [x] achievements
  [x] mount
  [x] realms
  [x] factions
  [x] companions
  [x] battle pets
  [x] toys
  [x] planner
[x] views
  [x] header
    [x] fix blink when navigating
  [x] login
    [x] verification/disable ok if not valid server
    [x] servers
      [x] test delayed json load and rendering
      [x] figure out container style vs container class
      [x] should autofocus on page load
      [x] focus border on input
      [x] focus color
      [x] no options - change text to something more appropriate
      [x] padding
      [x] chevron
      [x] typing adjustments?
      [x] padding for once selected
  [x] achievements
  [x] overview
  [x] mount
  [x] battle pets
  [x] companions
  [x] calendar
  [x] toys
  [x] reps
  [x] planner
    [x] ability to deep link
    [x] special view for 0 left - success kid
[x] don't change all user params when not needed
  [x] img profile blinks when I navigate around site
  [x] had to switch from obj in store to individual props, worked way better
[x] root should route to login or #/
[x] overview css got messed up
[x] overview only animates global and not individual
[x] hookup wowhead.js
[x] title proper
[x] implement dark/light theme work based on preferences
  [x] persist theme
  [x] test all pages and compare
  [x] see app.html and localStorage
  [x] fix select control to have overrides like the rest
[x] BUG: if I go to login page, i get back screen that is black, if I then
    change url to a page that doesn't have login, screen stays black
    [x] fixed when I switched to not using modal scripts
[x] getrid of bootstrap runtime
  [x] any easy way to not have to load jquery and bootstrap to pop open this?
  [x] currently needed for modal, not sure what else
[x] fix <main></main> in body, did I do this wrong?
[x] logox2 wired up?
[x] still need other static images?
[x] move _utils to other utils class
[x] move majors stuff to a Pages folder
[x] rename _settings to settings
[x] move nav to components
[x] move planner to components?
[x] rename global2.css to global.css
[x] $error.svelte - good with the one that it shipped with
[x] better way to do navigation menus using for-loop?
[x] cleanup menu collapse
[x] add google analytics
[x] add api caching
[x] Placeholder in select while loading so its not totally collapsed  
  [x] maybe just default size the box, or total fixed size on the box
[x] Disable next button in calendar when at end
[x] Disable previous in calendar when at beginning
[x] search for 'ng-'
[x] search for TODO
[x] move getImageSrc to common
[\] 1x1 image to common
[x] add event listener for prefers-color-scheme change
[x] clear cache when user changes - !doh
[x] handle profile error from bad character
  [x] what should the ui be?
  [x] handle profile
  [x] handle profile media
  [x] add analytics
[x] check: when there is a character error, does the url listener get busted so it can't be fixed?
[x] TODO: need to test neutral race stuff
[x] get it building in production mode
  [x] fix Svelte-Select include problem and put it back
    [x] hack, had to copy it into source tree
  [x] put back $error
  [x] fix path includes
  [x] build it
    [x] fix build error: Cannot read property 'id' of null
  [x] update to new kit?
  [x] adapt it
  [x] deploy sample
[x] BUG: change achievement category, it doesn't update the boxes
[x] BUG: planner has an error in console
[x] BUG: toys save didn't seem to work
  [x] refresh did though, probably cache issue
[x] double check meta tags used versus old  
[x] test on mobile click handling of menu items
  [x] seems to be working
[x] how will we handle cache busting?
  [x] working for the most part, but need to move global styles
      into a import so it is calculated in a hash
  [x] not needed, looked into it further, netlify is doing etag expiring
      so that works.  
[x] handle special case where user gets an error, then just changes the url
    but it still contains, /error/ at the beginning and they don't notice
[x] hitting the back button will also send you back and then back to the error page, ugh
[x] add spinner for loading to stuff, which was a longtime ask
[x] NIT: getting two slashes during login /#//
[\] service worker for resources to make it faster
  [x] punted, didn't want the complication
[x] PWA
  [x] manifest.json
  [x] full icon set
  [x] beforeinstallprompt
  [x] lighthouse checks
  [x] colors
  [\] shortcuts to subpages
  see - https://github.com/tretapey/svelte-pwa
[x] fix lighthouse accessibility failures 
  [x] login
  [x] page
[x] test all pages for missing icons
  [x] need override url to turn all images on
    [x] ?showall=true#/
  [x] achievements
  [x] mounts
  [x] pets
  [x] battle
  [x] toys
  [x] fix missing
    [x] http://wow.zamimg.com/images/wow/icons/medium/inv_aetherserpentmount.jpg
    [x] http://wow.zamimg.com/images/wow/icons/medium/inv_hearthstone_aether.jpg
[x] test all pages for perf
  [x] just do lighthouse scores comparing both for 
    [x] desktop - login and mounts
      time to interactive: 1.8s -> .7s
      first contentful paint: .7s -> .4s
    [x] mobile - login and mounts
      time to interactive: 7.3s -> 2.5s
  [x] downloads:
    login old: 17 requests, 848 kB, finish: 548ms, Load: 551ms
    login new: 17 requests, 578 kb, finish: 457ms, Load: 366ms
    mounts old: 281 requests, 1.7MB, Finish: 2.12s, Load: 374 ms
    mounts new: 279 requests, 1.3MB, Finish: 1.93s, Load: 269 ms
[\] PERF: Add to wowhead links, rel="noopener"
[x] BUG: capitalize character and server in profile dropdown
[x] PERF: Set an explicit width and height on image elements to reduce layout shifts and improve CLS
  [x] Profile
  [x] Achieve/Mounts/Other
[x] Browser automation?
    [x] test visual diff from older site
    [x] compare perf to older site
    [x] compare asset size to other site
[x] FEATURE: load user from localstorage?
  [x] switch user/logout in profile dropdown?
  [x] when navigate to login screen, clear local storage
[x] BUG: PWA: some weirdness when set to darkmode
  [x] seems to be working fine now that its all dialed in
[x] Login Enhancements
  [x] any easy way to implement highlight like old model?
  [\] can I implement a better filter to match what I had?
  [x] onEnter should focus next input
  [x] doesn't auto select first result
    [x] this is a bug in the control where if first item is a group header it doesn't work properly
  [x] BUG: can't reselect same selected item
  [x] tab doesn't seem to work on safari
  [x] width fix
[x] Prep to check-in
  [x] publish netlify on new branch
    https://601904761d3a3d00071470d0--simplearmory.netlify.app/#/
  [x] send out PR and request for feedback
    https://github.com/kevinclement/SimpleArmory/pull/348
  [x] use branch in main git
  [x] copy over data scripts
  [x] copy and update Readme.md
  [x] toys.test.txt - keep or move?
    [x] move to test
  [x] move perf to test folder
[x] URL encoding error in the profile: "Signed in as Ana%C3%Bfza @ Archimonde"
[x] selecting text in the profile modal closes the window
[\] There seems to be a weird race condition in the realm selection, when I type "arc really fast it sometimes selects Aegwynn.
  [x] not repro, tried bunch of browsers and slowdown
[x] BUG: LOGIN: type 'ARC<ENTER><TAB>' very fast.  Improperly selects 'Aegwynn'
[x] BUG: LOGIN: type 'ARC<TAB><ENTER>' very fast, throws a script error
[x] BUG: LOGIN: "enter" doesn't submit the character selection form?
[x] Seeing multiple loglines when navigating
   [x] Updating local storage user to us.proudmoore.marko...
   [x] investigate if expected or doing too much work
[x] update error page to include blurb about privacy
[x] Cannot read property forEach of undefined/null expression