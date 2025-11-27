## 🛠️ **Product Feedback Accelerator Workshop**


This workshop will guide you through building a high-performance, AI-powered system designed to **rapidly analyze and respond to user feedback** for products. You'll learn how to leverage Google Cloud services and the Gemini API/Vertex AI to transform raw customer ratings and comments into actionable insights, significantly improving customer response times and overall user satisfaction.

### **What You Will Build**

You will create a comprehensive back-end service that automates the processing of user feedback. The core functions of this API include:

* **Ratings Retrieval:** Fetching and consolidating user ratings and reviews for various products.
* **AI-Powered Comment Evaluation & Categorization:** Utilizing the **Gemini API / Vertex AI** to analyze the sentiment, topic, and intent of each comment. 
    * **Sentiment Analysis:** Determining if the comment is positive, negative, or neutral.
    * **Topic/Intent Categorization:** Automatically assigning comments to relevant categories (e.g., "Bug Report," "Feature Request," "Delivery Issue," "General Praise").
* **Suggested Replies Generation:** Generating contextually appropriate and personalized response drafts for comments, drastically reducing the manual effort required for customer service teams.
* **Performance Analytics & Testing:** Analyzing rating trends and comment processing metrics to continuously **improve response time** for high-priority feedback. **We will also generate synthetic feedback data to populate the database and create performance testing scripts to stress-test the deployed services.**

---

### **Key Technologies Used & Documentation**

| Technology | Role in the Workshop | Documentation Link |
| :--- | :--- | :--- |
| **AlloyDB for PostgreSQL** | The high-performance, fully managed database for storing and querying product data, user ratings, and the resulting AI analysis/categorizations. | [AlloyDB Documentation](https://cloud.google.com/alloydb/docs) |
| **Node.js** | The runtime environment for building the fast, scalable, and event-driven API back-end. | [Node.js Documentation](https://nodejs.org/en/docs) |
| **Cloud Run** | The serverless compute platform used to deploy the Node.js API, providing automatic scaling and a highly efficient operational environment. | [Cloud Run Documentation](https://cloud.google.com/run/docs) |
| **Gemini API / Vertex AI** | The engine for advanced machine learning tasks, handling all the heavy lifting for sentiment analysis, comment categorization, and suggested reply generation. | [Gemini API Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview) |
| **Gemini-CLI (Command Line Interface)** | **We will leverage the Gemini-CLI to accelerate development by generating boilerplate code (Node.js), database schema scripts (SQL for AlloyDB), and realistic-looking fake data.** | [Gemini API Developer Site](https://ai.google.dev/docs) |
| **hey or ab (optional for performance testing only)** | **hey is a tiny program that sends some load to a web application. / apache benchmark ** | [hey Site](https://github.com/rakyll/hey) [ab](https://httpd.apache.org/docs/2.4/programs/ab.html)|

---

### **Learning Objectives**

By the end of this workshop, you will know how to:

* Design a modern, scalable API architecture using Node.js and Cloud Run.
* Integrate the Gemini API/Vertex AI for natural language processing (NLP) tasks like classification and content generation.
* Utilize AlloyDB effectively for transactional and analytical workloads.
* Build a pipeline that turns unstructured data (customer comments) into structured, prioritized, and actionable data.
* **Implement data generation strategies and create load testing scripts to benchmark the system's performance.**
* **Use the power of generative AI via the Gemini-CLI to rapidly prototype and scaffold application components, significantly boosting development speed.**

---

### **Google Cloud Authentication**

Before you begin, you need to authenticate with Google Cloud. Run the following commands in your terminal:

1.  **Login to your Google Cloud account:**
    ```bash
    gcloud auth login
    ```

2.  **Set up Application Default Credentials:**
    ```bash
    gcloud auth application-default login
    ```

3.  **Set your Google Cloud project:**
    ```bash
    gcloud config set project [YOUR_PROJECT_ID]
    ```
    *Replace `[YOUR_PROJECT_ID]` with your actual Google Cloud project ID.*

---
### **Module 0: Setup and Environment Preparation**  🛠️  

This module ensures all necessary tools and credentials are in place before starting development.

| Step | Instruction | Details | Resources |
| :--- | :--- | :--- | :--- |
| **0.1** | **System Requirements Check** | Ensure **Node.js ($\ge$ 22)**, **npm ($\ge$ 10)**, and the **gcloud CLI** are installed. | **Action:** Cluster Password: `!devfest-alloy123`; Database Name: `items`; Database User: `items` / `!items123` |
| **0.2** | **AlloyDB Proxy** | Download and set up the AlloyDB Auth Proxy for local connectivity. | [AlloyDB Proxy Docs](https://docs.cloud.google.com/alloydb/docs/auth-proxy/connect) |
| **0.3** | **Gemini API Key** | Generate and obtain your Gemini API key (or Vertex AI credentials). | [Vertex AI Credentials Docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys?usertype=expressmode) |
| **0.4** | **Set Environment Variables** | Define required credentials and project settings in your terminal session. | `export GOOGLE_API_KEY=...` <br> `export GOOGLE_GENAI_USE_VERTEXAI="true"` <br> `export GOOGLE_CLOUD_PROJECT="..."` |
| **0.5** | **Create AlloyDB Instance** | Provision the instance, create the database (`items`), and the application user (`items` / `!items123`). | **Password:** `!devfest-alloy123` and execute the grant_priviledges.sql in the AlloyDB studio with postgres user|


-----

### **Module 1: Database Setup and AI-Driven Data Generation** 🤖 

We use the **Gemini-CLI** to instantly generate the SQL schema and realistic synthetic data.

| Step | Instruction | Description | Gemini-CLI Prompt / Action |
| :--- | :--- | :--- | :--- |
| **1.1** | **Generate DB Structure (SQL)** | Use the CLI to create the SQL script for all sequences and tables. | **Prompt:** `create a script to create the following elements in alloydb: 1) Sequences: items, orders, order_items, ratings, users. 2) Tables: Items (item_id, item_description, item_value), orders (order_id, create_date, status, user_id), order_items (order_items_id, order_id, item_id, quantity), ratings (rating_id, value, comments, user_id, order_items_id), users (user_id, name, email, status).` |
| **1.1a** | **Launch AlloyDB Auth Proxy** | Start the Auth Proxy to connect to your AlloyDB instance locally. | **Action:** `./alloydb-auth-proxy -p 5433 INSTANCE_CONNECTION_NAME` (replace with your instance name) |
| **1.2** | **Execute Schema Script** | Run the generated `setup_alloydb.sql` script on your AlloyDB instance. | **Action:** `psql -h 127.0.0.1 -p 5433 -d items -U items -f setup_alloydb.sql` |
| **1.3** | **Generate Synthetic Data** | Generate a massive amount of correlated data, focusing on realistic text for the `comments` column. | **Prompt:** `generate a populate script to insert correlated sample data for all tables with the following volumes: items - 100k, users - 100k, orders - 1M, order_items - 2M, ratings - 200k. CRUCIALLY, for the ratings 'comments' column, insert meaningful, realistic product review text (e.g., bug reports, feature requests, praise).` |
| **1.4** | **Execute Data Script** | Run the generated data insertion script to populate the database for testing. | **Action:** Execute the large data insertion script. `psql -h 127.0.0.1 -p 5433 -d items -U items -f populate_alloydb.sql` |

-----

### **Module 2: API Scaffolding and Connection** 💻 

We use the **Gemini-CLI** to quickly scaffold the Node.js API structure and connection logic.

| Step | Instruction | Description | Gemini-CLI Prompt / Action |
| :--- | :--- | :--- | :--- |
| **2.1** | **Project Setup & Structure** | Initialize the project, create folders, and scaffold the basic Express server and CRUD APIs. | **Prompt:** `follow these steps: 1) do npm init. 2) create folder structure: 'database_scripts', 'apis', 'lib'. 3) move db scripts to 'database_scripts'. 4) create a Node.js Express server with basic CRUD API endpoints for all tables structured in the SQL script. Place API logic in the 'apis' folder.` |
| **2.2** | **Configure Local Environment** | Generate `.gitignore` and the connection `.env` file, and update `package.json`. | **Prompt:** `1) Create a .gitignore for this project. 2) Create a .env file with these values: host: localhost, port: 5433, user: items, password: !items123, database: items. 3) Create a 'start:local' script in package.json to load the .env file and start the server.` |
| **2.3** | **Connect to AlloyDB** | Update all generated API files to establish and use a connection pool to AlloyDB using the `.env` variables. | **Action:** Implement the PostgreSQL driver (e.g., `pg`) connection logic in the `lib` folder and integrate it into the `apis`. |

-----

### **Module 3: Core API Development and Performance Testing** ⚡

We refine data access and introduce performance testing.

| Step | Instruction | Description | Gemini-CLI Prompt / Action |
| :--- | :--- | :--- | :--- |
| **3.1** | **Refine Basic Endpoints (Limit)** | Update all GET APIs to support a `limit` parameter to restrict results. | **Action:** Modify the API code to accept `?limit=` and apply `LIMIT $1` to the SQL. |
| **3.2** | **Refine Basic Endpoints (Pagination)** | Enhance all GET APIs to support full pagination (`limit` and `offset`). | **Prompt:** `go ahead and change all the get apis to support both the 'limit' and 'offset' parameters for full pagination capabilities.` |
| **3.3** | **Create Complex APIs** | Build an API combining multiple entities (relational queries). | **Prompt:** `create a complex API combining entities, specifically an endpoint to return a user's entire order history, detailing all purchased items per order.` |
| **3.4** | **Setup Hey Test Scripts** | Create a folder and a script to load-test the API performance. | **Prompt:** Create `testing_scripts/test_ratings_performance.sh` to run `hey -n 5000 -c 50` against the `/api/ratings?limit=10` endpoint, accepting the host as an optional parameter. |
| **3.5** | **Test Local Performance** | Run the performance test script against your local server. | **Action:** `./testing_scripts/test_ratings_performance.sh http://localhost:3000` |

-----

### **Module 4: AI Integration for Feedback Analysis** 🧠 

This is the core value-add module, integrating the Gemini API for advanced NLP.

| Step | Instruction | Description | Gemini-CLI Prompt / Action |
| :--- | :--- | :--- | :--- |
| **4.1** | **Simple Analytics Endpoint** | Create a traditional database query for simple aggregation. | **Prompt:** `In the ratings API, create a special endpoint: '/api/items/:item_id/average-rating' that returns the calculated average rating for a particular item ID using pure SQL aggregation.` |
| **4.2** | **AI-Powered Summarization** | Use the Gemini API to analyze comments and identify pain points. | **Prompt:** `Create a new endpoint: '/api/items/:item_id/top-complaints'. This endpoint must fetch all comments for the given item ID from the AlloyDB 'ratings' table. Then, it must use the Gemini API to analyze these comments and return a summary of the top 3 most frequent complaints or recurring issues found in the text. ` |
| **4.3** | **Test AI Endpoint** | Test the new endpoint and observe the AI-generated insights. | **Action:** Run a `curl` command against the new AI endpoint and analyze the output, noting the speed of insight generation. |
| **4.4** | **Test ALL Endpoints** | Creation of a global test script | **Prompt:** create a script that call curl with to test all the endpoints. |
| **4.5** | **Generate Open API interface (optional)** | Creation of a global test script | **Prompt:**generate a open api interface for all the endpoints |
| **4.6** | **Generate Open API interface (optional)** | Creation of a global test script | **Prompt:** in the ratings api methods put and post, add a functionality to push a message to a pub/sub topic called "negative-ratings", if a comment is negative, in the payload include a suggested a reply to the user. |
-----

### **Module 5: Deployment to Cloud Run (optional)** 🚀

This module focuses on preparing the application for deployment and deploying it to Google Cloud Run.

| Step | Instruction | Description | Gemini-CLI Prompt / Action |
| :--- | :--- | :--- | :--- |
| **5.1** | **Containerize Application** | Create a Dockerfile to package the Node.js application. | **Prompt:** `create a dockerfile for the nodejs application` |
| **5.2** | **Build and Push Docker Image** | Build the Docker image and push it to Google Container Registry (GCR) or Artifact Registry. | **Action:** `gcloud builds submit --tag gcr.io/[PROJECT-ID]/alloydb-api` |
| **5.3** | **Deploy to Cloud Run** | Deploy the containerized application to Google Cloud Run. | **Action:** `gcloud run deploy alloydb-api --image gcr.io/[PROJECT-ID]/alloydb-api --platform managed --region [REGION] --allow-unauthenticated` |
| **5.4** | **Configure Cloud Run to AlloyDB** | Connect the Cloud Run service to AlloyDB instance via a Serverless VPC Access connector. | **Action:** Configure the AlloyDB connection string with the private IP and ensure Serverless VPC Access is set up for Cloud Run. |
| **5.5** | **Test Deployed API** | Verify the deployed API endpoints are working correctly. | **Action:** Use `curl` or the `test_all_apis.sh` script against the Cloud Run URL. |
-----

### **Production Readiness & Security Best Practices** 🛡️

While this workshop focuses on rapid development and functionality, moving to a production environment requires strict adherence to security and operational best practices. The following tasks are **mandatory** for a production-grade deployment:

*   [ ] **Cloud Run Authentication:** Disable `allow-unauthenticated` and enforce IAM-based authentication for all service invocations to secure your API.
*   [ ] **Ingress & Load Balancing:** Implement a Global External Application Load Balancer with Cloud Armor to handle traffic management, DDoS protection, and WAF rules.
*   [ ] **Internal Traffic Only:** Configure Cloud Run 'Ingress Control' to 'Internal' or 'Internal and Cloud Load Balancing' to prevent direct public access to the service URL.
*   [ ] **Least Privilege Service Accounts:** Create a dedicated Service Account for the Cloud Run service with the minimum required permissions (e.g., `Cloud SQL Client`, `Pub/Sub Publisher`, `Vertex AI User`) instead of using the default Compute Engine service account.
*   [ ] **API Management (Apigee):** (Optional) Deploy Apigee or API Gateway in front of your backend services for advanced rate limiting, quota management, analytics, and developer portal capabilities.
*   [ ] **Secret Management:** Store sensitive configuration (DB passwords, API keys) in **Secret Manager** and mount them as environment variables in Cloud Run, rather than hardcoding them.

-----

**Ready to accelerate your customer feedback loop? Let's get started!** 
