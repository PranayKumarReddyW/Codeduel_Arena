package com.codeduel.service;

import com.codeduel.dto.AuthResponse;
import com.codeduel.dto.LoginRequest;
import com.codeduel.dto.RegisterRequest;
import com.codeduel.dto.UserProfileDto;
import com.codeduel.model.Player;
import com.codeduel.model.User;
import com.codeduel.model.UserProfile;
import com.codeduel.repository.PlayerRepository;
import com.codeduel.repository.UserRepository;
import com.codeduel.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PlayerRepository playerRepository;
    private final TokenService tokenService;
    private final UserService userService;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       PlayerRepository playerRepository,
                       TokenService tokenService,
                       UserService userService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.playerRepository = playerRepository;
        this.tokenService = tokenService;
        this.userService = userService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String cleanHandle = req.getHandle().trim().toLowerCase();
        String cleanEmail = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByHandleIgnoreCase(cleanHandle)) {
            throw new IllegalArgumentException("Handle @" + cleanHandle + " is already taken.");
        }
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new IllegalArgumentException("Email " + cleanEmail + " is already registered.");
        }

        String userId = "u_" + UUID.randomUUID().toString().substring(0, 8);
        String passwordHash = tokenService.hashPassword(req.getPassword());
        int randomHue = (int) (Math.random() * 360);

        User user = new User(
                userId,
                cleanHandle,
                cleanEmail,
                passwordHash,
                req.getName().trim(),
                "Competitive programmer on CodeDuel.",
                1200,
                "US",
                randomHue,
                Instant.now().toString()
        );
        user.setLanguages(new ArrayList<>(List.of("python", "javascript")));
        userRepository.save(user);

        // Also save profile
        UserProfile profile = new UserProfile(
                user.getId(),
                user.getName(),
                user.getHandle(),
                user.getBio(),
                user.getRating(),
                user.getLanguages()
        );
        userProfileRepository.save(profile);

        // Also register as a Player in global directory
        Player player = new Player(
                user.getId(),
                user.getName(),
                user.getHandle(),
                user.getRating(),
                0,
                0,
                0,
                user.getCountry(),
                user.getHue()
        );
        playerRepository.save(player);

        String token = tokenService.generateToken(user.getId(), user.getHandle());
        UserProfileDto dto = userService.getUserProfileForUser(user.getId());

        return new AuthResponse(token, dto);
    }

    public AuthResponse login(LoginRequest req) {
        String query = req.getUsernameOrEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByHandleIgnoreCase(query);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmailIgnoreCase(query);
        }

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid username/email or password.");
        }

        User user = userOpt.get();
        if (!tokenService.verifyPassword(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username/email or password.");
        }

        String token = tokenService.generateToken(user.getId(), user.getHandle());
        UserProfileDto dto = userService.getUserProfileForUser(user.getId());

        return new AuthResponse(token, dto);
    }

    public UserProfileDto getCurrentUser(String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) {
            return null;
        }
        TokenService.Claims claims = tokenService.validateToken(authHeader);
        if (claims == null || claims.getUserId() == null) {
            return null;
        }
        return userService.getUserProfileForUser(claims.getUserId());
    }

    public User getAuthenticatedUserEntity(String authHeader) {
        TokenService.Claims claims = tokenService.validateToken(authHeader);
        if (claims == null) return null;
        return userRepository.findById(claims.getUserId()).orElse(null);
    }
}

