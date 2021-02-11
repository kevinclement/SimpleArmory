export async function getData(region, realm, character, data='') {
    console.log(`Fetching data for ${region}.${realm}.${character} - ${data ? data : 'profile'}`);

    const res = await fetch(`https://armorystats.info/${region}/${realm}/${character}/${data}`);
    
    if (res.status === 200) {
        return await res.json();
    } else {
        return { status: 404, message: "Could not find character on armory."}
    }    
}