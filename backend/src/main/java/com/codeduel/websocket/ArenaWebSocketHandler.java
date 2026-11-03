package com.codeduel.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ArenaWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ArenaWebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map matchId -> Set of active WebSocket sessions
    private final Map<String, Set<WebSocketSession>> matchRooms = new ConcurrentHashMap<>();
    // Map sessionId -> matchId
    private final Map<String, String> sessionToMatch = new ConcurrentHashMap<>();
    // Map sessionId -> User handle
    private final Map<String, String> sessionToHandle = new ConcurrentHashMap<>();
    // Map matchId -> Room creation/start epoch timestamp in ms
    private final Map<String, Long> roomStartTimes = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode json = objectMapper.readTree(message.getPayload());
        String type = json.path("type").asText("");
        String matchId = json.path("matchId").asText("");
        String handle = json.path("handle").asText("anonymous");

        if (matchId.isEmpty()) return;

        switch (type) {
            case "JOIN":
                sessionToMatch.put(session.getId(), matchId);
                sessionToHandle.put(session.getId(), handle);
                Set<WebSocketSession> room = matchRooms.computeIfAbsent(matchId, k -> ConcurrentHashMap.newKeySet());
                room.add(session);

                long startedAt = roomStartTimes.computeIfAbsent(matchId, k -> System.currentTimeMillis());
                long elapsedSeconds = Math.max(0, (System.currentTimeMillis() - startedAt) / 1000);
                long remainingSeconds = Math.max(0, 1200 - elapsedSeconds);

                log.info("User @{} joined match room #{} (elapsed: {}s)", handle, matchId, elapsedSeconds);

                // Send authoritative room timing and state to the session
                try {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                            "type", "ROOM_STATE",
                            "matchId", matchId,
                            "startedAt", startedAt,
                            "elapsedSeconds", elapsedSeconds,
                            "remainingSeconds", remainingSeconds,
                            "totalSeconds", 1200
                    ))));
                } catch (IOException e) {
                    log.warn("Could not send ROOM_STATE to session", e);
                }

                // Notify opponent that user joined
                broadcastToOthers(session, matchId, Map.of(
                        "type", "OPPONENT_JOINED",
                        "handle", handle,
                        "text", "@" + handle + " connected to the arena",
                        "tone", "info"
                ));

                // If other players are already present in the room, let this joining session know
                for (WebSocketSession other : room) {
                    if (other.isOpen() && !other.getId().equals(session.getId())) {
                        String otherHandle = sessionToHandle.getOrDefault(other.getId(), "Opponent");
                        try {
                            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                                    "type", "OPPONENT_JOINED",
                                    "handle", otherHandle,
                                    "text", "@" + otherHandle + " is ready in the arena",
                                    "tone", "info"
                            ))));
                        } catch (IOException e) {
                            log.warn("Could not notify joining user of existing opponent", e);
                        }
                    }
                }
                break;

            case "PROGRESS":
                // Real-time opponent progress update (tests passed, code percentage)
                broadcastToOthers(session, matchId, Map.of(
                        "type", "OPPONENT_PROGRESS",
                        "handle", handle,
                        "progress", json.path("progress").asInt(0),
                        "testsPassed", json.path("testsPassed").asInt(0),
                        "totalTests", json.path("totalTests").asInt(0),
                        "text", json.path("text").asText("Running tests…"),
                        "tone", json.path("tone").asText("info")
                ));
                break;

            case "STATUS_EVENT":
                // Opponent activity feed event (e.g. "Started coding in Python", "Ran sample tests")
                broadcastToOthers(session, matchId, Map.of(
                        "type", "OPPONENT_STATUS",
                        "handle", handle,
                        "text", json.path("text").asText(""),
                        "tone", json.path("tone").asText("info")
                ));
                break;

            case "SOLUTION_SUBMITTED":
                boolean accepted = json.path("accepted").asBoolean(false);
                if (accepted) {
                    broadcastToOthers(session, matchId, Map.of(
                            "type", "MATCH_FINISHED",
                            "winnerHandle", handle,
                            "text", "@" + handle + " submitted Accepted solution! They won the match.",
                            "tone", "bad"
                    ));
                } else {
                    broadcastToOthers(session, matchId, Map.of(
                            "type", "OPPONENT_STATUS",
                            "handle", handle,
                            "text", "@" + handle + " submitted: Wrong Answer",
                            "tone", "bad"
                    ));
                }
                break;

            case "FORFEIT":
                broadcastToOthers(session, matchId, Map.of(
                        "type", "OPPONENT_FORFEITED",
                        "handle", handle,
                        "text", "@" + handle + " has forfeited the match.",
                        "tone", "good"
                ));
                break;

            default:
                break;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String matchId = sessionToMatch.remove(session.getId());
        String handle = sessionToHandle.remove(session.getId());

        if (matchId != null) {
            Set<WebSocketSession> room = matchRooms.get(matchId);
            if (room != null) {
                room.remove(session);
                if (room.isEmpty()) {
                    matchRooms.remove(matchId);
                } else {
                    broadcastToOthers(session, matchId, Map.of(
                            "type", "OPPONENT_STATUS",
                            "handle", handle != null ? handle : "Opponent",
                            "text", "@" + (handle != null ? handle : "Opponent") + " disconnected from match",
                            "tone", "warn"
                    ));
                }
            }
        }
    }

    private void broadcastToOthers(WebSocketSession sender, String matchId, Map<String, Object> data) {
        Set<WebSocketSession> room = matchRooms.get(matchId);
        if (room == null) return;

        try {
            String payload = objectMapper.writeValueAsString(data);
            TextMessage message = new TextMessage(payload);
            for (WebSocketSession s : room) {
                if (s.isOpen() && !s.getId().equals(sender.getId())) {
                    s.sendMessage(message);
                }
            }
        } catch (IOException e) {
            log.error("Failed to broadcast message in room {}", matchId, e);
        }
    }
}
