package com.codeduel.service;

import com.codeduel.dto.RecordMatchRequest;
import com.codeduel.model.MatchRecord;
import com.codeduel.model.Player;
import com.codeduel.model.User;
import com.codeduel.model.UserProfile;
import com.codeduel.repository.MatchRecordRepository;
import com.codeduel.repository.PlayerRepository;
import com.codeduel.repository.UserProfileRepository;
import com.codeduel.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private final MatchRecordRepository matchRecordRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final UserService userService;
    private final TokenService tokenService;

    public MatchService(MatchRecordRepository matchRecordRepository,
                        UserProfileRepository userProfileRepository,
                        UserRepository userRepository,
                        PlayerRepository playerRepository,
                        UserService userService,
                        TokenService tokenService) {
        this.matchRecordRepository = matchRecordRepository;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.playerRepository = playerRepository;
        this.userService = userService;
        this.tokenService = tokenService;
    }

    public List<MatchRecord> getMatches(String outcome, String difficulty) {
        return getMatches(outcome, difficulty, null);
    }

    public List<MatchRecord> getMatches(String outcome, String difficulty, String authHeader) {
        String userId = null;
        if (authHeader != null && !authHeader.isEmpty()) {
            TokenService.Claims claims = tokenService.validateToken(authHeader);
            if (claims != null && claims.getUserId() != null) {
                userId = claims.getUserId();
            }
        }

        List<MatchRecord> all;
        if (userId != null) {
            all = matchRecordRepository.findByUserIdOrderByDateDesc(userId);
        } else {
            all = matchRecordRepository.findAllByOrderByDateDesc();
        }

        return all.stream()
                .filter(m -> {
                    if (outcome != null && !outcome.equalsIgnoreCase("All")) {
                        if (!m.getResult().equalsIgnoreCase(outcome)) return false;
                    }
                    if (difficulty != null && !difficulty.equalsIgnoreCase("All")) {
                        if (!m.getDifficulty().equalsIgnoreCase(difficulty)) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Optional<MatchRecord> getMatchById(String id) {
        return matchRecordRepository.findById(id);
    }

    @Transactional
    public MatchRecord recordMatch(RecordMatchRequest req) {
        return recordMatch(req, null);
    }

    @Transactional
    public MatchRecord recordMatch(RecordMatchRequest req, String authHeader) {
        String userId = null;
        if (authHeader != null && !authHeader.isEmpty()) {
            TokenService.Claims claims = tokenService.validateToken(authHeader);
            if (claims != null && claims.getUserId() != null) {
                userId = claims.getUserId();
            }
        }
        if (userId == null && req.getUserId() != null && !req.getUserId().trim().isEmpty()) {
            userId = req.getUserId().trim();
        }
        if (userId == null) {
            userId = UserService.DEFAULT_USER_ID;
        }

        String matchDate = (req.getDate() != null && !req.getDate().isEmpty())
                ? req.getDate()
                : Instant.now().toString();

        UserProfile profile = userService.getUserEntityById(userId);
        int newRating = req.getRatingAfter() != 0 ? req.getRatingAfter() : (profile.getRating() + req.getDelta());
        profile.setRating(newRating);
        userProfileRepository.save(profile);

        boolean isWin = "win".equalsIgnoreCase(req.getResult());

        // Update User entity
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            u.setRating(newRating);
            if (isWin) {
                u.setWins(u.getWins() + 1);
                u.setStreak(u.getStreak() + 1);
            } else {
                u.setLosses(u.getLosses() + 1);
                u.setStreak(0);
            }
            userRepository.save(u);
        }

        // Update Player in leaderboard directory
        Optional<Player> playerOpt = playerRepository.findById(userId);
        if (playerOpt.isPresent()) {
            Player p = playerOpt.get();
            p.setRating(newRating);
            if (isWin) {
                p.setWins(p.getWins() + 1);
                p.setStreak(p.getStreak() + 1);
            } else {
                p.setLosses(p.getLosses() + 1);
                p.setStreak(0);
            }
            playerRepository.save(p);
        }

        MatchRecord record = new MatchRecord(
                req.getId(),
                userId,
                req.getOpponentId(),
                req.getProblemId(),
                req.getDifficulty(),
                req.getResult(),
                req.getDelta(),
                req.getDuration(),
                matchDate,
                req.getLanguage(),
                newRating
        );

        return matchRecordRepository.save(record);
    }
}

