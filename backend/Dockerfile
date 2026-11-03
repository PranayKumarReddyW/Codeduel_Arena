# Build Stage
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN mkdir -p /app/data
COPY --from=builder /app/target/codeduel-backend-1.0.0.jar /app/app.jar

ENV PORT=8088
ENV DATA_DIR=/app/data
EXPOSE 8088
VOLUME ["/app/data"]

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

