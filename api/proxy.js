
// GLOBALS
let access_token = undefined
let access_token_expires = undefined
let access_token_expires_date = undefined

let client_id = '1781d9a5427e43e6ada3979925e1ce98'
let client_secret = TODO_REPLACE_SO_WE_DONT_CHECK_IN_SECRET
let auth = btoa(client_id + ":" + client_secret).toString('base64')

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let debug = "";

  // simple bailout for any url I don't like
  if (!request.url.match(/armorystats\.info\/(character|profile)\/.*/i)) {
    return new Response('Hello, this is the api server for simplearmory.com');
  }

  var now = new Date();

  // if we don't have a token or its expired, lets go get another one
  if (!access_token || now > access_token_expires_date) {
    console.log('fetching new token...')

    let headers = {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    const init = {
        method: 'POST',
        headers: headers,
        body: 'grant_type=client_credentials'
    }

    const response = await fetch('https://us.battle.net/oauth/token', init)
    const json = await response.json();

    var now = new Date();
    var tenMins = 10 * 60 * 1000;

    // store in global memory
    access_token = json.access_token;
    access_token_expires = now.getTime() + (json.expires_in * 1000) - tenMins;
    access_token_expires_date = new Date(access_token_expires);

    console.log(`got token: ${access_token} expires: ${access_token_expires} date: ${access_token_expires_date}`);
    debug = `FRESH: ${access_token_expires_date}`;
  } else {
    console.log(`using cached token: ${access_token} expires: ${access_token_expires} date: ${access_token_expires_date}`)
    debug = `EXISTING: ${access_token_expires_date}`;
  }

  let url_match = request.url.match(/(character|profile)\/(.+)\/(.+)\/(.+)/i);
  if (!url_match) {
    return new Response('Bad Request', { status: 400, statusText: 'Bad Request' });
  } 

  let region = url_match[2];
  let realm = url_match[3];
  let character = url_match[4];

  console.log(`region: ${region} realm: ${realm} character: ${character}`)

  let url;
  let api_response;

  if (url_match[1] === 'character') {
    url = `https://${region}.api.blizzard.com/wow/character/${realm}/${character}?fields=pets,mounts,achievements,guild,reputation`;
    api_response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + access_token } } )

    // Copy the response so that we can modify headers.
    api_response = new Response(api_response.body, api_response)
  } else if (url_match[1] === 'profile') {
    url = `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${character}?namespace=profile-${region}`;
    api_response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + access_token } } )
    let json_response = await api_response.json()

    let achievements_url = json_response.achievements.href
    let achievements_response = await fetch(achievements_url, { headers: { 'Authorization': 'Bearer ' + access_token } } )
    json_response.achievements = await achievements_response.json()
    api_response = new Response(JSON.stringify(json_response), api_response)
  }

  // Add CORS so we can call it from our site
  api_response.headers.set("Access-Control-Allow-Origin", "*")
  api_response.headers.set("X-Debug", debug)

  return api_response
}

