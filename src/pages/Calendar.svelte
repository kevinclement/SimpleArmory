<script>
    import { onMount } from 'svelte'
    import { region, realm, character } from '$stores/user'
    import { getAchievements } from '$api/achievements'
    import { getTitle } from '$util/utils'
    import settings from '$util/settings'
    import ProgressBar from '$components/ProgressBar.svelte';
    import Loading from '$components/Loading.svelte';

    let achByMonths
    let promise
    let months = []
    let selectedMonth
    let totalForMonth = 0
    let totalPoints = 0
    let calendarHTML = ''
    $: prevDisabled = !selectedMonth || selectedMonth.index <=0
    $: nextDisabled = !selectedMonth || selectedMonth.index === months.length - 1

    $: promise = getAchievements($region, $realm, $character).then(_ => {
        // weird bug where if I do assignment here instead of in function
        // it will go into an infinite loop of achievement requests
        init(_);
    })
    
    $:{ totalForMonth = selectedMonth && achByMonths && achByMonths[selectedMonth.value] ? achByMonths[selectedMonth.value].total  : 0 }
    $:{ totalPoints   = selectedMonth && achByMonths && achByMonths[selectedMonth.value] ? achByMonths[selectedMonth.value].points : 0 }
    
    function init(achs) {
        if (!achs) return;

        achByMonths = buildMonthLookup(achs)
        months = buildMonthList(achByMonths)
        selectedMonth = months[months.length - 1];
        selectionChanged();
    }
    
    function buildMonthTableHTML(selectedMonth, character) {
        let html = '<table class="calendar">'      

        let d;
        var prettyName = character.charAt(0).toUpperCase() + character.slice(1);

        for (var day = 1; day <= 31; day++) {
            d = new Date(selectedMonth.year, selectedMonth.month - 1, day);
            if (d.getDate() !== day) {
                break;
            }
            if ((day === 1) || (d.getDay() === 0)) {
                html += '<tr>';	
            } 
            if ((day === 1) && (d.getDay() > 0)) {
                html += '<td colspan="'+(d.getDay())+'" class="dayspacer"></td>';
            }
            html += '<td>' + day;

            let selMonth = achByMonths[selectedMonth.value];
            if (selMonth && selMonth[day]) {
                let achievs = selMonth[day];
                achievs.sort((achieve1, achieve2) => {
                    if (achieve1.completed === achieve2.completed) {
                        return (parseInt(achieve1.id,10) < parseInt(achieve2.id,10)) ? -1 : 1;
                    }

                    return (achieve1.completed < achieve2.completed) ? -1 : 1;
                });

                html += '<div>';
                achievs.forEach((ach) => {
                    html += '<a target="' + settings.anchorTarget + '" href="//' + 
                            settings.WowHeadUrl + '/achievement=' + ach.id + '" ' +
                            'rel="who=' + prettyName + '&amp;when=' + ach.completed +'">' +
                            '<img src="//wow.zamimg.com/images/wow/icons/medium/' + 
                            ach.icon.toLowerCase() + '.jpg" width="36" height="36" border="0"></a>';
                })

                html += '</div>';
            }

            html += '</td>';
            if (d.getDay() === 6) {
                html += '</tr>';	
            } 
        }
        if (d.getDay() < 6) {
            html += '<td colspan="'+(6-d.getDay())+'" class="dayspacer"></td>';
        }

        html += '</tr>';       
        html += '</table>';

        return html;        
    }

    function buildMonthList(achByMonths) {
        let monthnames = [
          '','January','February','March','April','May','June',
          'July','August','September','October','November','December'
        ];
        let today = new Date();
        let foundFirstMonth = false;
        let months = [];
        let index = 0;

        for (let year = 2008; year <= today.getFullYear(); year++) {
            for (var month = 1; month <= 12; month++) {
                var monthid = '' + year + ((month < 10)?'0':'') + month;
                var thisMonth = (year === today.getFullYear()) && (month === (today.getMonth()+1));

                // if we're still trying to find the first month, don't include a bunch of months that don't have achievements
                if (!foundFirstMonth && (!achByMonths[monthid] || !achByMonths[monthid].hasAchievements)) {
                    continue;
                }
                foundFirstMonth = true;
                
                // Add the months to the list of months
                months.push({
                    value: monthid,
                    text: monthnames[month] + ' ' + year,
                    index: index++,
                    year: year,
                    month: month
				});

                // Stop once we get to this month
                if (thisMonth) {
                    break;
                }
            }
        }

        return months;
    }

    onMount(async () => {
        window.ga('send', 'pageview', 'Calendar');
    });

    function buildMonthLookup(achievements) {
        var achByMonths = {};

        Object.keys(achievements).forEach((key) => {
            let supercat = achievements[key];
            if (supercat.categories) {
                supercat.categories.forEach((cat) => {
                    cat.subcats.forEach((subcat) => {
                        subcat.achievements.forEach((ach) => {
                            if (ach.completed) {
                                let dt = new Date(ach.completed);
                                let year = dt.getFullYear()
                                let month = dt.getMonth()+1
                                var monthid = ''+year+((dt.getMonth() < 9)?'0':'')+month

                                if (!achByMonths[monthid]) {
                                    achByMonths[monthid] = new Array(31);
                                    achByMonths[monthid].hasAchievements = true;
                                    achByMonths[monthid].total = 0;
                                    achByMonths[monthid].points = 0;
                                }
                                if (!achByMonths[monthid][dt.getDate()]) {
                                    achByMonths[monthid][dt.getDate()] = [];
                                } 
                                
                                achByMonths[monthid][dt.getDate()].push(ach);                               
                                achByMonths[monthid].total++;
                                achByMonths[monthid].points += ach.points;
                            }
                        })
                    });
                });
            }
        });
        
        return achByMonths;
    }

    function leftOneMonth() {
    	if (selectedMonth && selectedMonth.index > 0) {
            selectedMonth = months[selectedMonth.index - 1];
            selectionChanged();
        }
    }

    function rightOneMonth() {	
        if (selectedMonth && selectedMonth.index < months.length - 1) {
            selectedMonth = months[selectedMonth.index + 1];
            selectionChanged();
        }
    }

    function selectionChanged() {
        calendarHTML = buildMonthTableHTML(selectedMonth, $character)
    }
</script>

<svelte:head>
	<title>{getTitle($character, 'Calendar')}</title>
</svelte:head>

<div class="container cal">
<div class="page-header">
    <h2>
        Calendar 
        <small>
        <button type="button" class="btn btn-default" disabled={prevDisabled} on:click={leftOneMonth}>&laquo;</button>
        <select class="selMonth" bind:value={selectedMonth} on:change="{selectionChanged}">
            {#each months as month (month.value)}
                <option value={month}>
                    {month.text}
                </option>
            {/each}
        </select>
        <button type="button" class="btn btn-default" disabled={nextDisabled} on:click={rightOneMonth}>&raquo;</button>
        </small>
        <ProgressBar
            rightSide={true}
            width={100}
            styleWidth={175}
            percentage={`${totalForMonth } (${totalPoints} points)`}/>
    </h2>
</div>

{#await promise}
    <Loading/>
{:then value}
    {@html calendarHTML}
{/await}

</div>

<style>
    .cal small {
        display: inline-block;
    }
    .cal select {
        height:30px;
        min-width: 125px;
        border-color:#ccc;
        border-radius: 4px;
        font-size: small;
        position:relative;
        top:-6px;
    }
    .cal .btn {
        height:30px;
        padding-top:0px;
        padding-bottom: 0px;
        position: relative;
        top: -5px;
    }
</style>