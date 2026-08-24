import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_3YIMrWPwa7Tj@ep-gentle-cake-zatx91oj-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute("""
    ALTER TABLE driver_records
    ADD COLUMN timecards TEXT
""")

conn.commit()
cur.close()
conn.close()