from http.server import BaseHTTPRequestHandler, HTTPServer
from github import Github
import json
import os
import ast

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_NAME = os.environ.get("REPO_NAME")
FILE_PATH = "data.js"

print("TOKEN:", GITHUB_TOKEN)
print("REPO:", REPO_NAME)
print("FILE:", FILE_PATH)

import sys
sys.stdout.flush()

PORT = int(os.environ.get("PORT", 8000))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read JSON payload
            content_length = int(self.headers["Content-Length"])
            body = self.rfile.read(content_length)
            payload = json.loads(body)

            date = payload.get("date")
            loc = payload.get("location")
            route = payload.get("route")
            updated_fields = payload.get("fields")

            if not all([date, loc, route, updated_fields]):
                self.send_error_response(400, "Missing required data")
                return

            # Connect to GitHub
            g = Github(GITHUB_TOKEN)
            repo = g.get_repo(REPO_NAME)

            # Read file
            file_content = repo.get_contents(FILE_PATH)
            current_text = file_content.decoded_content.decode("utf-8")

            # Extract JS object
            json_text = current_text.split("=", 1)[1].strip()
            if json_text.endswith(";"):
                json_text = json_text[:-1]

            # Convert JS object → Python dict
            driver_records = ast.literal_eval(json_text)

            # Validate structure
            if date not in driver_records:
                driver_records[date] = {}
            if loc not in driver_records[date]:
                driver_records[date][loc] = {}
            if route not in driver_records[date][loc]:
                self.send_error_response(404, "Record not found")
                return

            # Update fields
            driver_records[date][loc][route].update(updated_fields)

            # Convert back to JS file
            new_text = "const driverRecords = " + json.dumps(driver_records, indent=2) + ";\n"

            # Push update to GitHub
            repo.update_file(
                path=FILE_PATH,
                message=f"Update record: {date}/{loc}/{route}",
                content=new_text,
                sha=file_content.sha
            )

            # Success response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode())

        except Exception as e:
            self.send_error_response(500, str(e))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), handler)
    print(f"Server running on port {PORT}")
    server.serve_forever()
