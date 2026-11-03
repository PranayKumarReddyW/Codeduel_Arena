package com.codeduel.service;

import com.codeduel.dto.*;
import com.codeduel.model.MatchRecord;
import com.codeduel.model.User;
import com.codeduel.model.UserProfile;
import com.codeduel.repository.MatchRecordRepository;
import com.codeduel.repository.UserProfileRepository;
import com.codeduel.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class UserService {

    public static final String DEFAULT_USER_ID = "alexr";

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final MatchRecordRepository matchRecordRepository;
    private final TokenService tokenService;

    public UserService(UserProfileRepository userProfileRepository,
                       UserRepository userRepository,
                       MatchRecordRepository matchRecordRepository,
                       TokenService tokenService) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.matchRecordRepository = matchRecordRepository;
        this.tokenService = tokenService;
    }

    public UserProfile getUserEntity() {
        return getUserEntityById(DEFAULT_USER_ID);
    }

    public UserProfile getUserEntityById(String userId) {
        return userProfileRepository.findById(userId).orElseGet(() -> {
            Optional<User> uOpt = userRepository.findById(userId);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                UserProfile p = new UserProfile(
                        u.getId(),
                        u.getName(),
                        u.getHandle(),
                        u.getBio(),
                        u.getRating(),
                        u.getLanguages()
                );
                return userProfileRepository.save(p);
            }
            UserProfile defaultUser = new UserProfile(
                    DEFAULT_USER_ID,
                    "Alex Rivera",
                    "alexr",
                    "Full-stack dev by day, competitive programmer by night. Graphs & DP enjoyer.",
                    1180,
                    new ArrayList<>(List.of("python", "javascript", "cpp"))
            );
            return userProfileRepository.save(defaultUser);
        });
    }

    public UserProfileDto getUserProfile() {
        return getUserProfileForUser(DEFAULT_USER_ID);
    }

    public UserProfileDto getUserProfile(String authHeader) {
        if (authHeader != null && !authHeader.isEmpty()) {
            TokenService.Claims claims = tokenService.validateToken(authHeader);
            if (claims != null && claims.getUserId() != null) {
                return getUserProfileForUser(claims.getUserId());
            }
        }
        return getUserProfile();
    }

    public UserProfileDto getUserProfileForUser(String userId) {
        UserProfile user = getUserEntityById(userId);
        List<MatchRecord> matches = matchRecordRepository.findByUserIdOrderByDateDesc(userId);

        UserProfileDto dto = new UserProfileDto();
        dto.setName(user.getName());
        dto.setHandle(user.getHandle());
        dto.setBio(user.getBio());
        dto.setRating(user.getRating());
        dto.setLanguages(user.getLanguages());
        dto.setMatches(matches);
        dto.setStats(calculateStats(matches));
        dto.setWeeklyActivity(getWeeklyActivity(matches));

        return dto;
    }

    @Transactional
    public UserProfileDto updateUserProfile(UserProfileUpdateRequest request, String authHeader) {
        String targetId = DEFAULT_USER_ID;
        if (authHeader != null && !authHeader.isEmpty()) {
            TokenService.Claims claims = tokenService.validateToken(authHeader);
            if (claims != null && claims.getUserId() != null) {
                targetId = claims.getUserId();
            }
        }

        UserProfile user = getUserEntityById(targetId);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getHandle() != null) user.setHandle(request.getHandle());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLanguages() != null) user.setLanguages(request.getLanguages());
        userProfileRepository.save(user);

        Optional<User> uOpt = userRepository.findById(targetId);
        if (uOpt.isPresent()) {
            User u = uOpt.get();
            if (request.getName() != null) u.setName(request.getName());
            if (request.getHandle() != null) u.setHandle(request.getHandle());
            if (request.getBio() != null) u.setBio(request.getBio());
            if (request.getLanguages() != null) u.setLanguages(request.getLanguages());
            userRepository.save(u);
        }

        return getUserProfileForUser(targetId);
    }

    public UserStatsDto calculateStats(List<MatchRecord> matches) {
        int total = matches.size();
        int wins = (int) matches.stream().filter(m -> "win".equalsIgnoreCase(m.getResult())).count();
        int losses = total - wins;
        int winRate = total > 0 ? (int) Math.round(((double) wins / total) * 100) : 0;

        int streak = 0;
        for (MatchRecord m : matches) {
            if ("win".equalsIgnoreCase(m.getResult())) {
                streak++;
            } else {
                break;
            }
        }

        return new UserStatsDto(total, wins, losses, winRate, streak);
    }

    public List<DayActivityDto> getWeeklyActivity(List<MatchRecord> matches) {
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        Map<String, int[]> dayMap = new LinkedHashMap<>();
        for (String d : days) {
            dayMap.put(d, new int[]{0, 0});
        }

        Instant now = Instant.now();
        Instant sevenDaysAgo = now.minusSeconds(7 * 24 * 3600);

        for (MatchRecord m : matches) {
            if (m.getDate() == null) continue;
            try {
                Instant matchTime = Instant.parse(m.getDate());
                if (matchTime.isAfter(sevenDaysAgo)) {
                    java.time.DayOfWeek dow = matchTime.atZone(ZoneId.of("UTC")).getDayOfWeek();
                    String dayKey = switch (dow) {
                        case MONDAY -> "Mon";
                        case TUESDAY -> "Tue";
                        case WEDNESDAY -> "Wed";
                        case THURSDAY -> "Thu";
                        case FRIDAY -> "Fri";
                        case SATURDAY -> "Sat";
                        case SUNDAY -> "Sun";
                    };
                    int[] counts = dayMap.get(dayKey);
                    if (counts != null) {
                        if ("win".equalsIgnoreCase(m.getResult())) {
                            counts[0]++;
                        } else {
                            counts[1]++;
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }

        List<DayActivityDto> result = new ArrayList<>();
        for (String d : days) {
            int[] counts = dayMap.get(d);
            result.add(new DayActivityDto(d, counts[0], counts[1]));
        }
        return result;
    }

    public List<RatingProgressionDto> getRatingProgression(String authHeader) {
        String userId = DEFAULT_USER_ID;
        if (authHeader != null && !authHeader.isEmpty()) {
            TokenService.Claims claims = tokenService.validateToken(authHeader);
            if (claims != null && claims.getUserId() != null) {
                userId = claims.getUserId();
            }
        }

        UserProfile user = getUserEntityById(userId);
        List<MatchRecord> matches = matchRecordRepository.findByUserIdOrderByDateDesc(userId);
        List<MatchRecord> reversed = new ArrayList<>(matches);
        Collections.reverse(reversed);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d").withZone(ZoneId.of("UTC"));
        List<RatingProgressionDto> progression = new ArrayList<>();

        if (reversed.isEmpty()) {
            progression.add(new RatingProgressionDto(1, user.getRating(), "Initial"));
            return progression;
        }

        for (int i = 0; i < reversed.size(); i++) {
            MatchRecord m = reversed.get(i);
            String dateStr = m.getDate();
            try {
                Instant instant = Instant.parse(m.getDate());
                dateStr = formatter.format(instant);
            } catch (Exception ignored) {
            }
            progression.add(new RatingProgressionDto(i + 1, m.getRatingAfter(), dateStr));
        }

        return progression;
    }
}
