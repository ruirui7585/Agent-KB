#!/usr/bin/env python3
"""Small localhost preview server with a project-local annotation API."""

from __future__ import annotations

import argparse
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
ANNOTATIONS = ROOT / "annotations.json"
MAX_BODY = 1024 * 1024


class Handler(BaseHTTPRequestHandler):
    server_version = "SalfaPrototype/1.0"

    def _send_json(self, status: int, payload: object) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_annotations(self) -> object:
        try:
            with ANNOTATIONS.open("r", encoding="utf-8") as stream:
                return json.load(stream)
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError("annotations.json is unavailable or invalid") from exc

    def do_GET(self) -> None:  # noqa: N802
        path = unquote(urlsplit(self.path).path)
        if path == "/api/annotations":
            try:
                self._send_json(200, self._read_annotations())
            except ValueError as exc:
                self._send_json(500, {"error": str(exc)})
            return
        self._serve_static(path)

    def do_POST(self) -> None:  # noqa: N802
        path = unquote(urlsplit(self.path).path)
        if path != "/api/annotations":
            self._send_json(404, {"error": "not found"})
            return
        try:
            size = int(self.headers.get("Content-Length", "-1"))
        except ValueError:
            size = -1
        if size < 0 or size > MAX_BODY:
            self._send_json(413, {"error": "request body too large or missing"})
            return
        try:
            payload = json.loads(self.rfile.read(size).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"error": "expected valid UTF-8 JSON"})
            return
        if not isinstance(payload, dict) or not isinstance(payload.get("annotations"), list):
            self._send_json(400, {"error": "expected a JSON object with an annotations array"})
            return
        temporary = ANNOTATIONS.with_suffix(".json.tmp")
        try:
            with temporary.open("w", encoding="utf-8") as stream:
                json.dump(payload, stream, ensure_ascii=False, indent=2)
                stream.write("\n")
            os.replace(temporary, ANNOTATIONS)
        except OSError as exc:
            try:
                temporary.unlink(missing_ok=True)
            except OSError:
                pass
            self._send_json(500, {"error": f"could not save annotations: {exc}"})
            return
        self._send_json(200, payload)

    def _serve_static(self, path: str) -> None:
        relative = "index.html" if path in ("", "/") else path.lstrip("/")
        candidate = (ROOT / relative).resolve()
        try:
            candidate.relative_to(ROOT)
        except ValueError:
            self._send_json(404, {"error": "not found"})
            return
        if not candidate.is_file():
            self._send_json(404, {"error": "not found"})
            return
        content = candidate.read_bytes()
        content_types = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".jpg": "image/jpeg"}
        self.send_response(200)
        self.send_header("Content-Type", content_types.get(candidate.suffix, "application/octet-stream"))
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"{self.address_string()} - {fmt % args}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Preview the Room PK prototype locally.")
    parser.add_argument("--port", type=int, default=8775)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Serving {ROOT} at http://127.0.0.1:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
