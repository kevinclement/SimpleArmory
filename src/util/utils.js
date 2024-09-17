export function percent(n, d) {
    return Math.ceil((n / d) * 100);
};

export function percentFormat(n, d) {
    if (!n || !d) {
        return '';
    }

    var perc = percent(n, d);

    // if the percentage is low enough, don't print the numbers, just use the percentage
    if (perc < 18) {
        return perc + '%';
    }

    return `${n} / ${d} (${perc}%)`;
}

export function getTitle(character, page) {
    
    if (character && character !== "") {
        // uppercase first character
        character = character.charAt(0).toUpperCase() + character.slice(1);
        page = page ? " - " + page  : ""
    }
        
    return `${character}${page} • Simple Armory`
}

export function getImageSrc(item, renderIcon) {
    renderIcon = renderIcon || item.collected || item.completed;
   
    // check for URL override to showall images.  This allows for me to 
    // test all when an update occurs to see if any of the icons are configured wrong
    // URL will be /?showall=true#/
    if (location && location.search != "") {
        let params = new URLSearchParams(location.search);
        if (params.get("showall") === "true") {
            renderIcon = true;
        }        
    }
    
    if (renderIcon) {
        // wowhead img
        let url = '//wow.zamimg.com/images/wow/icons/medium/' + item.icon.toLowerCase() + '.jpg'
        
        // support for local hosting img for when wowhead hasn't fully exported assets
        if (item.iconLocal && item.iconLocal != "") {
            url = '/images/' + item.iconLocal.toLowerCase() + '.png'
        } 
        
        return url;
    } else {
        // TODO: move to settings
        // 1x1 gif
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    }
}

export function getDarkMode(window, cb) {
    let darkTheme = localStorage.getItem('darkTheme');
    if (darkTheme) {
        // callback results
        cb(darkTheme === 'true');
    } else {
        // if they haven't stored a preference, then lets check system preference
        const mediaQueryString = '(prefers-color-scheme: dark)';
        const mediaQueryList = window.matchMedia && window.matchMedia(mediaQueryString);
        
        if (mediaQueryList) {
            // callback results
            cb(mediaQueryList.matches);

            // go the extra mile and hookup listener to detect if they change their pref
            mediaQueryList.addListener((e) => {
                cb(mediaQueryList.matches)
            });
        }
    }
}

export function getShowHiddenSetting() {
    return(localStorage.getItem("showHidden"));
}

export function getShowHiddenFeatSetting() {
    return(localStorage.getItem("showHiddenFeat"));
}

export function getShowHiddenUpdated() {
    return(localStorage.getItem("showHiddenUpdated"));
}

export function getWowheadUrl() {
    if (typeof window !== 'undefined') {
        if(localStorage.getItem('wowhead_url'))
            return localStorage.getItem('wowhead_url');
    }
    return 'wowhead.com';
}
