/* Heavily enspired by Raptorize 
   www.ZURB.com/playground
*/
'use strict';

(function() {
    
    angular
        .module('simpleArmoryApp')
        .factory('KonamiService', KonamiService);

    function KonamiService($document, $animate) {
      
      // Check for audio support
      var a = document.createElement('audio');
      var audioSupport = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));

      // variables that define the dance
      var imageMarkup = '<img id="elMurloc" style="display: none" src="images/murloc.png" />';
      var audioMarkup = '<audio id="elMurlocTalk" preload="auto"><source src="audio/murloc.mp3" /></audio>'; 

      // add our friend and style
      var body = $document.find('body').eq(0);
      body.append(imageMarkup);
      if (audioSupport) { 
        body.append(audioMarkup); 
      }

      // store the elements so I can use later
      var image = document.getElementById('elMurloc');
      var audio = document.getElementById('elMurlocTalk');
   
      // setup style for friend offscreen
      var defaultRight = '0';
      var defaultBottom = '-500px';
      image.style.position = 'fixed';
      image.style.bottom = defaultBottom;
      image.style.right = defaultRight;
      image.style.display = 'block';

      return {
        trigger: function() {
          
          if (audio) {
            audio.play();
          }

          var jq = jQuery(image);
          jq.animate({'bottom': '30'}, function() {           
            jq.animate({'bottom' : '0px' }, 100, function() {
              var offset = ((jq.position().left) + 400);
              console.log('offset: ' + offset);
              jq.delay(300).animate({
                'right' : offset
                }, 1750, function() {
                  jq.css({
                    'bottom': defaultBottom,
                    'right' : defaultRight
                  });
              });
            });
          });
        }
      };
    }
})();