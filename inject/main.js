(function () {
    var result = [];
    var isRunning = false,
        clickListener = function (e) {
            var elem = $(e.target);
            if (elem.prop('tagName') === 'I') elem = elem.parent();
            document.removeEventListener('click', clickListener);
            var path = window.getCSSPath(elem);
            result.push({
                path: path,
                action: '.clickWhenVisible(\'' + path + '\')',
                tagName: elem.prop('tagName').toLowerCase(),
                text: elem.text() || elem.attr('title') || elem.attr('aria-label'),
            });
        },
        showNotification = function (type, text) {
            var script = document.createElement('script');
            script.textContent = 'require(["io.ox/core/yell"], function (yell) { yell("' + type + '", "' + text + '")})';
            (document.head || document.documentElement).appendChild(script);
        };

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action !== 'record') return;
        if (!isRunning) {
            result = [];
            document.addEventListener('click', clickListener, true);
            showNotification('success', 'Start recording');
        } else {
            var $modal,
                text = result.map(function (obj) {
                    return '// clicked on ' + obj.tagName + '-tag with label "' + obj.text + '"\n' + obj.action + '\n';
                }).join('');
            $('body').append(
                $modal = $('<div class="modal" style="display: block;">').append(
                    $('<div class="modal-dialog">').append(
                        $('<div class="modal-content">').append(
                            $('<div class="modal-header">').append(
                                $('<h4 class="modal-title">').text('Result of OX Recording')
                            ),
                            $('<div class="modal-body">').append(
                                $('<div style="white-space: pre;">').text(text)
                            ),
                            $('<div class="modal-footer">').append(
                                $('<button class="btn btn-default">').text('Close').on('click', function () {
                                    $modal.remove();
                                }),
                                $('<button class="btn btn-primary">').text('Copy to clipboard').on('click', function () {

                                })
                            )
                        )
                    )
                )
            );
            document.removeEventListener('click', clickListener);
        }
        sendResponse({ status: 'ok' });
        isRunning = !isRunning;
    });
}());
