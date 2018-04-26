/**
 * The entry point of the (pageaction) extension.
 */

/**
 * Run when the extension is installed/updated.
 */
chrome.runtime.onInstalled.addListener(function(details) {
    chrome.tabs.create({
        url: 'initSettings.html', 
        active: true
    }, function(tab){ 
        // close the tab
        chrome.tabs.remove(tab.id);
    });
});

/** 
 * Listen for any changes to the URL of any tab.
 * see: http://developer.chrome.com/extensions/tabs.html#event-onUpdated
 */
chrome.tabs.onUpdated.addListener(function(id, info, tab){
    // decide if we're ready to inject content script
    if (tab.status !== "complete"){
        return;
    }
    if (tab.url.toLowerCase().indexOf("youtube.com") === -1){
        return;
    }

    if ( !(localStorage.raspIp && localStorage.raspPort) ) {
        // it's not yet setup - f** dat shit
        // TODO open up the set up page again
        // chrome.pageAction.setPopup({tabId: tab.id, popup: 'reSettings.html'});
    }

    // show the page action
    chrome.pageAction.show(tab.id);
});

/*
 * Register callback to send video to raspberry.
 * will be called if no popup attached <- What did I mean there?
 */
chrome.pageAction.onClicked.addListener(function(tab) {
    sendVideo(tab);
});

var sendVideo = function (tab) { 
    var raspIp = localStorage.raspIp;
    var raspPort = localStorage.raspPort;
    setIcon(tab, 'assets/img/icon.gif');

    // TODO: check again if settings are ok
    var v_param = findPropertyFromString(tab.url, 'v');
    var req = new XMLHttpRequest();

    req.open("GET", 'http://' + raspIp + ':' + raspPort + '?v=' + v_param , true); // kww0WXcH74o
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            setIcon(tab, 'assets/img/logo.png');

            if ( req.status != 200 ) {
                console.log('oupsie');
            }
            else {
                console.log('alles guet');
            }
        };
    }    
    req.send();
}

/**
 * Utility method to set the icon of the extension.
 */
var setIcon = function (tab, iconLocation) {
   chrome.pageAction.setIcon({
        tabId: tab.id, 
        path: iconLocation
    }, null); 
}

var findPropertyFromString = function(url, key) {
    var key = key + "=";
    var index = url.indexOf('?');
    var video_url = url.substring(index + 1);

    // TODO: for the time being there is no & in the url
    return video_url.split(key)[1];
}
   
