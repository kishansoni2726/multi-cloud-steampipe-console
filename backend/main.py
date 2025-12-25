import traceback
from fastapi import FastAPI, HTTPException
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
# (Optional) Health check
# ============================================================
@app.get("/")
def root():
    return {"status": "ok"}


# ============================================================
#           AWS APIs
# ============================================================

# ---------- AWS S3 ----------
@app.get("/storage/aws")
def aws_storage():
    query = """
select 
  b.name as "Bucket Name",
  b.region as "Region",
  b.creation_date as "Creation Time",
  coalesce(sum(o.size) / (1024*1024*1024), 0) as "Total size GBs",
  count(o.key) as "Object Count"
from 
  aws_s3_bucket b
  left join aws_s3_object o on b.name = o.bucket_name
group by 
  b.name, b.region, b.creation_date
order by 
  "Total size GBs" desc; 
    """
    return steampipe_query(query)



# ---------- AWS EC2 Instances ----------
@app.get("/compute/aws")
def aws_ec2_instances():
    query = """
SELECT 
    instance_id as "Instance ID",
    instance_state as "Instance State",
    image_id as "Image ID",
    instance_type "Instance Type",
    launch_time as "Launch Time",
    public_ip_address as "Public IP Address",
    ((launch_template_data->'BlockDeviceMappings'->0->'Ebs'->>'VolumeSize')::int) as "Volume Size"

    
    FROM aws_ec2_instance;

    """
    return steampipe_query(query)

# ---------- AWS billing ----------
@app.get("/billing/aws")
def aws_billing_simple():
    try:
        service_query = """
        select 
          service,
          round(sum(unblended_cost_amount)::numeric, 2) as cost
        from 
          aws_cost_by_service_daily
        group by 
          service
        order by 
          cost desc
          limit 10;
        """

        total_query = """
        select
          round(sum(unblended_cost_amount)::numeric, 2) as total_cost
        from
          aws_cost_by_service_daily;
        """

        service_results = steampipe_query(service_query)
        total_result = steampipe_query(total_query)

        services = [
            {
                "service": row["service"],
                "cost": float(row["cost"]) if row["cost"] else 0
            }
            for row in service_results
        ]

        total_cost = (
            float(total_result[0]["total_cost"])
            if total_result and total_result[0]["total_cost"]
            else 0
        )

        return {
            "total_cost": total_cost,
            "services": services
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/billing/aws")
def aws_billing_simple():
    try:
        query = """
        select
          round(sum(unblended_cost_amount)::numeric, 2) as total_cost
        from aws_cost_by_service_daily;
        """

        result = steampipe_query(query)

        total_cost = 0.0
        if result and isinstance(result[0], dict):
            total_cost = float(result[0].get("total_cost", 0))

        return {"total_cost": total_cost}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
#                   Azure APIs
# ============================================================

@app.get("/storage/azure")
def azure_storage():
    query = """
SELECT 
  sa.name as "Storage Account",
  sa.primary_location as "Location",
  sa.creation_time as "Creation Time",
  (
    SELECT COUNT(*) 
    FROM azure_all.azure_storage_blob sb 
    WHERE sb.storage_account_name = sa.name 
      AND sb.resource_group = sa.resource_group
  ) as "Blob Count",
  (
    SELECT ROUND(COALESCE(SUM(content_length), 0) / (1024.0 * 1024.0 * 1024.0), 2)
    FROM azure_all.azure_storage_blob sb 
    WHERE sb.storage_account_name = sa.name 
      AND sb.resource_group = sa.resource_group
  ) as "Total Size (GB)"
FROM 
  azure_all.azure_storage_account sa
ORDER BY 
  "Total Size (GB)" DESC NULLS LAST;

    """
    return steampipe_query(query)


@app.get("/compute/azure")
def azure_storage():
    query = """
select
  name as "Instance Name",
  power_state as "Instance State",
  public_ips as "Public IP Address",
  vm_id as "Instance ID",
  size as "Instance Type",
  resource_group as "Resource Group"
from
  azure_compute_virtual_machine;
    """
    return steampipe_query(query)


@app.get("/billing/azure")
def aws_billing_simple():
    try:
        service_query = """
          select
            split_part(legacy_usage_detail ->> 'ResourceID', '/', 7) as resource_type,
            round(
              sum((legacy_usage_detail ->> 'Cost')::numeric),
              2
            ) as cost
          from
            azure_consumption_usage
          where
            kind = 'legacy'
            and metric = 'actualcost'
            and (legacy_usage_detail ->> 'BillingPeriodStartDate')::date
                >= date_trunc('month', current_date)
          group by
            resource_type
          order by
            cost desc
          limit 10;
        """

        total_query = """
        select
          coalesce(round(sum((legacy_usage_detail ->> 'Cost')::numeric),2),0) as total_cost,
          max(legacy_usage_detail ->> 'BillingCurrency') as currency
        from
          azure_consumption_usage
        where
          kind = 'legacy'
          and metric = 'actualcost'
          and (legacy_usage_detail ->> 'BillingPeriodStartDate')::date >= date_trunc('month', current_date);
        """

        service_results = steampipe_query(service_query)
        total_result = steampipe_query(total_query)

        services = [
            {
                "service": row["service"],
                "cost": float(row["cost"]) if row["cost"] else 0
            }
            for row in service_results
        ]

        total_cost = (
            float(total_result[0]["total_cost"])
            if total_result and total_result[0]["total_cost"]
            else 0
        )

        return {
            "total_cost": total_cost,
            "services": services
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ============================================================
#                   GCP APIs
# ============================================================


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



# ============================================================
#                   ALL Cloud  APIs
# ============================================================

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