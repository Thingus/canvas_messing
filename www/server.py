from http.server import *
import sys

SimpleHTTPRequestHandler.extensions_map[".js"] = "text/javascript"


class CustomServer(ThreadingHTTPServer):
    def finish_request(self, request, client_address):
        self.RequestHandlerClass(request, client_address, self)


with CustomServer(("", 8000), SimpleHTTPRequestHandler) as httpd:
    host, port = httpd.socket.getsockname()[:2]
    url_host = f"[{host}]" if ":" in host else host
    print(f"Serving HTTP on {host} port {port} " f"(http://{url_host}:{port}/) ...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received, exiting.")
        sys.exit(0)
