#!/usr/bin/env python3
"""CORS-enabled HTTP server for backend config API."""
import argparse
import http.server
import os
import posixpath
from pathlib import Path
from urllib.parse import unquote, urlsplit


class ReusableHTTPServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True


class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def _is_blocked_path(self) -> bool:
        raw_path = unquote(urlsplit(self.path).path)
        normalized = posixpath.normpath("/" + raw_path.lstrip("/"))
        segments = [seg for seg in normalized.split("/") if seg]
        if any(seg.startswith(".") for seg in segments):
            return True
        if segments == ["server.py"]:
            return True
        return False

    def do_GET(self):
        if self._is_blocked_path():
            self.send_error(404, "File not found")
            return
        super().do_GET()

    def do_HEAD(self):
        if self._is_blocked_path():
            self.send_error(404, "File not found")
            return
        super().do_HEAD()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve backend config API locally.")
    parser.add_argument("port", nargs="?", type=int, default=5175)
    parser.add_argument("directory", nargs="?", default=os.path.dirname(os.path.abspath(__file__)))
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()
    serve_dir = str(Path(args.directory).resolve())
    handler = lambda *handler_args, **handler_kwargs: CORSHandler(
        *handler_args, directory=serve_dir, **handler_kwargs
    )
    print(f"Serving {serve_dir} on http://{args.host}:{args.port} with CORS enabled")
    ReusableHTTPServer((args.host, args.port), handler).serve_forever()
