chrome.extension.onMessage.addListener(

function (request, sender) {
    console.log(sender.tab);
    n_results = -1;

    console.log(request.link);

    chrome.history.getVisits({
        url: request.link
    },

    function (visits) {
        console.log(visits.length);
        n_results = visits.length;
        chrome.tabs.sendMessage(sender.tab.id, {
            "result": n_results
        });
    });



});

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

                console.log("Earliest history item found: " + get_lastVisitTime(first_histime));

            }
        } else {
            console.log('no history found, looking an hour later');
            console.log('was looking between ' + start_time.getHours() + ' and ' + end_time.getHours() + ' but now looking between...');
            start_time.setHours(start_time.getHours() + 1);
            end_time.setHours(end_time.getHours() + 1);
            console.log(start_time.getHours() + ' and ' + end_time.getHours() + '\n');
            getEarliestHistory(start_time, end_time);
        }
    });
}




$(function () {


    //find first history of the day

    //take a look at items between 7a and 8, if limit is hit, that means there
    //were probably some before

    end_time = new Date();
    end_time.setHours(7);

    start_time = new Date();
    start_time.setHours(6);

    maxResultsLimit = 100;

    getEarliestHistory(start_time, end_time);

    //create timer
    //
    //show timer
});
