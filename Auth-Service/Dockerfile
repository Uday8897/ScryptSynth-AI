# --- Stage 1: Build ---
# Use the standard, official Maven image for Eclipse Temurin 21
FROM maven:3-eclipse-temurin-21 AS builder

# Set the working directory
WORKDIR /app

# Copy the pom.xml first
COPY pom.xml .

# Download all dependencies
RUN mvn dependency:go-offline

# Copy the rest of your Java source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# --- Stage 2: Run ---
# Use the standard, lightweight JRE 21 image
FROM eclipse-temurin:21-jre

# Set the working directory
WORKDIR /app

# Argument to find the jar file
ARG JAR_FILE=target/*.jar

# Copy the built .jar file from the 'builder' stage
COPY --from=builder /app/${JAR_FILE} app.jar

# --- !! IMPORTANT !! ---
# EXPOSE the port this service runs on. You MUST change this for each service!
# 8761 for EurekaServer
# 8080 for Api-Gateway
# 9001 for Auth-Service
# 9003 for User-Service
# 9002 for Watch-History-Service
# 9004 for Follow-Service
# 9005 for Feed-Service
EXPOSE 9001

# The command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "/app/app.jar"]