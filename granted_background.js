var cookieOptions = {
    url: 'http://localhost',
    name: 'timegrantedtriggered'
};

function triggerPopupOnce(end) {

    var today = new Date();
    today.setHours(0,0,0,0);

    var ending = new Date(end);
    ending.setHours(0,0,0,0);

    if (today > ending) {
        options.value = 'true';
    }

    chrome.cookies.get(cookieOptions, function (cookie) {

        if (cookie) {
            return;
        }

        cookieOptions.value = 'true';
        chrome.cookies.set(cookieOptions);

        var notification = webkitNotifications.createNotification(
            '/icon_48.png',
            'GO HOME',
            'Hey, it\'s time to go home!'
        );
        notification.show();
    });
}

function updateTimeLeft(start_time, ending_time) {
    var current_time = new Date();
    left_time = ending_time - current_time;

    time_obj = convertMS(left_time);

    if (current_time > ending_time) {
        $('.time-display').html('GO HOME!!');
        $('#progress').css('width', '100%');
        $('#percent').text( "100%");
        triggerPopupOnce(ending_time);
        return;
    }

    chrome.cookies.remove(cookieOptions);

    if (time_obj.h == 0) {
    	msg = time_obj.m + "m " + time_obj.s + 's';
    }
    else {
    	msg = time_obj.h + "h " + time_obj.m + "m " + time_obj.s + 's';
    }

    $('#left-time').text(msg);

    //progress bar
    percentage = 1 - ( left_time / (8 * 60 * 60 * 1000));
    $('#progress').css('width', (percentage * 100)+'%');
    // $('#progress').text((Math.round((percentage * 100 * 100) / 100) ) + " %");
    $('#percent').text((Math.round((percentage * 100 * 100) / 100) ) + " %");

    console.log('updated');


    setTimeout(function () {

        updateTimeLeft(start_time, ending_time);

    }, 1000);

}

function convertMS(ms) {
    var d, h, m, s, half;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    half = 'AM';

    if (h > 12) {
        h -= 12;
        half = 'PM';
    }

    return {
        d: d,
        h: h,
        m: m,
        s: s,
        half: half
    };
};

function buildDateString(msObj) {
    return msObj.h + ':' + msObj.s + ' ' + msObj.half;
}

function rl() {
    location.reload();
}

function get_lastVisitTime(historyItem) {

    return new Date(historyItem['lastVisitTime']);
}

maxProp = function (array, prop) {
    var values = array.map(function (el) {
        return el[prop];
    });
    return Math.max.apply(Math, values);
};

minProp = function (array, prop) {
    var values = array.map(function (el) {
        return el[prop];
    });
    return Math.min.apply(Math, values);
};

function getEarliestHistory(start_time, end_time) {
    chrome.history.search({
        'startTime': start_time.getTime(),
        'endTime': end_time.getTime(),
        'text': "",
        'maxResults': maxResultsLimit
    }, function (e) {
        if (e.length !== 0) {
            ALL = e;
            //find earliest time
            index_times = $.map(ALL, function (el) {
                return {
                    index: ALL.indexOf(el),
                    time: get_lastVisitTime(el)
                };
            });

            //If the list isn't full, we can assume that
            //we've found the earliest history item because we've cast the net so wide
            //that we'd have the earliest history item as the last element in the array
            if (e.length !== maxResultsLimit) {
                mintime = (minProp(index_times, 'time'));
                index_of_earliest_hisitem = $.grep(index_times, function (item) {
                    return item.time.getTime() === mintime
                })[0].index

                first_histime = ALL[index_of_earliest_hisitem];
                var lastVisitTime = get_lastVisitTime(first_histime);
                var lv = convertMS(lastVisitTime);

                $('#start-time').text(lastVisitTime.toLocaleTimeString());

                var ending_time = new Date(lastVisitTime.getTime());
                ending_time.setHours(ending_time.getHours() + 8);
                $('#end-time').text(ending_time.toLocaleTimeString());

                console.log("Earliest history item found: " + lastVisitTime);

                //start the update timer, once a second
                updateTimeLeft(start_time, ending_time);

            }
        } else {
            console.log('no history found, looking an hour later');
            // console.log('was looking between ' + start_time.getHours() + ' and ' + end_time.getHours() + ' but now looking between...');

            start_time.setHours(start_time.getHours() + 1);
            end_time.setHours(end_time.getHours() + 1);
            // console.log(start_time.getHours() + ' and ' + end_time.getHours() + '\n');

            //recurse til you make it
            getEarliestHistory(start_time, end_time);
        }
    });
}



$(function () {
    //take a look at items between 6a and 7, if limit is hit, that means there
    //were probably some before

    end_time = new Date();
    end_time.setHours(7);

    start_time = new Date();
    start_time.setHours(6);

    maxResultsLimit = 100;

    getEarliestHistory(start_time, end_time);
    // test_time = new Date();
    // test_time.setHours(test_time.getHours() + 10);
    // updateTimeLeft(test_time);

    $('#bodybody').parents('body:first').addClass('time-granted');
});
