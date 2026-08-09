from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# -----------------------------
# DATABASE CONNECTION
# -----------------------------
def get_db():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

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

    print(f"RECEIVED: date={date!r}, loc={loc!r}, route={route!r}", flush=True)

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM driver_records WHERE date = %s AND loc = %s AND route = %s LIMIT 1", (date, loc, route))
    row = cur.fetchone()
    print(f"QUERY RESULT: {row!r}", flush=True)
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
        SELECT *
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
        "isSigned", "created_at", "updated_at"
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
            updated_at=NOW()
        WHERE date=%s AND loc=%s AND route=%s
    """, (
        f["leftInBayP1"], f["leftInBayR1"],
        f["leftInBayP2"], f["leftInBayR2"],
        f["leftInBayP3"], f["leftInBayR3"],
        f["bulkLeftP1"], f["bulkLeftP2"], f["bulkLeftP3"],
        f["bulkLeftP4"], f["bulkLeftP5"], f["bulkLeftP6"],
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

    conn = get_db()
    cur = conn.cursor()

    fString = f"""
            UPDATE driver_records
            SET isSigned=%s, updated_at=NOW()
            WHERE date=%s AND loc=%s AND route=%s
        """

    cur.execute(fString, (appBy, date, loc, route))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success"}


# -----------------------------
# RUN SERVER (Render)
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
