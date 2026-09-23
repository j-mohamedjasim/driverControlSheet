from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import psycopg2
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# -----------------------------
# DATABASE CONNECTION
# -----------------------------
def get_db():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def todayDate():
    today = datetime.today()
    tdate = today.strftime('%Y-%m-%d')
    return tdate

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.route("/get-records", methods=["POST", "OPTIONS"])
def get_records():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    data = request.json
    date = data["date"]
    loc = data["loc"]
    route = data["route"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, date, loc, route, name, scanner, printer, sparebattery, count, requestedClear, isTransferred, leftInBayP1, leftInBayR1, leftInBayP2, leftInBayR2, leftInBayP3, leftInBayR3, bulkLeftP1, bulkLeftP2, bulkLeftP3, bulkLeftP4, bulkLeftP5, bulkLeftP6, isSigned, rdna, timecards FROM driver_records WHERE date = %s AND loc = %s AND route = %s LIMIT 1", (date, loc, route))
    row = cur.fetchone()

    if not row:
        return jsonify({"error": "not found"}), 404
    columns = [desc[0] for desc in cur.description]
    cur.close()
    conn.close()
    return jsonify(dict(zip(columns, row)))
    
# -----------------------------
# SELECT RECORD
# -----------------------------
@app.route("/get-record", methods=["POST"])
def get_record():
    body = request.json
    date = body["date"]
    loc = body["loc"]
    route = body["route"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, date, loc, route, name, scanner, printer, sparebattery, count, requestedClear, isTransferred, leftInBayP1, leftInBayR1, leftInBayP2, leftInBayR2, leftInBayP3, leftInBayR3, bulkLeftP1, bulkLeftP2, bulkLeftP3, bulkLeftP4, bulkLeftP5, bulkLeftP6, isSigned, created_at, updated_at, rdna, timecards
        FROM driver_records
        WHERE date=%s AND loc=%s AND route=%s
    """, (date, loc, route))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {"error": "Record not found. Please speak to debrief."}, 404

    columns = [
        "id", "date", "loc", "route",
        "name", "scanner", "printer", "sparebattery", "count",
        "requestedClear", "isTransferred",
        "leftInBayP1", "leftInBayR1",
        "leftInBayP2", "leftInBayR2",
        "leftInBayP3", "leftInBayR3",
        "bulkLeftP1", "bulkLeftP2", "bulkLeftP3",
        "bulkLeftP4", "bulkLeftP5", "bulkLeftP6",
        "isSigned", "rdna", "timecards", "created_at", "updated_at"
    ]

    return {
        "columns": columns,
        "row": row
    }


# -----------------------------
# UPDATE RECORD
# -----------------------------
@app.route("/update-record", methods=["POST"])
def update_record():
    body = request.json
    date = body["date"]
    loc = body["location"]
    route = body["route"]
    f = body["fields"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE driver_records
        SET
            leftInBayP1=%s,
            leftInBayR1=%s,
            leftInBayP2=%s,
            leftInBayR2=%s,
            leftInBayP3=%s,
            leftInBayR3=%s,
            bulkLeftP1=%s,
            bulkLeftP2=%s,
            bulkLeftP3=%s,
            bulkLeftP4=%s,
            bulkLeftP5=%s,
            bulkLeftP6=%s,
            rdna=%s,
            timecards=%s,
            updated_at=NOW()
        WHERE date=%s AND loc=%s AND route=%s
    """, (
        f["leftInBayP1"], f["leftInBayR1"],
        f["leftInBayP2"], f["leftInBayR2"],
        f["leftInBayP3"], f["leftInBayR3"],
        f["bulkLeftP1"], f["bulkLeftP2"], f["bulkLeftP3"],
        f["bulkLeftP4"], f["bulkLeftP5"], f["bulkLeftP6"],
        f["rdnaStatus"], f["timeStatus"],
        date, loc, route
    ))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success"}

@app.route("/request-clear", methods=["POST"])
def request_clear():
    body = request.json
    date = body["date"]
    loc = body["loc"]
    route = body["route"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE driver_records
        SET requestedClear='Yes', updated_at=NOW()
        WHERE date=%s AND loc=%s AND route=%s
    """, (date, loc, route))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success"}

@app.route("/update-aprovals", methods=["POST"])
def updateApprovals():
    body = request.json
    date = body["date"]
    loc = body["loc"]
    route = body["route"]
    appBy = body["appBy"]
    leftInBayP1 = body["leftInBayP1"]
    leftInBayR1 = body["leftInBayR1"]
    leftInBayP2 = body["leftInBayP2"]
    leftInBayR2 = body["leftInBayR2"]
    leftInBayP3 = body["leftInBayP3"]
    leftInBayR3 = body["leftInBayR3"]

    bulkLeftP1 = body["bulkLeftP1"]
    bulkLeftP2 = body["bulkLeftP2"]
    bulkLeftP3 = body["bulkLeftP3"]
    bulkLeftP4 = body["bulkLeftP4"]
    bulkLeftP5 = body["bulkLeftP5"]
    bulkLeftP6 = body["bulkLeftP6"]

    rdnaStatus = body["rdnaStatus"]
    timeStatus = body["timeStatus"]

    conn = get_db()
    cur = conn.cursor()

    fString = f"""
            UPDATE driver_records
            SET isSigned=%s, leftInBayP1=%s, leftInBayR1=%s, leftInBayP2=%s, leftInBayR2=%s,leftInBayP3=%s, leftInBayR3=%s, bulkLeftP1=%s, bulkLeftP2=%s, bulkLeftP3=%s, bulkLeftP4=%s, bulkLeftP5=%s, bulkLeftP6=%s, rdna=%s, timecards=%s, updated_at=NOW()
            WHERE date=%s AND loc=%s AND route=%s
        """

    cur.execute(fString, (appBy, leftInBayP1, leftInBayR1, leftInBayP2, leftInBayR2, leftInBayP3, leftInBayR3, bulkLeftP1, bulkLeftP2, bulkLeftP3, bulkLeftP4, bulkLeftP5, bulkLeftP6, rdnaStatus, timeStatus, date, loc, route))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success"}

# get CEBS information and to show in the outbrief page.
@app.route("/get-record-cebs", methods=["POST"])
def get_cebs():
    body = request.json
    date = body["date"]
    loc = body["loc"]
    route = body["route"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT *
        FROM cebs
        WHERE due_date=%s AND location=%s AND route=%s
    """, (date, loc, route))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    columns = [
        "id", "date", "route", "due_date", "type", "tracking", "address", "instruction", "status", "not_complete_status", "req_by", "req_pin", "driver_name", "location"
    ]

    return {
        "columns": columns,
        "rows": rows
    }

@app.route("/update-cebs-not-complete", methods=["POST"])
def update_cebs_not_complete():
    body = request.json
    id = body["id"]
    not_complete_status = body["not_complete_status"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE cebs
        SET not_complete_status=%s, status=%s
        WHERE id=%s
    """, (not_complete_status, '', id))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success"}

@app.route("/update-cebs-status", methods=["POST"])
def update_cebs_status():
    body = request.json
    id = body["id"]
    status = body["status"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE cebs
        SET status=%s, not_complete_status=%s
        WHERE id=%s
    """, (status, '', id))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success"}

#the below code is to save photo during baycheck.

@app.route("/upload-photo", methods=["POST"])
def upload_photo():
    if "photo" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["photo"]
    blob = file.read()

    loc = request.form.get("loc")
    route = request.form.get("route")
    date = request.form.get("date")

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE driver_records
        SET photo = %s
        WHERE date = %s AND loc = %s AND route = %s
        RETURNING route;
    """, (psycopg2.Binary(blob), date, loc, route))

    updated = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()

    if not updated:
        return jsonify({"error": "Record not found"}), 404

    return jsonify({"status": "updated", "route": updated[0]})

@app.route("/get-photo", methods=["POST"])
def get_photo():
    data = request.json
    loc = data["loc"]
    route = data["route"]
    date = data["date"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT photo
        FROM driver_records
        WHERE date = %s AND loc = %s AND route = %s
        LIMIT 1;
    """, (date, loc, route))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row or not row[0]:
        return jsonify({"error": "No photo found"}), 404

    image_bytes = row[0]

    return Response(image_bytes, mimetype="image/jpeg")

#--------------------------------------------
#Security checks before the driver departs
#--------------------------------------------

@app.route("/api/outbriefed-routes", methods=['POST'])
def outbriefed_routes():
    data = request.get_json()
    location = data.get("location")
    tdate = todayDate()
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT route,
               name,
               isoutbriefed
        FROM driver_records
        WHERE isoutbriefed = %s AND date =%s AND loc =%s
        ORDER BY route ASC
    """,('Yes', tdate, location))

    rows = cursor.fetchall()

    data = [
        {
            "route": row[0],
            "driver_name": row[1],
            "outbrief": row[2]
        }
        for row in rows
    ]

    cursor.close()
    conn.close()

    return jsonify(data)


# -----------------------------
# RUN SERVER (Render)
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
