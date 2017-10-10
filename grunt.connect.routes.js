// These are special routes I only use during development mode to aid in /admin sections
'use strict';

var bodyParser = require('body-parser');
var request = require('request');
var cachedWowheadRequest;

exports.getMiddleware = function() {
    return [
      bodyParser.json({limit: '5mb'}), // will parse json data out of the body
      function(req, res, next) {

        // NOTE: special contract with me and admin section of site that allows
        // me to post json to /save/<file>/, and I'll write it to <file>.json on disk
        var saveUrl = req.url.indexOf('/save/') === 0;
        if (!saveUrl) return next();

        var fileToSaveTo = 'app/data/' + req.url.replace('/save/', '') + '.json';
        require('fs').writeFile(
          fileToSaveTo,
          JSON.stringify(req.body, null, '  '));

        res.end('Uploaded to ' + fileToSaveTo);
      },
      function(req, res, next) {

        // This URL allows me to query wowhead for criteria they use
        // I can't query it from browser because of CORS, so I send a request
        // to localhost and then I can query from node to the wowhead api
        var criteriaUrl = req.url.indexOf('/criteria/') === 0;
        if (!criteriaUrl) return next();

        // No need to query from wowhead for every refresh in admin session, restart dev env for a refresh
        if (cachedWowheadRequest) {
          res.setHeader('Content-Type', 'application/json');
          res.end(cachedWowheadRequest);
        } else {
          request('http://www.wowhead.com/data=achievements', function (error, response, body) {
            if (!error && response.statusCode == 200) {

                // criteria mapping
                var myRegexp = /g_achievement_criteria = (.*);/g;
                var match = myRegexp.exec(body);

                // You should end up with a json like
                // { 
                //   "achievementId" : 
                //   {
                //      "wowheadId": 
                //        [
                //          [
                //            count,
                //            criteriaId
                //          ]
                //        ]
                //   }
                // }
                cachedWowheadRequest = match[1];
                res.setHeader('Content-Type', 'application/json');
                res.end(match[1]);
            }
            else {
                console.log("Trouble getting javascript from wowhead. code: " + response.statusCode);
                console.log("  " + response.body);

                res.end(response.statusCode);
            }
          });
        }
      }
    ];
}