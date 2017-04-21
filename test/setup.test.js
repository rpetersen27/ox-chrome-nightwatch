let jsdom = require('jsdom');

before((done) => {
    jsdom.env({
        html: '<html><body></body></html>',
        done: function (err, window) {
            global.$ = window.$ = require('jquery')(window);

            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;

            require('../inject/path');

            done();
        },
    });
});

beforeEach(() => {
    $('body').empty().append(
        $('<div class="io-ox-core">').append(
            $('<div id="io-ox-screens" class="abs">').append(
                $('<div id="io-ox-windowmanager">').append(
                    $('<div id="io-ox-windowmanager-pane">')
                )
            )
        )
    );
});
