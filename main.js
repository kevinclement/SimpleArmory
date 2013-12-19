var charinfo = {
	genders: ['Male','Female'],
	races: [,'Human','Orc','Dwarf','Night Elf','Undead','Tauren','Gnome','Troll','Goblin','Blood Elf','Draenei',,,,,,,,,,,'Worgen',,,'Pandaren','Pandaren'],
	classes: [,'Warrior','Paladin','Hunter','Rogue','Priest','Death Knight','Shaman','Mage','Warlock',,'Druid'],
	raceToFactions: [,'Alliance','Horde','Alliance','Alliance','Horde','Horde','Alliance','Horde','Horde','Horde','Alliance',,,,,,,,,,,'Alliance',,,'Alliance','Horde'],
};
var latestprofile = {};

function onLoad()
{
    // Parse hash
    var locHash = parseHash();

    // If we have hash info, set values
    if (locHash.region)
    {
        setValues(locHash.region, locHash.realm, locHash.char);

        // Load the battle.net account info for this user
        getcharbyname(locHash.region, locHash.realm, locHash.char);
    }
}

function repbar(level,maxrep,curlevel,currep,color) {
	if (level > curlevel) return '';
	compareto = (level < curlevel)?maxrep:currep;
	return '<div style="height: 1em; margin: 0 1px; width: '+Math.ceil(compareto/150)+'px; background-color: '+color+'; float: left"></div>';
}

function showtab(p_section,p_name) {
    var runAfterLoad;
	var o = latestprofile;
	var h = '';
	var cath,doshow,showthis,hasthis,spl,imgtag;
	var PlayerClassNames = [];
	for (var x=0; x<charinfo.classes.length; x++) if (charinfo.classes[x]) PlayerClassNames.push(charinfo.classes[x]);
	var charside = charinfo.raceToFactions[o.race].substr(0,1);

	document.getElementById('result').innerHTML = '<div style="margin: 3em auto">Working..</div>'; 

	if (p_section == 'Character') {
		h += '<h2><a href="http://'+o.region+'.battle.net/wow/en/character/'+o.realm+'/'+o['name']+'/advanced">'+o['name']+'</a> ';
		h += '<br>'+charinfo.genders[o.gender]+' '+charinfo.races[o.race]+' '+charinfo.classes[o['class']];
		h += '<br>'+(o.guild?('of &lt;'+o.guild['name']+'&gt; '):'')+'on '+o.realm+'</h2>';
		if (o.thumbnail) h += '<img src="http://'+o.region+'.battle.net/static-render/'+o.region+'/'+o.thumbnail.replace(/-avatar\.jpg/,'-profilemain.jpg')+'">';
	}

	if (p_section == 'Factions') {
		var normalRepNames = ['Hated','Hostile','Unfriendly','Neutral','Friendly','Honored','Revered','Exalted'];
        var tillerRepNames = ['Stranger','Acquaintance','Buddy','Friend','Good Friend','Best Friend'];
		var normalRepLevels = [36000,3000,3000,3000,6000,12000,21000,1000];
		var tillerRepLevels = [8400,8400,8400,8400,8400,999];
		var repcolors = ['#c22','red','#e62','yellow','lime','#0f8','#0fc','cyan'];
		h += '<table border="0" cellspacing="0" cellpadding="0">';

        var replevels = normalRepLevels;
        var repnames = normalRepNames;
		for (var catx = 0; catx < Factions.categories.length; catx++) {
			var cat = Factions.categories[catx];
			var hx = '';
			for (var fx = 0; fx < cat.factions.length; fx++) {
				var fac = cat.factions[fx];
				for (x = 0; x < o.reputation.length; x++) 
					if (o.reputation[x].id == fac.id) {

                        // Tiller is a different scale
                        if (fac.id == "1273" || fac.id == "1275" || fac.id == "1276" || fac.id == "1277" || fac.id == "1278" || fac.id == "1279" || 
                            fac.id == "1280" || fac.id == "1281" || fac.id == "1282" || fac.id == "1283")
                        {
                            repnames = tillerRepNames;
                            replevels = tillerRepLevels;
                        }
                        else
                        {
                            replevels = normalRepLevels;
                            repnames = normalRepNames;
                        }

						if (hx == '') hx = '<tr><td colspan="2" style="font-size: 21px; font-weight: bold; padding-top: 2em">'+cat['name']+'</td></tr>';
						hx += '<tr><td style="text-align: right; vertical-align: middle; padding-right: 1em">';
						hx += '<a href="http://www.wowhead.com/faction='+fac.id+'" extratip="'+repnames[o.reputation[x].standing]+': '+o.reputation[x].value+'/'+o.reputation[x].max+'">'+o.reputation[x]['name']+'</a>';
						hx += '</td><td style="vertical-align: middle">';
						for (rx = 0; rx < replevels.length; rx++)
                        {
							hx += repbar(rx,replevels[rx],o.reputation[x].standing,o.reputation[x].value,repcolors[rx]);
                        }
						hx += '<div class="clear"></div></td></tr>';
						break;
					}
			}
			if (hx != '') {
                hx += '<tr><td></td><td style="font-size: 75%; font-style: italic; width: 600px">';
                if (cat.name == "The Tillers")
                {
                    hx += '<div style="width: 56px;  float: left; padding: 0 1px">Stranger</div>';
                    hx += '<div style="width: 56px; float: left; padding: 0 1px">Acq</div>';
                    hx += '<div style="width: 56px; float: left; padding: 0 1px">Buddy</div>';
                    hx += '<div style="width: 56px; float: left; padding: 0 1px">Friend</div>';
                    hx += '<div style="width: 56px; float: left; padding: 0 1px">Good</div>';
                    hx += '<div style="padding: 0 1px">Best Friend</div>';
                }
                else
                {
                    hx += '<div style="width: 240px;  float: left; padding: 0 1px">Hated</div>';
                    hx += '<div style="width: 20px; float: left; padding: 0 1px">Hos</div>';
                    hx += '<div style="width: 20px; float: left; padding: 0 1px">Unf</div>';
                    hx += '<div style="width: 20px; float: left; padding: 0 1px">Neu</div>';
                    hx += '<div style="width: 40px; float: left; padding: 0 1px">Friend</div>';
                    hx += '<div style="width: 80px; float: left; padding: 0 1px">Honored</div>';
                    hx += '<div style="width: 140px; float: left; padding: 0 1px">Revered</div>';
                    hx += '<div style="padding: 0 1px">Ex</div>';
                }
                hx += '</td></tr>';
			}
			h += hx;			
		}	
		h += '</table>';				
	}

    if (p_section == 'Achievements') {
        var supercat;
        for (var sc = 0; sc < Achievements.supercats.length; sc++) {

            // Find the supercat that matches 
            if (Achievements.supercats[sc]['name'] != p_name)
            {
                continue;
            }

            supercat = Achievements.supercats[sc];

            // Set title on top of page
            h += '<h3 style="margin: 0">'+supercat['name']+'</h3>';

            // Loop through each category in the supercat
            for (var catx = 0; catx < supercat.cats.length; catx++) {

                var cat = supercat.cats[catx];

                // If the category name is the same as the supercat that we don't put the sub header in
                if (cat['name'] != supercat['name']) h += '<b>'+cat['name']+'</b>';

                // Start the category section div
                h += '<div style="margin-left: 20px">';
                
                haszonenames = false;
                for (var zonex = 0; zonex < cat.zones.length; zonex++)
                {
                    haszonenames |= cat.zones[zonex]['name'] != '';
                }

                for (var zonex = 0; zonex < cat.zones.length; zonex++) {
                    var zone = cat.zones[zonex];

                    var showzone = false;
                    zh = '<div style="float: left; margin: 10px">';

                    if (haszonenames) {
                        if (zone['name'] == '') zone['name']=cat['name'];
                        zh += '<b>'+zone['name']+'</b><br>';
                    }

                    for (var achx = 0; achx < zone.achs.length; achx++) {
                        var ach = clone(zone.achs[achx]);
                        var achidx = arrayIndexOf(o.achievements.achievementsCompleted,parseInt(ach.id,10));
                        ach.completed = o.achievements.achievementsCompletedTimestamp[achidx];
                        hasthis = (achidx>=0);
                        showthis = (hasthis || ((supercat['name'] != 'Feats of Strength' && ach.obtainable) && ((ach.side == '') || (ach.side == charside))));
                        showzone |= showthis;
                        if (hasthis) {
                            imgtag = '<img src="http://wow.zamimg.com/images/wow/icons/medium/'+ach.icon.toLowerCase()+'.jpg" width="36" height="36" border="0">';
                        } else if (showthis) {
                            imgtag = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="width: 34px; height: 34px; border: 1px dashed grey; display: inline"/'+'>';
                        }
                        if (showthis) {
                            zh += '<a href="http://www.wowhead.com/achievement='+ach.id+'"'+(hasthis?(' rel="who=' + latestprofile.name + '&amp;when=' + ach.completed + '"'):'')+'>'+imgtag+'</a>';
                        }
                    }
                    zh += '</div>';
                    if (showzone) h += zh;
                }
                h += '</div><div class="clear"></div>';
            }
        }
    }

    if (p_section == 'Mounts' || p_section == 'Pets')
    {
        var hasCount = 0;
        var knownLookup = new Array();

        var catVar = null;
        var sectionTitle = null;
        switch(p_section)
        {
            case "Mounts":
              catVar = Mounts;
              sectionTitle = "Mounts";
              break;
            case "Pets":
              catVar = Pets;
              sectionTitle = "Companions";
              break;
        }

        var collected = p_section == "Mounts" ? "mounts" : "pets";
        var sectionName = p_section;

        // Build lookup array
        if (o[collected].collected) {
            for (var x = 0; x < o[collected].collected.length; x++)
            {
                var uniqueId = o[collected].collected[x].spellId;
                knownLookup.push(uniqueId);
            }
        }

        // Set title on top of page
        h += '<h3 style="margin: 0"><span id="mountCount"></span> ' + sectionTitle + '</h3>';

        // Loop through each category
        for (var catx = 0; catx < catVar.length; catx++) {

            var cat = catVar[catx];

            // If the category name is the same as the section that we don't put the sub header in
            if (cat.name != sectionName) h += '<b>'+cat.name+'</b>';

            // Start the category section div
            h += '<div style="margin-left: 20px">';

            for (var subcatx = 0; subcatx < cat.subcats.length; subcatx++) {
                var subCat = cat.subcats[subcatx];

                var showSubCat = false;
                zh = '<div style="float: left; margin: 10px">';

                if (subCat.name != "") {
                    zh += '<b>'+subCat.name+'</b><br>';
                }
                else
                {
                    zh += '<br>';
                }

                for (var itemx = 0; itemx < subCat.items.length; itemx++) {
                    var item = subCat.items[itemx];
                    var lookupId = item.spellid;
                    var hasthis = arrayIndexOf(knownLookup,parseInt(lookupId,10)) >= 0;

                    showthis = (hasthis || item.obtainable);
                    if (item.allowableRaces.length > 0)
                    {
                        if (arrayIndexOf(item.allowableRaces, o.race) == -1)
                        {
                            showthis = false;
                        }
                    }

                    if (item.allowableClasses && item.allowableClasses.length > 0)
                    {
                        if (arrayIndexOf(item.allowableClasses, o.class) == -1)
                        {
                            showthis = false;
                        }
                    }

                    showSubCat |= showthis;
                    if (hasthis) {
                        imgtag = '<img src="http://wow.zamimg.com/images/wow/icons/medium/'+item.icon.toLowerCase()+'.jpg" width="36" height="36" border="0">';
                    } else if (showthis) {
                        imgtag = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="width: 34px; height: 34px; border: 1px dashed grey; display: inline"/'+'>';
                    }

                    if (showthis) {
                        if (hasthis)
                        {
                            hasCount++;
                        }

                        // Need to some extra work to determine what our url should be
                        // By default we'll use a spell id
                        var headUrl = "http://www.wowhead.com/spell="+item.spellid;

                        // If the item id is available lets use that
                        if (item.itemId)
                        {
                            headUrl = "http://www.wowhead.com/item="+item.itemId;
                        }
                        else if (item.allianceId && charside == 'A')
                        {
                            headUrl = "http://www.wowhead.com/item="+item.allianceId;
                        }
                        else if (item.hordeId && charside == 'H')
                        {
                            headUrl = "http://www.wowhead.com/item="+item.hordeId;
                        }
                        else if (item.creatureId)
                        {
                            headUrl = "http://www.wowhead.com/npc="+item.creatureId;
                        }

                        zh += '<a href="' + headUrl + '">'+imgtag+'</a>';
                    }
                }
                zh += '</div>';
                if (showSubCat) h += zh;
            }
            h += '</div><div class="clear"></div>';
        }

        runAfterLoad = function () { document.getElementById("mountCount").innerText = hasCount; };
    }

    if (p_section == 'Battlepets')
    {
        var hasCount = 0;
        var known = {};

        var catVar = BattlePets;
        var sectionTitle = "Battle Pets";
        var collected = "pets";
        var sectionName = "Pets";

        // Build lookup array
        if (o[collected].collected) {
            for (var x = 0; x < o[collected].collected.length; x++)
            {
                known[o[collected].collected[x].creatureId] = o[collected].collected[x];
            }
        }

        // Set title on top of page
        h += '<h3 style="margin: 0"><span id="mountCount"></span> ' + sectionTitle + '</h3>';
        h += '<input type="checkbox" id="showlevels" onclick="showLevels(this.checked)"></input><label for="showlevels">Show levels and breeds</label><br/><br/>';

        // Loop through each category
        for (var catx = 0; catx < catVar.length; catx++) {

            var cat = catVar[catx];

            // If the category name is the same as the section that we don't put the sub header in
            if (cat.name != sectionName) h += '<b>'+cat.name+'</b>';

            // Start the category section div
            h += '<div style="margin-left: 20px">';

            for (var subcatx = 0; subcatx < cat.subcats.length; subcatx++) {
                var subCat = cat.subcats[subcatx];

                var showSubCat = false;
                zh = '<div style="float: left; margin: 10px">';

                if (subCat.name != "" && subCat.name != "&nbsp;") {
                    zh += '<b>'+subCat.name+'</b><br>';
                }

                for (var itemx = 0; itemx < subCat.items.length; itemx++) {
                    var item = subCat.items[itemx];
                    var lookupId = item.creatureId;
                    var pet = known[lookupId];
                    var hasthis = pet != null;

                    showthis = (hasthis || item.obtainable);
                    if (item.allowableRaces.length > 0)
                    {
                        if (arrayIndexOf(item.allowableRaces, o.race) == -1)
                        {
                            showthis = false;
                        }
                    }

                    if (item.allowableClasses && item.allowableClasses.length > 0)
                    {
                        if (arrayIndexOf(item.allowableClasses, o.class) == -1)
                        {
                            showthis = false;
                        }
                    }

                    showSubCat |= showthis;
                    if (hasthis) {
                        imgtag = '<img src="http://wow.zamimg.com/images/wow/icons/medium/'+item.icon.toLowerCase()+'.jpg" width="36" height="36" border="0">';
                    } else if (showthis) {
                        imgtag = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="width: 34px; height: 34px; border: 1px dashed grey; display: inline"/'+'>';
                    }

                    if (showthis) {
                        if (hasthis)
                        {
                            hasCount++;
                        }

                        // Need to some extra work to determine what our url should be
                        // By default we'll use a spell id
                        var headUrl = "http://www.wowhead.com/spell="+item.spellid;

                        // If the item id is available lets use that
                        if (item.itemId)
                        {
                            headUrl = "http://www.wowhead.com/item="+item.itemId;
                        }
                        else if (item.allianceId && charside == 'A')
                        {
                            headUrl = "http://www.wowhead.com/item="+item.allianceId;
                        }
                        else if (item.hordeId && charside == 'H')
                        {
                            headUrl = "http://www.wowhead.com/item="+item.hordeId;
                        }
                        else if (item.creatureId)
                        {
                            headUrl = "http://www.wowhead.com/npc="+item.creatureId;
                        }

                        var level = "";
                        var breed = "";
                        if (hasthis)
                        {
                            switch(pet.qualityId)
                            {
                                case 0:
                                    background = "#7F7F7F";
                                    break;
                                case 1:
                                    background = "#F0F0F0";
                                    break;
                                case 2:
                                    background = "#22B14C";
                                    break;
                                case 3:
                                    background = "#3F48CC";
                                    break;
                            }

                            switch(pet.stats.breedId)
                            {
                                case 4:
                                case 14:
                                    breed = "P/P";
                                    break;
                                case 5:
                                case 15:
                                    breed = "S/S";
                                    break;
                                case 6:
                                case 16:
                                    breed = "H/H";
                                    break;
                                case 7:
                                case 17:
                                    breed = "H/P";
                                    break;
                                case 8:
                                case 18:
                                    breed = "P/S";
                                    break;
                                case 9:
                                case 19:
                                    breed = "H/S";
                                    break;
                                case 10:
                                case 20:
                                    breed = "P/B";
                                    break;
                                case 11:
                                case 21:
                                    breed = "S/B";
                                    break;
                                case 12:
                                case 22:
                                    breed = "H/B";
                                    break;
                                case 3:
                                case 13:
                                    breed = "B/B";
                                    break;
                            }
                            level = pet.stats.level;
                        }
                        else
                        {
                            background = "#eee";
                        }

                        zh += '<div class="pbCell">' +
                              '  <a href="' + headUrl + '">'+imgtag+'' +
                              '  <div class="pbLevel">' + level + '</div>' + 
                              '  <div class="pbBreed">' + breed + '</div>' + 
                              '  </a>' +
                              '  <div class="pbQual" style="background:' + background + ';"></div>' +
                              '</div>';
                    }
                }
                zh += '</div>';
                if (showSubCat) h += zh;
            }

            h += '</div><div class="clear"></div>';
        }

        runAfterLoad = function () { document.getElementById("mountCount").innerText = hasCount; };
    }


	if (p_section == 'Calendar') {
        // Build up the calendar object
        var calendar = {};
        for (var sc = 0; sc < Achievements.supercats.length; sc++) 
        {
            var supercat = Achievements.supercats[sc];
            for (var catx = 0; catx < supercat.cats.length; catx++)
            {
                var cat = supercat.cats[catx];
                for (var zonex = 0; zonex < cat.zones.length; zonex++)
                {
                    var zone = cat.zones[zonex];
                    for (var achx = 0; achx < zone.achs.length; achx++)
                    {
                        var ach = clone(zone.achs[achx]);

                        var achidx = arrayIndexOf(o.achievements.achievementsCompleted,parseInt(ach.id,10));
                        if (achidx>=0)
                        {
                            var dt = new Date(o.achievements.achievementsCompletedTimestamp[achidx]);
                            var monthidx = ''+dt.getFullYear()+((dt.getMonth() < 9)?'0':'')+(dt.getMonth()+1);
                            if (typeof calendar[monthidx] == 'undefined') calendar[monthidx] = new Array(31);
                            if (typeof calendar[monthidx][dt.getDate()] == 'undefined') calendar[monthidx][dt.getDate()] = new Array();
                            ach.completed = o.achievements.achievementsCompletedTimestamp[achidx];
                            calendar[monthidx][dt.getDate()].push(ach);
                        }
                    }
                }
            }
        }

		var monthnames = [,'January','February','March','April','May','June','July','August','September','October','November','December'];
		var today = new Date();
		var calenpages = new Array();
		var isfirstmonth = true;
        var curTotal = 0;
        var curPoints = 0;
		for (var yearx = 2008; yearx <= today.getFullYear(); yearx++) {
			for (var monthx = 1; monthx <= 12; monthx++) {
				var monthid = ''+((monthx < 10)?'0':'')+monthx;
				if ((!isfirstmonth) || (typeof calendar[''+yearx+monthid] != 'undefined')) {
					calenpages.push(''+yearx+monthid);
					isfirstmonth = false;
					if ((yearx == today.getFullYear()) && (monthx == (today.getMonth()+1))) break;
				}
			}
		}
		h += '<div align="center"><input type="button" value="<" onclick="var c=document.getElementById(\'calensel\'); if (c.selectedIndex > 0) {c.selectedIndex--; showcalen(c.options[c.selectedIndex].value);}"> ';
		h += '<select id="calensel" onchange="showcalen(this.options[this.selectedIndex].value)">';
		for (x = 0; x < calenpages.length; x++)
        {
            var sel = "";
            if (x == calenpages.length - 1)
            {
                sel = "selected"
            }
            h += '<option ' +sel+ ' value="'+calenpages[x]+'">'+monthnames[parseInt(calenpages[x].substr(4),10)]+' '+calenpages[x].substr(0,4)+'</option>';
        }
		h += '</select> <input type="button" value=">" onclick="var c=document.getElementById(\'calensel\'); if (c.selectedIndex < (c.options.length-1)) {c.selectedIndex++; showcalen(c.options[c.selectedIndex].value);}"></div>';
		h += '<div align="center" style="margin-top: .5em"><span id="calCount"></span> Achievements Earned <span style="display:none">(<span id="calPoints"></span> points)</span></div>';
		h += '<div align="center" style="margin-top: 1em">';
        var curMonth = today.getMonth() + 1;
        curcalenpage = '' + today.getFullYear() + (curMonth < 10 ? '0' + curMonth : curMonth);
		for (var yearx = 2008; yearx <= today.getFullYear(); yearx++) {
			for (var monthx = 1; monthx <= 12; monthx++) {
				var monthid = ''+((monthx < 10)?'0':'')+monthx;
                var displayIt = (curcalenpage == ''+yearx+monthid);
        
                var rowData = generateCalRows(yearx, monthx, calendar[''+yearx+monthid]);

				h += '<table class="calendar" id="calendar'+yearx+monthid+'" style="display: ' + (displayIt ? "block" : "none")+ '" total="' + rowData.total + '" points="' + rowData.points + '"">';
                h += rowData.rows;
				h += '</table>';

                if (displayIt)
                {
                    curTotal = rowData.total;
                    curPoints = rowData.points;
                }

                if ((yearx == today.getFullYear()) && (monthx == (today.getMonth()+1))) break;
			}
		}
		h += '</div>';

        runAfterLoad = function () 
        { 
            document.getElementById("calCount").innerText = curTotal; 
            document.getElementById("calPoints").innerText = curPoints; 
        };
	}
	
	document.getElementById('result').innerHTML = '<div class="clear" id="resulttop"></div>'+h;
	document.getElementById('resulttop').scrollIntoView();

    if (runAfterLoad) { runAfterLoad(); }
}

function generateCalRows(year, month, calendarData)
{
    var rows = "";
    var total = 0;
    var points = 0;
    for (dayx = 1; dayx <= 31; dayx++) {
        d = new Date(year, month-1, dayx);
        if (d.getDate() != dayx) break;
        if ((dayx == 1) || (d.getDay() == 0)) rows += '<tr>';
        if ((dayx == 1) && (d.getDay() > 0)) rows += '<td colspan="'+(d.getDay())+'" class="dayspacer"></td>';
        rows += '<td>' + dayx;

        if ((typeof calendarData != 'undefined') && (typeof calendarData[dayx] != 'undefined')) {
            day = calendarData[dayx];
            day.sort(achdatesort);
            rows += '<div>'
            for (achx in day) {
                ach = day[achx];
                rows += '<a href="http://www.wowhead.com/achievement='+ach.id+'" rel="who=' + latestprofile.name + '&amp;when='+ach.completed+'"><img src="http://wow.zamimg.com/images/wow/icons/medium/'+ach.icon.toLowerCase()+'.jpg" width="36" height="36" border="0"></a>';

                total++;
            }
            rows += '</div>';
        }
        rows += '</td>';
        if (d.getDay() == 6) rows += '</tr>';
    }
    if (d.getDay() < 6) rows += '<td colspan="'+(6-d.getDay())+'" class="dayspacer"></td>';

    rows += "</tr>";

    return { "rows": rows, "total": total, "points": points };
}

var curcalenpage;
function showcalen(newpage) {
    var curCal = document.getElementById('calendar'+curcalenpage);
    if (curCal != null)
    {
        curCal.style.display='none';
    }

    // Unhide the html
    var calElement = document.getElementById('calendar'+newpage);
	calElement.style.display='block';

    // Update the totals
    document.getElementById("calCount").innerText = calElement.getAttribute("total"); 
    document.getElementById("calPoints").innerText = calElement.getAttribute("points"); 

	curcalenpage=newpage;
}

function parseHash()
{
    // Pull any character info from the location hash
    // "#us/spirestone/marko"
    // [0]: us/spirestone/marko
    // [1]: spirestone
    // [2]: marko
    // [3]: location part
    var rgr = new RegExp('#([^\/]+)/([^\/]+)/([^\/]+)/?([^\/]+)?').exec(location.hash);
    rgr = rgr ? rgr : {};

    return { "region": rgr[1], "realm": rgr[2], "char": rgr[3], "tab": rgr[4] };
}

function setValues(region, realm, character)
{
    var selbox = document.getElementById('realmlist');
    var valbox = document.getElementById('charname');

    for (var i=0; i<selbox.length; i++)
    {
        if (selbox.options[i].value == region + realm)
        {
            selbox.options[i].selected = true;
            break;
        }
    }

    valbox.value = character;
}

window.onhashchange = onLoad;
function setLocation(region, server, character, tab)
{
    var href = '#'+region+'/'+server+'/'+character;
    if (tab)
    {
        href += '/' + tab;
    }
    location.hash = href;
}

function setLocationToTab(tab)
{
    var hash = parseHash();
    setLocation(hash.region, hash.realm, hash.char, tab.toLowerCase());
}

function navigateToTab(tab)
{
    // uppercase first letter
    var tab = tab.substr(0, 1).toUpperCase() + tab.substr(1);

    if (tab == "Character" || tab == "Calendar" || tab == "Mounts" || tab == "Factions" || tab == "Pets" || tab == "Battlepets")
    {
        showtab(tab,tab);
    }
    else if (tab == "General" || tab == "Quests" || tab == "Exploration" || tab == "Pvp" || tab == "Dungeons" || tab == "Professions" || tab == "Reputation" || tab == "Scenarios" || tab == "World" || tab == "Battles" || tab == "Feats")
    {
        if (tab == "Pvp")
        {
            tab = "Player vs. Player";
        }
        if (tab == "Dungeons")
        {
            tab = "Dungeons & Raids";
        }
        if (tab == "World")
        {
            tab = "World Events";
        }
        if (tab == "Battles")
        {
            tab = "Pet Battles";
        }
        if (tab == "Feats")
        {
            tab = "Feats of Strength";
        }
        showtab("Achievements",tab);
    }

    ga('send', 'pageview', {'title': tab});
}

function showLevels(checked)
{
    var elements = document.getElementsByClassName('pbLevel');
    if (elements == null) return;
    for(var i=0; i < elements.length; i++)
    {
        elements[i].style.opacity = checked ? 1 : 0;
    }
    var elements = document.getElementsByClassName('pbBreed');
    if (elements == null) return;
    for(var i=0; i < elements.length; i++)
    {
        elements[i].style.opacity = checked ? 1 : 0;
    }
}
