#!/usr/bin/env python3
"""
Tuya Kids Companion Server
Serves the mobile web UI and handles live message streaming via SSE.
Run with: python3 server.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import threading
import queue
from datetime import datetime
from pathlib import Path

PORT = 8080
SCRIPT_DIR = Path(__file__).parent

# Thread-safe message storage and broadcast
message_store = []
message_lock = threading.Lock()
clients = []
clients_lock = threading.Lock()

def broadcast_message(data):
    """Send message to all connected SSE clients."""
    message = f"data: {json.dumps(data)}\n\n"
    with clients_lock:
        dead_clients = []
        for client_queue in clients:
            try:
                client_queue.put_nowait(message)
            except:
                dead_clients.append(client_queue)
        for dead in dead_clients:
            clients.remove(dead)

def store_message(event, message):
    """Store message for history."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    msg_data = {
        "event": event,
        "message": message,
        "timestamp": timestamp
    }
    with message_lock:
        message_store.append(msg_data)
        # Keep only last 100 messages
        if len(message_store) > 100:
            message_store.pop(0)
    return msg_data

class TuyaHandler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.serve_html()
        elif self.path == '/events':
            self.serve_sse()
        elif self.path == '/messages':
            self.serve_messages()
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == '/chatbot':
            self.handle_chatbot()
        else:
            self.send_error(404)

    def serve_html(self):
        """Serve the main HTML file."""
        html_path = SCRIPT_DIR / 'index.html'
        try:
            with open(html_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', len(content))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, 'index.html not found')

    def serve_sse(self):
        """Server-Sent Events endpoint for live message streaming."""
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        # Create a queue for this client
        client_queue = queue.Queue()
        with clients_lock:
            clients.append(client_queue)

        try:
            # Send initial connection message
            self.wfile.write(b"data: {\"event\":\"connected\",\"message\":\"Connected to Tuya\"}\n\n")
            self.wfile.flush()

            # Keep connection alive and send messages
            while True:
                try:
                    message = client_queue.get(timeout=30)
                    self.wfile.write(message.encode('utf-8'))
                    self.wfile.flush()
                except queue.Empty:
                    # Send keepalive
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            with clients_lock:
                if client_queue in clients:
                    clients.remove(client_queue)

    def serve_messages(self):
        """Return stored messages as JSON."""
        with message_lock:
            messages = list(message_store)

        content = json.dumps(messages).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(content))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(content)

    def handle_chatbot(self):
        """Handle incoming chatbot messages and broadcast to clients."""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        timestamp = datetime.now().strftime("%H:%M:%S")

        try:
            data = json.loads(body.decode('utf-8'))
            event = data.get('event', 'unknown')
            message = data.get('message', '')

            # Color coding for console output
            if event == 'user_speech':
                print(f"\n[{timestamp}] USER: {message}")
            elif event == 'ai_response':
                print(f"[{timestamp}] AI: {message}")
            elif event == 'ai_emotion':
                print(f"[{timestamp}] EMOTION: {message}")
            else:
                print(f"[{timestamp}] {event}: {message}")

            # Store and broadcast message
            msg_data = store_message(event, message)
            broadcast_message(msg_data)

        except json.JSONDecodeError:
            print(f"[{timestamp}] RAW: {body.decode('utf-8', errors='ignore')}")

        # Send OK response
        response = b'{"status":"ok"}'
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response))
        self.end_headers()
        self.wfile.write(response)

    def log_message(self, format, *args):
        # Suppress default logging for cleaner output
        pass

class ThreadedHTTPServer(HTTPServer):
    """Handle requests in separate threads."""
    def process_request(self, request, client_address):
        thread = threading.Thread(target=self.process_request_thread,
                                  args=(request, client_address))
        thread.daemon = True
        thread.start()

    def process_request_thread(self, request, client_address):
        try:
            self.finish_request(request, client_address)
        except Exception:
            self.handle_error(request, client_address)
        finally:
            self.shutdown_request(request)

def main():
    server = ThreadedHTTPServer(('0.0.0.0', PORT), TuyaHandler)
    print("=" * 50)
    print("  Tuya Kids Companion Server")
    print("=" * 50)
    print(f"  Web UI:    http://localhost:{PORT}")
    print(f"  Messages:  http://localhost:{PORT}/messages")
    print(f"  Chatbot:   POST http://localhost:{PORT}/chatbot")
    print("=" * 50)
    print("Waiting for connections...")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == '__main__':
    main()
