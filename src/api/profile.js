import { region, realm, character, avatar, page, category, subcat } from '$stores/user.js';
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
    profile.genderMapped = profile.gender.type === "MALE" ? 'M' : 'F'

    // set the character media url based on profile information
    avatar.set(getAvatar(region, realm, profile.id));

    _cache.update(
        region,
        realm,
        character,
        profile
    )
    return _cache.cache;
}

function getAvatar(region, realm, characterId) {
    // This is some secret sauce that isn't really documented anywhere.  Found on discord support channel.
    let charCat = characterId % 256;

    return(`https://render.worldofwarcraft.com/${region}/character/${realm}/${charCat}/${characterId}-avatar.jpg`)
}