package com.codeduel.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@Service
public class TokenService {

    @Value("${jwt.secret:codeduel-super-secret-key-for-jwt-signing-which-is-long-enough-256bit}")
    private String secretKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();

    public static class Claims {
        private final String userId;
        private final String handle;
        private final long expiresAt;

        public Claims(String userId, String handle, long expiresAt) {
            this.userId = userId;
            this.handle = handle;
            this.expiresAt = expiresAt;
        }

        public String getUserId() {
            return userId;
        }

        public String getHandle() {
            return handle;
        }

        public long getExpiresAt() {
            return expiresAt;
        }
    }

    public String generateToken(String userId, String handle) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + (7 * 24 * 3600); // 7 days validity

            Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
            Map<String, Object> payload = Map.of(
                    "sub", userId,
                    "handle", handle,
                    "iat", now,
                    "exp", exp
            );

            String headerB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsBytes(header));
            String payloadB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsBytes(payload));
            String content = headerB64 + "." + payloadB64;

            String signatureB64 = sign(content, secretKey);
            return content + "." + signatureB64;
        } catch (Exception e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    public Claims validateToken(String token) {
        if (token == null || token.trim().isEmpty()) return null;
        if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
            token = token.substring(7).trim();
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) return null;

        try {
            String content = parts[0] + "." + parts[1];
            String expectedSignature = sign(content, secretKey);
            if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                return null;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payload = objectMapper.readTree(payloadBytes);

            long exp = payload.path("exp").asLong(0);
            if (Instant.now().getEpochSecond() > exp) {
                return null; // Expired
            }

            String userId = payload.path("sub").asText(null);
            String handle = payload.path("handle").asText(null);
            return new Claims(userId, handle, exp);
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }

    public String hashPassword(String password) {
        try {
            byte[] salt = new byte[16];
            secureRandom.nextBytes(salt);

            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 256);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();

            return HexFormat.of().formatHex(salt) + ":" + HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public boolean verifyPassword(String password, String storedHash) {
        if (storedHash == null || !storedHash.contains(":")) return false;
        try {
            String[] parts = storedHash.split(":");
            byte[] salt = HexFormat.of().parseHex(parts[0]);
            byte[] expectedHash = HexFormat.of().parseHex(parts[1]);

            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 256);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] testHash = factory.generateSecret(spec).getEncoded();

            return MessageDigest.isEqual(expectedHash, testHash);
        } catch (Exception e) {
            return false;
        }
    }
}

