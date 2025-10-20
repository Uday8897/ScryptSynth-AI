# ScriptSynth: Your AI Story Studio 🎬

**ScriptSynth** is a powerful, AI-driven platform for film lovers and creators. It combines a personal, intelligent movie recommender with a suite of AI-powered content creation tools. It learns your unique cinematic taste to suggest films you'll truly love and helps you develop your own creative ideas from concept to script.

This project is built on a resilient, polyglot microservice architecture, combining the strengths of Java/Spring Boot for robust backend services and Python/FastAPI for high-performance AI tasks.

## ✨ Main Features

  * **AI Movie Recommender:** A smart recommendation engine that learns from your ratings and reviews. The more you use the app, the better its suggestions become.
  * **AI Creative Studio:** A suite of tools for content creators:
      * **Idea Elaboration:** Fleshes out a simple story idea into potential plot points, character archetypes, and themes.
      * **Genre Brainstorming:** Generates creative ideas (plot twists, settings, characters) for a specific genre.
      * **Shot Planner:** Suggests specific camera shots and angles to achieve a desired mood for a scene.
  * **Movie Reviews & Watchlist:** Log, rate, and review any movie. Keep track of films you want to see with a personal watchlist.
  * **Comprehensive Movie Database:** A searchable database of thousands of movies, including details, posters, and where to stream them.

-----

## 🚀 Application Flow

The system is a decoupled, event-driven network of microservices that work together.

1.  **Data Ingestion:** A Python script (`Content-Ingestion-Service`) fetches data from the TMDB API and populates a **MongoDB** database, which is then served by the `Content-Search-Service`.
2.  **User Management:** A user signs up and logs in via the **`Auth-Service`**. This service creates their login credentials in **PostgreSQL** and publishes an event to **RabbitMQ**.
3.  **Event-Driven Profile Creation:** The **`User-Service`** (listening to RabbitMQ) receives the registration event and creates a corresponding user profile.
4.  **Review & AI Learning:**
      * A user logs a 10/10 review for *The Dark Knight* using the frontend.
      * The request goes through the **`API-Gateway`** to the **`Review-Service`**, which saves the review to **PostgreSQL**.
      * The `Review-Service` then publishes a `review.created` event to **RabbitMQ**.
      * The **`AI-Service`** (the recommender) consumes this event, creates a vector embedding of the review ("gritty, psychological thriller"), and stores it in its **ChromaDB** (vector store) memory.
5.  **AI Recommendation:**
      * The user asks the **`AI-Service`** for a recommendation.
      * The AI queries its vector store, finds the memory of the "Dark Knight" review, and provides a personalized, reasoned suggestion (like *Inception*) instead of a generic one.
6.  **AI Content Creation:**
      * The user goes to the "Creative Studio" and asks the **`Creative-AI-Service`** to brainstorm plot twists for a "Sci-Fi" movie.
      * The gateway routes this to the dedicated Python service, which uses a specialized prompt with the **Groq API** to generate and return a list of creative ideas.

-----

## 🛠️ Tech Stack & Architecture

This project is a polyglot (Java & Python) microservice system orchestrated with Docker.

### **Core Infrastructure**

  * **Service Discovery:** `EurekaServer` (Java/Spring)
  * **API Gateway:** `Api-Gateway` (Java/Spring Cloud Gateway) - *Single entry point, handles CORS & Auth filtering.*
  * **Databases:**
      * `PostgreSQL`: For all relational data (users, reviews, watchlist).
      * `MongoDB`: For the movie content/document database.
      * `ChromaDB`: Vector store for AI recommender's memory.
  * **Messaging:** `RabbitMQ` - *For asynchronous communication between services.*
  * **Deployment:** `Docker` & `Docker Compose`

### **Microservices**

| Service | Language | Framework | Purpose |
| :--- | :--- | :--- | :--- |
| **Auth-Service** | Java | Spring Boot | Handles user registration & login (issues JWTs). |
| **User-Service** | Java | Spring Boot | Manages user profiles (listens for reg. events). |
| **Review-Service** | Java | Spring Boot | Manages movie reviews & watchlists. Publishes events. |
| **AI-Service** | Python | FastAPI | Provides personalized movie recommendations (learns from events). |
| **Creative-AI-Service** | Python | FastAPI | Provides all AI content creation tools. |
| **Content-Search-Service** | Python | FastAPI | Serves movie data from MongoDB (search, get by ID, now playing). |
| **Content-Ingestion-Service**| Python | Script | Fetches data from TMDB and populates MongoDB. |
| **scriptsynth-frontend** | JavaScript | React | The complete user interface. |

-----

## 🚀 How to Run

This entire application is designed to be run with Docker Compose.

### **Prerequisites**

  * [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
  * Git
  * Valid API keys for **Groq** and **TMDB**

### **1. Build All Docker Images**

Before you can run the system, you must build the Docker image for **each individual service**.

Navigate into each service directory (e.g., `cd Api-Gateway`) and run the build command, tagging it with your Docker Hub username.

**Example for a Java service (`Auth-Service`):**

```bash
cd Auth-Service
docker build -t your-docker-hub-username/ss-auth:latest .
```

**Example for a Python service (`AI-Service`):**

```bash
cd AI-Service
docker build -t your-docker-hub-username/ss-ai-service:latest .
```

*(Repeat this build process for all 10+ services: Java, Python, and Frontend)*

### **2. Push Images to Docker Hub**

Push each image you've built.

```bash
docker push your-docker-hub-username/ss-auth:latest
docker push your-docker-hub-username/ss-ai-service:latest
# ... push all other images ...
```

### **3. Configure Your `docker-compose.yml`**

Place the provided `docker-compose.yml` file in the root `Curator AI` directory.

Before running, you **must** edit the `docker-compose.yml` file and fill in your secret API keys for:

  * `GROQ_API_KEY`
  * `TMDB_API_KEY`
  * `TMDB_READ_ACCESS_TOKEN`

You must also update the `image:` name for each service to match your Docker Hub username (e.g., `image: your-docker-hub-username/ss-auth:latest`).

### **4. Run the Application**

Once all images are built, pushed, and the compose file is configured, run:

```bash
docker-compose up -d
```

This command will pull all your images and start all 10+ containers in the correct order.

Your **ScriptSynth** application will be running\!

  * **Frontend:** `http://localhost`
  * **API Gateway:** `http://localhost:8080`
  * **Eureka Dashboard:** `http://localhost:8761`
  * **RabbitMQ Dashboard:** `http://localhost:15672`
