import { getWowheadUrl } from '$util/utils'  

export default {
    WowHeadUrl: getWowheadUrl(),
    anchorTarget: '_blank',  // in case we want this to be a setting for _self
    fakeCompletionTime: 312,
    debug: false,
}
