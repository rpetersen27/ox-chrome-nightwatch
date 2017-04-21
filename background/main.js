chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'record' }, function (response) {
        if (response.status !== 'ok') console.error(response);
    });
});
