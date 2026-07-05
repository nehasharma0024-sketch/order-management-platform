#!/usr/bin/env python3
"""Local dev server that mimics Vercel's SPA rewrite (see vercel.json):
any request for a path that isn't a real file on disk falls back to
index.html, so client-side routes like /admin and /catalogue/<id>
work the same way here as they do on Vercel.
"""
import http.server
import os
import sys


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path.split('?', 1)[0])
        if not os.path.isfile(path):
            self.path = '/index.html'
        return super().do_GET()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.test(HandlerClass=SPARequestHandler, port=port, bind='127.0.0.1')
