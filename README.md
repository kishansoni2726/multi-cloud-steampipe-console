# 🌩️ Multi‑Cloud Unified Visibility Console (Steampipe + FastAPI + React)

This project provides a **single unified console** to view **instances, storage, and billing-related metadata** across **AWS, Azure, and GCP** using **Steampipe** as the data abstraction layer.

It is designed for:

* Multi‑cloud visibility
* Centralized cloud inventory
* Cost & usage exploration
* Learning / internal tooling

---

## 🧠 How it Works (High Level)

```
AWS / Azure / GCP
        ↓
     Steampipe
        ↓
     FastAPI
        ↓
      React UI
```

* **Steampipe** queries cloud APIs using SQL
* **FastAPI** exposes REST APIs
* **React** renders tables/charts in the browser
* Everything runs **locally**

---

## 📦 What This App Shows

From **multiple cloud environments**, in a **single unified view**:

### ✅ Storage

* AWS S3 Buckets
* Azure Storage Accounts
* GCP Cloud Storage Buckets

### ✅ Instances *(extensible)*

* AWS EC2
* Azure Virtual Machines
* GCP Compute Engine

### ✅ Billing / Cost Metadata *(where supported)*

* AWS billing-related tables
* Azure invoice metadata
* GCP billing account information

> ⚠️ Note: Exact billing granularity depends on cloud permissions and Steampipe plugins.

---

## 🛠️ Prerequisites

### 1️⃣ Install Steampipe

```bash
sudo apt update
sudo apt install -y curl unzip
curl -fsSL https://steampipe.io/install/steampipe.sh | sudo sh
```

Verify:

```bash
steampipe --version
```

Start Steampipe service:

```bash
steampipe service start
```

---

### 2️⃣ Install Cloud CLIs

#### 🔹 AWS CLI

```bash
sudo apt update
sudo apt install -y awscli
aws configure
```

#### 🔹 Azure CLI

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

#### 🔹 Google Cloud CLI

```bash
sudo apt update
sudo apt install -y apt-transport-https ca-certificates gnupg
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt update
sudo apt install -y google-cloud-cli
gcloud auth application-default login
```

---

### 3️⃣ Steampipe Plugins

Steampipe will auto-download plugins on first query, but you can install manually:

```bash
steampipe plugin install aws
steampipe plugin install azure
steampipe plugin install gcp
```

Verify plugins:

```bash
steampipe plugin list
```

---

## 🧩 Backend Setup (FastAPI)

### Requirements

* Python 3.9+

Install dependencies:

```bash
pip3 install fastapi uvicorn
```

### Run Backend

```bash
python3 -m uvicorn main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

Example endpoints:

* `/storage/aws`
* `/storage/azure`
* `/storage/gcp`
* `/storage/all`

---

## 🎨 Frontend Setup (React)

### Install Dependencies

```bash
npm install
```

### Start UI

```bash
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🧪 Example APIs

```http
GET /storage/aws
GET /storage/azure
GET /storage/gcp
GET /storage/all
```

All endpoints return **normalized JSON arrays** suitable for tables and charts.

---

## 🔐 Permissions Notes

* AWS: Requires read access (S3, EC2, billing where applicable)
* Azure: Reader role is sufficient for inventory
* GCP: Viewer role + billing access for cost data

---

## 🚀 Future Enhancements

* Pagination & filtering
* Unified cost dashboard
* Charts & trends
* Authentication / RBAC
* Switch to Steampipe PostgreSQL (no CLI subprocess)
* Deploy as internal dashboard

---

## 📄 License

This project is for **learning and internal use**. Customize freely.

---

## 🙌 Credits

* [Steampipe](https://steampipe.io)
* FastAPI
* React

Happy multi‑cloud exploring ☁️☁️☁️
