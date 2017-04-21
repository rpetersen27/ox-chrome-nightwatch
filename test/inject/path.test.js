const expect = require('chai').expect;

describe('Path', () => {

    it('returns a data-action selector from the toolbar', () => {
        let target;

        $('#io-ox-windowmanager-pane').append(
            $('<div class="window-container io-ox-mail-window chromeless-window">').append(
                $('<div class="window-container-center">').append(
                    $('<div class="window-body classic-toolbar-visible">').append(
                        $('<div class="classic-toolbar-container">').append(
                            $('<ul class="classic-toolbar" role="toolbar">').append(
                                $('<li role="presentation">').append(
                                    target = $('<a class="io-ox-action-link" data-action="compose">').text('Compose')
                                ),
                                $('<li role="presentation">').append(
                                    $('<a class="io-ox-action-link" data-action="reply">').text('Reply')
                                ),
                                $('<li role="presentation">').append(
                                    $('<a class="io-ox-action-link" data-action="forward">').text('Forward')
                                )
                            )
                        )
                    )
                )
            )
        );

        expect(window.getCSSPath(target)).to.equal('.io-ox-mail-window a[data-action="compose"]');
    });

    it('returns a data-action selector of a non unqiue link', () => {
        let target;

        $('#io-ox-windowmanager-pane').append(
            $('<div class="window-container io-ox-mail-window chromeless-window">').append(
                $('<div class="window-container-center">').append(
                    $('<div class="window-body classic-toolbar-visible">').append(
                        $('<div class="classic-toolbar-container">').append(
                            $('<ul class="classic-toolbar" role="toolbar">').append(
                                $('<li role="presentation">').append(
                                    $('<a class="io-ox-action-link" data-action="compose">').text('Compose')
                                ),
                                $('<li role="presentation">').append(
                                    $('<a class="io-ox-action-link" data-action="reply">').text('Reply')
                                ),
                                $('<li role="presentation">').append(
                                    $('<a class="io-ox-action-link" data-action="forward">').text('Forward')
                                )
                            )
                        ),
                        $('<div class="abs window-content vsplit preview-right">').append(
                            $('<ul>').append(
                                $('<li role="presentation">').append(
                                    $('<a class="io-ox-action-link" data-action="reply">').text('Reply')
                                ),
                                $('<li role="presentation">').append(
                                    target = $('<a class="io-ox-action-link" data-action="forward">').text('Forward')
                                )
                            )
                        )
                    )
                )
            )
        );

        expect(window.getCSSPath(target)).to.equal('.io-ox-mail-window .window-content a[data-action="forward"]');
    });
});
