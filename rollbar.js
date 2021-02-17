// ## Rollbar.js ##########################################
//
//   This script handles marking a deployment in rollbar
//   so I can track when errors get introduced
// 
// ########################################################
import https from 'https';

// This is stored in netlify variable, and is set in env during build
let token = process.env.ROLLBAR_ACCESS_TOKEN

// This gets set during the build by netlify
let commitRef = process.env.COMMIT_REF

if (!token) {
    console.log("ERROR: no access token specified in env.");
    process.exit(1);
}

if (!commitRef) {
    console.log("ERROR: no commit ref in env.");
    process.exit(1);
}

console.log(`Marking deployment ${commitRef} in Rollbar...`);

// Full json 
// {
//   "environment": "string",
//   "revision": "string",
//   "rollbar_username": "string",
//   "local_username": "string",
//   "comment": "string",
//   "status": "string"
// }
const data = JSON.stringify({
    "environment": process.env.CONTEXT,
    "revision": commitRef,
    "local_username": "netlify"
})

// https://api.rollbar.com/api/1/deploy
const options = {
  hostname: 'api.rollbar.com',
  port: 443,
  path: '/api/1/deploy',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'X-Rollbar-Access-Token': token
  }
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end()