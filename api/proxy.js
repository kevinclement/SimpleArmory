
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

  let url_match = request.url.match(/https?:\/\/.*\.(dev|info)\/(.*?)\/(.*?)\/(.*?)\/(.*)/i);
  if (!url_match) {
    return new Response('Bad Request', { status: 400, statusText: 'Bad Request' });
  }

  let region = url_match[2];
  let realm = url_match[3];
  let character = url_match[4];
  let site = url_match[5];
  if (site) {
    site = `/${site}`
  }

  console.log(`region: ${region} realm: ${realm} character: ${character} site: ${site}`)
    
  let url = `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${character}${site}?namespace=profile-${region}`;
  let resp = await fetch(url, { headers: { 'Authorization': 'Bearer ' + access_token } } )

  let api_response = new Response(resp.body, resp);

  // Add CORS so we can call it from our site
  api_response.headers.set("Access-Control-Allow-Origin", "*")
  api_response.headers.set("X-Debug", debug)

  return api_response
}

