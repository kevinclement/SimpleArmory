import { getData } from '$api/_blizzard'
import { getProfile } from '$api/profile'
import { getJsonDb } from '$api/_db'
import { parseCollectablesObject } from '$api/_collectables'
import Cache from '$api/_cache'

let _cache;
export async function getMounts(region, realm, character) {   
    if (!_cache) {
        _cache = new Cache(region, realm, character);
    }
    else if (_cache.isValid(region, realm, character)) {
        return _cache.cache;
    }

    console.log(`Parsing mounts.json...`)

    // get profile
    const profile = await getProfile(region, realm, character);
    if (!profile || (profile.status && profile.status === 404)) {
        return undefined;
    }

    // get json
    const db = await getJsonDb('mounts');
    
    // get character collected
    const collected = await getData(region, realm, character, 'collections/mounts');
    if (!collected || (collected.status && collected.status === 404)) {
        return undefined;
    }
    
    // combine
    _cache.update(
        region,
        realm,
        character,
        parseCollectablesObject(db, profile, collected, 'mounts', 'mount')
    )
    return _cache.cache;
}