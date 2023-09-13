function getWowheadUrl(){
    if (typeof window !== 'undefined') {
        if(localStorage.getItem('wowhead_url'))
            return localStorage.getItem('wowhead_url');
    }
    return 'wowhead.com';
}

export default {
    WowHeadUrl: getWowheadUrl(),
    anchorTarget: '_blank',  // in case we want this to be a setting for _self
    fakeCompletionTime: 312,
    debug: false,
}
