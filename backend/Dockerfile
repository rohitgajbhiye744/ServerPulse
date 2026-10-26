# Build stage: compile the Spring Boot application using Maven and Java 17
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven configuration first to improve build caching
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Make the Maven wrapper executable inside Linux
RUN chmod +x mvnw

# Download dependencies before copying application source
RUN ./mvnw dependency:go-offline

# Copy source code and package the application
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage: use a smaller Java 17 image
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]