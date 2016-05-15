// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
__webpack_public_path__ = window['staticURL'] + 'view/js/built/';

requirejs(['contents'], function(contents) {
require([
    'base/js/namespace',
    'base/js/utils',
    'base/js/page',
    'base/js/events',
    'services/config',
    'view/js/editor',
], function(
    IPython,
    utils,
    page,
    events,
    configmod,
    editmod
    ){
    "use strict";
    requirejs(['custom/custom'], function() {});
    
    page = new page.Page();

    var base_url = utils.get_body_data('baseUrl');
    var file_path = utils.get_body_data('filePath');
    var config = new configmod.ConfigSection('edit', {base_url: base_url});
    config.load();
    var common_config = new configmod.ConfigSection('common', {base_url: base_url});
    common_config.load();
    contents = new contents.Contents({
        base_url: base_url,
        common_config: common_config
    });
    
    var editor = new editmod.Editor('#texteditor-container', {
        base_url: base_url,
        events: events,
        contents: contents,
        file_path: file_path,
        config: config,
    });
    
    // Make it available for debugging
    IPython.editor = editor;
    
    utils.load_extensions_from_config(config);
    utils.load_extensions_from_config(common_config);
    editor.load();
    page.show();

});
});
