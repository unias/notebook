#encoding: utf-8
"""Tornado handlers for the terminal emulator."""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from tornado import web
from ..base.handlers import IPythonHandler, path_regex
from ..utils import url_escape
from ..utils import url_path_join, url_escape

class ViewerHandler(IPythonHandler):
    """Render the text editor interface."""
    def generate_breadcrumbs(self, path):
        breadcrumbs = [(url_path_join(self.base_url, 'tree'), '')]
        parts = path.split('/')
        for i in range(len(parts)):
            if parts[i]:
                link = url_path_join(self.base_url, 'tree',
                    url_escape(url_path_join(*parts[:i+1])),
                )
                breadcrumbs.append((link, parts[i]))
        return breadcrumbs
    @web.authenticated
    def get(self, path):
        path = path.strip('/')
        if not self.contents_manager.file_exists(path):
            raise web.HTTPError(404, u'File does not exist: %s' % path)

        basename = path.rsplit('/', 1)[-1]
        breadcrumbs=self.generate_breadcrumbs(path)
        self.write(self.render_template('view.html',
            file_path=url_escape(path),
            basename=basename,
            breadcrumbs=breadcrumbs,
            page_title=basename + " (editing)",
            )
        )

default_handlers = [
    (r"/view%s" % path_regex, ViewerHandler),
]
