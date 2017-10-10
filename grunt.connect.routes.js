// These are special routes I only use during development mode to aid in /admin sections
'use strict';

var bodyParser = require('body-parser');

exports.getMiddleware2 = function() {
    return [bodyParser.json({limit: '5mb'})];
};

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

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({criteria:'kevinc'}));
        }
      ];
}