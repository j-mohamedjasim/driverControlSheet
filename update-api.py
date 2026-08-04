from http.server import BaseHTTPRequestHandler, HTTPServer
from github import Github
import json
import os

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_NAME = os.environ.get("REPO_NAME")
FILE_PATH = "data.js"

print("TOKEN:", GITHUB_TOKEN)
print("REPO:", REPO_NAME)
print("FILE:", FILE_PATH)


PORT = int(os.environ.get("PORT", 8000))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
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

            g = Github(GITHUB_TOKEN)
            repo = g.get_repo(REPO_NAME)

            file_content = repo.get_contents(FILE_PATH)
            current_text = file_content.decoded_content.decode("utf-8")

            json_text = current_text.split("=", 1)[1].strip()
            if json_text.endswith(";"):
                json_text = json_text[:-1]
            driver_records = json.loads(json_text)

            if date not in driver_records:
                driver_records[date] = {}
            if loc not in driver_records[date]:
                driver_records[date][loc] = {}
            if route not in driver_records[date][loc]:
                self.send_error_response(404, "Record not found")
                return

            driver_records[date][loc][route].update(updated_fields)

            new_text = "const driverRecords = " + json.dumps(driver_records, indent=2) + ";\n"

            repo.update_file(
                path=FILE_PATH,
                message=f"Update record: {date}/{loc}/{route}",
                content=new_text,
                sha=file_content.sha
            )

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
