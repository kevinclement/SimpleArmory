import { getJsonDb } from '$api/_db'

let _cache;
export async function getRealms() {
    if (_cache) return _cache;
       
    // get us json
    console.log('Getting realms for US...');
    const usDB = await getJsonDb('servers.us');

    // get us json
    console.log('Getting realms for EU...');
    const euDB = await getJsonDb('servers.eu');

    // get kr json
    console.log('Getting realms for KR...');
    const krDB = await getJsonDb('servers.kr');

    // get tw json
    console.log('Getting realms for TW...');
    const twDB = await getJsonDb('servers.tw');

    // combine both realms into one list
    _cache = combineRealms(usDB, euDB, krDB, twDB);
    return _cache;
}

function combineRealms(us, eu, kr, tw) {
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
    
    // KR
    kr.realms.forEach((server) => {
        server.region = 'kr';
        server.id = 'kr-' + server.slug;
        allServers.push(server);
    })

    // TW
    tw.realms.forEach((server) => {
        server.region = 'tw';
        server.id = 'tw-' + server.slug;
        allServers.push(server);
    })

    return allServers
}
