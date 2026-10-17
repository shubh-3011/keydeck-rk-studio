"""Static loopback server for Keydeck. It has no device or profile API."""

from __future__ import annotations

import argparse
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
HOST = "127.0.0.1"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format_string, *args):
        print(f"{self.address_string()} - {format_string % args}")


def serve(port: int = 8765) -> ThreadingHTTPServer:
    return ThreadingHTTPServer((HOST, port), Handler)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve Keydeck on this PC.")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = serve(args.port)
    print(f"Keydeck: http://{HOST}:{server.server_address[1]}")
    print("Static files only. HID reports are never opened or sent.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
