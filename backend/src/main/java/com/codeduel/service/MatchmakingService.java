package com.codeduel.service;

import com.codeduel.dto.MatchRoomDto;
import com.codeduel.dto.MatchmakingRequest;
import com.codeduel.dto.MatchmakingResponse;
import com.codeduel.dto.ProblemDto;
import com.codeduel.model.Player;
import com.codeduel.model.Problem;
import com.codeduel.model.User;
import com.codeduel.repository.PlayerRepository;
import com.codeduel.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MatchmakingService {

    private final PlayerRepository playerRepository;
    private final ProblemRepository problemRepository;
    private final UserService userService;
    private final AuthService authService;
    private final Random random = new Random();

    public static class QueueTicket {
        public final String userId;
        public final String handle;
        public final String name;
        public final int rating;
        public final String country;
        public final int hue;
        public final long queuedAt;

        public QueueTicket(String userId, String handle, String name, int rating, String country, int hue) {
            this.userId = userId;
            this.handle = handle;
            this.name = name;
            this.rating = rating;
            this.country = country;
            this.hue = hue;
            this.queuedAt = System.currentTimeMillis();
        }
    }

    private final ConcurrentLinkedQueue<QueueTicket> queue = new ConcurrentLinkedQueue<>();
    private final ConcurrentHashMap<String, MatchmakingResponse> pendingMatches = new ConcurrentHashMap<>();

    public static class ActiveMatchRoom {
        public final String matchId;
        public final ProblemDto problem;
        public final Player player1;
        public final Player player2;
        public final boolean isBot;
        public final long startedAt;

        public ActiveMatchRoom(String matchId, ProblemDto problem, Player player1, Player player2, boolean isBot) {
            this.matchId = matchId;
            this.problem = problem;
            this.player1 = player1;
            this.player2 = player2;
            this.isBot = isBot;
            this.startedAt = System.currentTimeMillis();
        }
    }

    private final ConcurrentHashMap<String, ActiveMatchRoom> activeRooms = new ConcurrentHashMap<>();

    public MatchmakingService(PlayerRepository playerRepository,
                              ProblemRepository problemRepository,
                              UserService userService,
                              AuthService authService) {
        this.playerRepository = playerRepository;
        this.problemRepository = problemRepository;
        this.userService = userService;
        this.authService = authService;
    }

    public MatchmakingResponse findMatch(MatchmakingRequest request, String authHeader) {
        User currentUser = authService.getAuthenticatedUserEntity(authHeader);
        String sessionId = request != null && request.getClientSessionId() != null && !request.getClientSessionId().isEmpty()
                ? request.getClientSessionId()
                : (authHeader != null ? String.valueOf(Math.abs(authHeader.hashCode())) : UUID.randomUUID().toString().substring(0, 8));

        String currentUserId = currentUser != null ? currentUser.getId() : "guest_" + sessionId;
        String currentHandle = currentUser != null ? currentUser.getHandle() : "guest_" + sessionId.substring(0, Math.min(4, sessionId.length()));
        String currentName = currentUser != null ? currentUser.getName() : "Guest Player";
        int currentRating = currentUser != null ? currentUser.getRating()
                : (request != null && request.getUserRating() != null ? request.getUserRating() : 1200);
        String currentCountry = currentUser != null ? currentUser.getCountry() : "US";
        int currentHue = currentUser != null ? currentUser.getHue() : 280;

        // Check if there is already a prepared match for this user (created by another player who queued)
        if (pendingMatches.containsKey(currentUserId)) {
            return pendingMatches.remove(currentUserId);
        }

        // Clean expired tickets from queue (> 2 minutes)
        long now = System.currentTimeMillis();
        queue.removeIf(ticket -> now - ticket.queuedAt > 120000);

        // Search the active queue for a matching live player
        // STRICTLY VERIFY: Must be a DIFFERENT user (neither same userId nor same handle)
        QueueTicket matchedTicket = null;
        Iterator<QueueTicket> iterator = queue.iterator();
        while (iterator.hasNext()) {
            QueueTicket ticket = iterator.next();
            boolean isSameUser = ticket.userId.equalsIgnoreCase(currentUserId)
                    || ticket.handle.equalsIgnoreCase(currentHandle)
                    || (currentUser != null && ticket.userId.equalsIgnoreCase(currentUser.getId()));

            if (!isSameUser && Math.abs(ticket.rating - currentRating) <= 300) {
                matchedTicket = ticket;
                iterator.remove();
                break;
            }
        }

        List<Problem> problems = problemRepository.findAll();
        if (problems.isEmpty()) {
            throw new IllegalStateException("No problems available in database.");
        }
        Problem selectedProblem = problems.get(random.nextInt(problems.size()));
        String matchId = "M-" + Integer.toString(100000 + random.nextInt(900000), 36).toUpperCase();

        if (matchedTicket != null) {
            // Real Player Match! Two distinct players
            Player opponent = new Player(
                    matchedTicket.userId,
                    matchedTicket.name,
                    matchedTicket.handle,
                    matchedTicket.rating,
                    15,
                    5,
                    3,
                    matchedTicket.country,
                    matchedTicket.hue
            );

            // Store the match response for the waiting player so they receive it when they poll
            Player currentPlayerAsOpponent = new Player(
                    currentUserId,
                    currentName,
                    currentHandle,
                    currentRating,
                    currentUser != null ? currentUser.getWins() : 10,
                    currentUser != null ? currentUser.getLosses() : 4,
                    currentUser != null ? currentUser.getStreak() : 2,
                    currentCountry,
                    currentHue
            );

            ProblemDto problemDto = ProblemDto.fromEntity(selectedProblem);
            activeRooms.put(matchId, new ActiveMatchRoom(
                    matchId,
                    problemDto,
                    currentPlayerAsOpponent,
                    opponent,
                    false
            ));

            pendingMatches.put(matchedTicket.userId, new MatchmakingResponse(
                    matchId,
                    currentPlayerAsOpponent,
                    problemDto,
                    false,
                    "Matched with live player @" + currentHandle,
                    false,
                    queue.size()
            ));

            return new MatchmakingResponse(
                    matchId,
                    opponent,
                    problemDto,
                    false,
                    "Matched with live player @" + matchedTicket.handle,
                    false,
                    queue.size()
            );
        }

        // If no live player is waiting yet, wait in queue for a real opponent
        boolean alreadyInQueue = queue.stream().anyMatch(t -> t.userId.equalsIgnoreCase(currentUserId));
        if (!alreadyInQueue) {
            queue.add(new QueueTicket(currentUserId, currentHandle, currentName, currentRating, currentCountry, currentHue));
        }
        return new MatchmakingResponse(
                null,
                null,
                null,
                false,
                "Waiting in queue for a real opponent…",
                true,
                queue.size()
        );
    }

    public MatchRoomDto getMatchRoom(String matchId, String authHeader) {
        ActiveMatchRoom room = activeRooms.get(matchId);
        if (room != null) {
            User currentUser = authService.getAuthenticatedUserEntity(authHeader);
            String currentHandle = currentUser != null ? currentUser.getHandle() : "";
            String currentUserId = currentUser != null ? currentUser.getId() : "";

            // Determine opponent from caller's perspective
            Player opponent = room.player2;
            if (currentHandle.equalsIgnoreCase(room.player2.getHandle()) || currentUserId.equalsIgnoreCase(room.player2.getId())) {
                opponent = room.player1;
            }

            return new MatchRoomDto(
                    room.matchId,
                    room.problem,
                    opponent,
                    false,
                    room.startedAt
            );
        }

        // Fallback: If room was not in active memory, ensure safe fallback with problem
        List<Problem> problems = problemRepository.findAll();
        Problem fallbackProblem = problems.isEmpty() ? null : problems.get(0);
        List<Player> players = playerRepository.findAll();
        Player fallbackPlayer = players.isEmpty() ? null : players.get(0);

        return new MatchRoomDto(
                matchId,
                fallbackProblem != null ? ProblemDto.fromEntity(fallbackProblem) : null,
                fallbackPlayer,
                false,
                System.currentTimeMillis()
        );
    }

    public void cancelQueue(String authHeader) {
        User user = authService.getAuthenticatedUserEntity(authHeader);
        String userId = user != null ? user.getId() : (authHeader != null ? String.valueOf(Math.abs(authHeader.hashCode())) : null);
        if (userId != null) {
            queue.removeIf(t -> t.userId.equals(userId));
            pendingMatches.remove(userId);
        }
    }
}
