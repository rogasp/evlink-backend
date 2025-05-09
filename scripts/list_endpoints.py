import os
import re
import csv
import json
import uuid
from datetime import datetime
from pathlib import Path

BASE_PATH = Path("backend/app/api")
OUTPUT_CSV = Path("scripts/api_endpoint_report.csv")
OUTPUT_JSON = Path("scripts/api_endpoint_report.json")
OUTPUT_THUNDER = Path("scripts/evlink-api-thunder-collection.json")

endpoint_pattern = re.compile(r"@(router|app)\.(get|post|patch|delete)\((.*?)\)")
auth_pattern = re.compile(r"Depends\((.*?)\)")

rows = [("File", "Method", "Path", "Auth Level")]
json_output = []
thunder_requests = []

collection_id = str(uuid.uuid4())
timestamp = datetime.utcnow().isoformat()
ref_id = str(uuid.uuid4())

def gen_id():
    return str(uuid.uuid4())

sort = 10000

for root, _, files in os.walk(BASE_PATH):
    for file in files:
        if file.endswith(".py"):
            path = Path(root) / file
            with open(path, "r") as f:
                lines = f.readlines()

            for i, line in enumerate(lines):
                match = endpoint_pattern.search(line)
                if match:
                    method = match.group(2).upper()
                    path_str = match.group(3).strip().strip("\"").strip("'")

                    # Look ahead a few lines for Depends()
                    auth_level = "none"
                    for j in range(i, min(i + 5, len(lines))):
                        auth_match = auth_pattern.search(lines[j])
                        if auth_match:
                            if "require_admin" in auth_match.group(1):
                                auth_level = "admin"
                            elif "require_user" in auth_match.group(1):
                                auth_level = "user"
                            break

                    rows.append((str(path), method, path_str, auth_level))
                    json_output.append({
                        "file": str(path),
                        "method": method,
                        "path": path_str,
                        "auth": auth_level
                    })

                    full_path = "{{BASE_URL}}" + path_str if not path_str.startswith("/") else "{{BASE_URL}}" + path_str

                    def build_request(name, auth_type=None, token_var=None, expect=None):
                        req = {
                            "_id": gen_id(),
                            "colId": collection_id,
                            "containerId": "",
                            "name": name,
                            "url": full_path,
                            "method": method,
                            "headers": [],
                            "sortNum": sort + 1,
                            "created": timestamp,
                            "modified": timestamp
                        }
                        if auth_type == "bearer":
                            req["auth"] = {"type": "bearer", "bearer": token_var}
                        elif auth_type == "noauth":
                            req["auth"] = {"type": "noauth"}
                        else:
                            req["auth"] = {"type": "noauth"}

                        return req

                    if auth_level == "admin":
                        thunder_requests.extend([
                            build_request(f"{method} {path_str} (admin)", "bearer", "{{ADMIN_TOKEN}}"),
                            build_request(f"{method} {path_str} (user)", "bearer", "{{USER_TOKEN}}"),
                            build_request(f"{method} {path_str} (no token)", "noauth")
                        ])
                    elif auth_level == "user":
                        thunder_requests.extend([
                            build_request(f"{method} {path_str} (user)", "bearer", "{{USER_TOKEN}}"),
                            build_request(f"{method} {path_str} (no token)", "noauth")
                        ])
                    else:
                        thunder_requests.append(
                            build_request(f"{method} {path_str} (public)", "noauth")
                        )

# Write CSV
OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
with open(OUTPUT_CSV, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

# Write JSON
with open(OUTPUT_JSON, "w") as f:
    json.dump(json_output, f, indent=2)

# Write Thunder 1.2 Collection
thunder_export = {
    "clientName": "Thunder Client",
    "collectionName": "EVLink API Auto-Test",
    "collectionId": collection_id,
    "dateExported": timestamp,
    "version": "1.2",
    "folders": [],
    "requests": thunder_requests,
    "settings": {
        "options": {
            "baseUrl": "{{BASE_URL}}"
        }
    },
    "ref": ref_id
}

with open(OUTPUT_THUNDER, "w") as f:
    json.dump(thunder_export, f, indent=2)

print(f"✅ Thunder collection, CSV, and JSON report generated:")
print(f"- {OUTPUT_THUNDER}")
print(f"- {OUTPUT_CSV}")
print(f"- {OUTPUT_JSON}")
