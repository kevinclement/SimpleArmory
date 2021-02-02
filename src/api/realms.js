import { getJsonDb } from '$api/_db'
import Cache from '$api/_cache'

let _cache;
export async function getRealms() {
    if (_cache) return _cache;
       
    // get us json
    console.log('Getting realms for US...');
    const usDB = await getJsonDb('servers.us');

    // get us json
    console.log('Getting realms for EU...');
    const euDB = await getJsonDb('servers.eu');

    // combine both realms into one list
    _cache = combineRealms(usDB, euDB);
    return _cache;
}

function combineRealms(us, eu) {
    let allServers = [];

    // US
    us.realms.forEach((server) => {
        server.region = 'us';
        server.id = 'us-' + server.slug;
        allServers.push(server);
    })

    // EU
    eu.realms.forEach((server) => {
        server.region = 'eu';
        server.id = 'eu-' + server.slug;
        allServers.push(server);
    })

    return allServers
}