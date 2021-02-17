import { getData } from '$api/_blizzard'
import Cache from '$api/_cache'

let _cache;
export async function getProfile(region, realm, character) {
    if (!_cache) {
        _cache = new Cache(region, realm, character);
    }
    else if (_cache.isValid(region, realm, character)) {
        return _cache.cache;
    }

    let profile = await getData(region, realm, character);

    // this means there was an error fetching character
    if (profile.status && profile.status === 404) {
        window.ga('send', 'event', 'LoginError', region + ':' + realm + ':' + character);
        console.log(`Server 404 getting profile.`);
        window.document.location.hash = `#/error/${region}/${realm}/${character}`
        return;
    }

    window.ga('send', 'event', 'Login', region + ':' + realm + ':' + character);

    profile.factionMapped = profile.faction.type === "ALLIANCE" ? 'A' : 'H'
    profile.classMapped = profile.character_class.id;
    profile.raceMapped = profile.race.id;

    _cache.update(
        region,
        realm,
        character,
        profile
    )
    return _cache.cache;
}

let _media;
export async function getProfileMedia(region, realm, character) {
    // if we don't have a character, return 1x1 white pixel
    if (!character || region === 'error') {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
    }

    if (!_media) {
        _media = new Cache(region, realm, character);
    }
    else if (_media.isValid(region, realm, character)) {
        return _media.cache;
    }

    // TODO: use race-id and gender-id as a fallback
    // ?alt=/shadow/avatar/{race-id}-{gender-id}.jpg
    // e.e. ?alt=/shadow/avatar/2-1.jpg

    let pMedia = await getData(region, realm, character, 'character-media');
    if (pMedia.status && pMedia.status === 404) {
        // update to a 1x1 empty
        _media.update(
            region,
            realm,
            character,
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
        )
        return _media.cache; 
    }
    
    var avatarFallback = '?alt=/shadow/avatar/1-1.jpg';
    let profileMedia = pMedia.avatar_url ?
        pMedia.avatar_url + avatarFallback : 
        pMedia.assets[0].value + avatarFallback;
    
    _media.update(
        region,
        realm,
        character,
        profileMedia
    )
    return _media.cache;
}
