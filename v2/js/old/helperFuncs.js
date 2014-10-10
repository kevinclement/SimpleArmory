function arrayIndexOf(a,searchElement /*, fromIndex */ ) {
    "use strict";
    if (a == null) {
        throw new TypeError();
    }
    var t = Object(a);
    var len = t.length >>> 0;
    if (len === 0) {
        return -1;
    }
    var n = 0;
    if (arguments.length > 1) {
        n = Number(arguments[2]);
        if (n != n) { // shortcut for verifying if it's NaN
            n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
    }
    if (n >= len) {
        return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
            return k;
        }
    }
    return -1;
};

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [], i, len = obj.length;
        for (i = 0; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function achdatesort(a,b) {
	if (a.completed == b.completed) {
		return (parseInt(a.id,10) < parseInt(b.id,10))? -1 : 1;
	}
	return (a.completed < b.completed) ? -1 : 1;
}

// Battle.net json callback functions
function bnetgo(o,region) {
	latestprofile = o;
	latestprofile.region = region;

    document.getElementById('divtabs').style.visibility='visible';

    var locHash = parseHash();

    // If there isn't a tab specified default to character
    locHash.tab = locHash.tab ? locHash.tab : "character";

    // Navigate to the tab
    navigateToTab(locHash.tab);
}

function bnetgous(o) { bnetgo(o,'us'); }
function bnetgoeu(o) { bnetgo(o,'eu'); }

function poprealmlistus(o) { poprealmlist(o,'us'); }
function poprealmlisteu(o) { poprealmlist(o,'eu'); }

var realmCount = 0;
function poprealmlist(o, region) {
    // Fill out options for realm
    var selbox = document.getElementById('realmlist');
    for (var r in o.realms) {
        // Create an option
        var opt = document.createElement('option');
        opt.value = region+o.realms[r].slug;
        opt.label = o.realms[r]['name']+' '+region.toUpperCase()+(o.realms[r].status?'':' (Down)');
        opt.text = o.realms[r]['name']+' '+region.toUpperCase()+(o.realms[r].status?'':' (Down)');

        selbox.appendChild(opt);
    }

    // We finished loading base page
    if (realmCount++ == 1)
    {
        onLoad();
    }
}

function getcharbyname(region,realm,charname) {
	var url = 'http://'+region+'.battle.net/api/wow/character/'+realm+'/'+charname+'?fields=pets,mounts,achievements,guild,reputation,professions&jsonp=bnetgo'+region;
	var s = document.createElement('script');
	s.type='text/javascript';
	s.src=url;
	if(s.addEventListener)s.addEventListener('error',function(evt){if(evt)evt.stopPropagation();bneterr();},false);
	document.getElementsByTagName('head')[0].appendChild(s);
}
function getchar(f) {
	var fullslug = f.realm.options[f.realm.selectedIndex].value;
    setLocation(fullslug.substr(0,2), fullslug.substr(2), f.char.value);
}

function bneterr() {
	var h = '';
	document.getElementById('divtabs').style.visibility='hidden';

	h += '<div style="position: absolute; right: 15em; left: 0; text-align: center"><h2>Error fetching character.</h2></div>';

	document.getElementById('result').innerHTML = '<div class="clear" id="resulttop"></div>'+h;
	document.getElementById('resulttop').scrollIntoView();
}
