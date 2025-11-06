Here are the two items you requested: a new README file for your project and an explanation of its recommendation system.

-----

## 1\. README.md for ScryptSynth-AI

Here is a comprehensive README file you can copy and paste directly into your GitHub repository.

-----

# ScryptSynth-AI

ScryptSynth-AI is a powerful, microservice-based platform designed to revolutionize content creation. It integrates a distributed system with multiple specialized AI agents to provide a seamless, intelligent suite of tools for creators.

## 🚀 Main Motto

**Microservices + AI in Content Creating**

This project leverages a modern microservice architecture to ensure scalability, fault tolerance, and independent service deployment. Each core functionality is handled by a dedicated service, which communicates with a central AI service to provide intelligent features.

## 🏛️ System Architecture

The platform is built using a Spring Boot microservice architecture, with key components for service discovery, API routing, and business logic.

  * **1. API Gateway:** The single entry point for all client requests. It routes traffic to the appropriate downstream service, handling concerns like security and load balancing.
  * **2. Eureka Service:** A service discovery registry that allows services to find and communicate with each other dynamically.
  * **3. Auth Service:** Manages user authentication and authorization, securing the platform's endpoints.
  * **4. User Service:** Handles all user-related operations, such as registration, profiles, and user data management.
  * **5. Content Service:** Responsible for managing and serving the primary content (e.g., scripts, posts, movie data).
  * **6. Watch-History Review Service:** This service is crucial for personalization. It captures user reviews and watch history, feeding this data to the AI service.
  * **7. AI Service:** The intelligent core of the platform. It runs multiple AI agents that process data and generate creative content.

## 🤖 AI Agents & Features

The **AI Service** runs four distinct background agents to power the platform's core features:

  * **🧠 Brainstorm Creative Ideas:** Helps users overcome creative blocks by generating novel ideas and concepts.
  * **✍️ Short Scripts:** Automatically generates short scripts based on user prompts or themes.
  * **✨ Captions for Posts:** Creates engaging and context-aware captions for social media posts.
  * **🎬 Movie Recommendation:** A sophisticated, personalized recommendation engine.

## 🎬 How the Recommendation System Works

The movie recommendation feature is a key example of the project's synergy between microservices and AI. It provides personalized suggestions based on a user's explicit feedback (reviews).

The process flow is as follows:

1.  **User Action:** A user watches content and submits a review through the frontend.
2.  **Service-to-Queue:** The **Watch-History Review Service** receives this review and places it into a message queue (e.g., RabbitMQ, Kafka).
3.  **Asynchronous Processing:** This queue acts as a buffer, decoupling the `Watch-History Service` from the `AI Service`. This ensures the user gets a fast response, while the AI processing happens in the background.
4.  **AI Consumption:** The **AI Service** listens to the queue. When a new review appears, it consumes the message.
5.  **Embedding & Storage:** The AI Service takes the review text, processes it (e.g., generates embeddings), and stores this new knowledge in a **User-Specific Knowledge Base** located in a Supabase vector database.
6.  **Recommendation Generation:**
      * When the user requests recommendations, the system queries the **Movie Knowledge Base** (containing all movie data).
      * This query is enriched by the user's personalized data from their **User Knowledge Base** (their embedded reviews).
      * The AI agent compares the user's review history against the movie database to find and retrieve the most relevant movies.
7.  **Display:** The recommended movies are sent back to the frontend and displayed to the user.

-----

## 2\. Explanation of Your Recommendation System

Here is a clean, step-by-step explanation of your recommendation system's workflow, as you described it.

Your recommendation system is an asynchronous, AI-driven process that learns from user feedback.

1.  **Data Ingestion:** When a user uploads a **review** for a movie, the **Watch-History Service** captures it.
2.  **Decoupling with a Queue:** Instead of processing it instantly, the service places the review into a **message queue**. This is a smart design choice that prevents the user from having to wait for the AI to finish its work.
3.  **AI Processing:** The **AI Service** continually listens to this queue. When a new review appears, the AI service "picks it up."
4.  **Knowledge Base Embedding:** The AI service processes this review and **embeds** it (turns it into a numerical vector representation). This embedding is then stored in a **User Knowledge Base** within your **Supabase database**. This builds a unique "taste profile" for each user.
5.  **Generating Recommendations:** When a user asks for recommendations, the system queries its main **Movie Knowledge Base**. It uses the data from the user's personal **User Knowledge Base** to find movies that are "semantically similar" to the reviews the user has previously given.
6.  **Display:** The system returns these movie suggestions to the frontend for the user to see.
