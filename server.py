import http.server
import socketserver
import urllib.request
import urllib.error
import os

PORT = 4200
TARGET_API = "http://localhost:8080"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_proxy(self):
        url = TARGET_API + self.path
        
        req_headers = {}
        for k, v in self.headers.items():
            if k.lower() not in ['host', 'connection', 'content-length']:
                req_headers[k] = v
        
        data = None
        if self.command in ['POST', 'PUT', 'PATCH']:
            length = int(self.headers.get('Content-Length', 0))
            if length > 0:
                data = self.rfile.read(length)

        req = urllib.request.Request(url, data=data, headers=req_headers, method=self.command)
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                self.send_response(response.status)
                for k, v in response.getheaders():
                    if k.lower() not in ['transfer-encoding', 'connection']:
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for k, v in e.headers.items():
                if k.lower() not in ['transfer-encoding', 'connection']:
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())

    def do_GET(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            path = self.translate_path(self.path)
            if not os.path.exists(path):
                self.path = '/index.html'
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            self.send_error(405, "Method Not Allowed")
            
    def do_PUT(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            self.send_error(405, "Method Not Allowed")
            
    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            self.send_error(405, "Method Not Allowed")

    def do_OPTIONS(self):
        if self.path.startswith('/api/'):
            self.do_proxy()
        else:
            self.send_response(200)
            self.end_headers()

with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    print("Serving at port", PORT, "and proxying /api/ to", TARGET_API)
    httpd.serve_forever()
