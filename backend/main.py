from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json

app = FastAPI()

# -------------------------------
# CORS (React dev server)
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Steampipe binary path
# -------------------------------
STEAMPIPE = "/opt/homebrew/bin/steampipe"


# -------------------------------
# Helper: run Steampipe query
# -------------------------------
def steampipe_query(query: str):
    result = subprocess.run(
        [STEAMPIPE, "query", query, "--output", "json"],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return {"error": result.stderr}

    data = json.loads(result.stdout)

    # Normalize Steampipe output -> always return rows array
    if isinstance(data, dict) and "rows" in data:
        return data["rows"]

    return data


# ============================================================
# STORAGE APIs
# ============================================================

# ---------- AWS S3 ----------
@app.get("/storage/aws")
def aws_storage():
    query = """
    select
      name,
      region,
      creation_date
    from aws_s3_bucket;
    """
    return steampipe_query(query)


# ---------- Azure Storage Accounts ----------
@app.get("/storage/azure")
def azure_storage():
    query = """
    select
      name,
      primary_location as location,
      kind,
      sku_name
    from azure_storage_account;
    """
    return steampipe_query(query)


# ---------- GCP Storage Buckets ----------
@app.get("/storage/gcp")
def gcp_storage():
    query = """
    select
      name,
      location,
      storage_class,
      time_created
    from gcp_storage_bucket;
    """
    return steampipe_query(query)


# ---------- Unified Storage (All Clouds) ----------
@app.get("/storage/all")
def all_storage():
    query = """
    select
      'AWS' as cloud,
      name,
      region as location,
      creation_date as created_at,
      null as type
    from aws_s3_bucket

    union all

    select
      'Azure' as cloud,
      name,
      primary_location as location,
      null as created_at,
      kind as type
    from azure_storage_account

    union all

    select
      'GCP' as cloud,
      name,
      location,
      time_created as created_at,
      storage_class as type
    from gcp_storage_bucket;
    """
    return steampipe_query(query)


# ============================================================
# (Optional) Health check
# ============================================================
@app.get("/")
def root():
    return {"status": "ok"}
