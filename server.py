import http.server
import socketserver
import mimetypes
import os
import sys

# Ensure we are in the correct directory (where the script is)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Unconditional cache busting for development
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

# Fix MIME types for common files on Windows specifically
mimetypes.init()
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

print(f"Starting server on http://localhost:{PORT}")
print("Press Ctrl+C to stop.")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
except OSError as e:
    print(f"Error: {e}")
    print("Try waiting a few seconds or changing the PORT in server.py")
