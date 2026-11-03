package com.codeduel.service;

import com.codeduel.model.Player;
import com.codeduel.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAllByOrderByRatingDesc();
    }

    public Optional<Player> getPlayerById(String id) {
        return playerRepository.findById(id);
    }

    public List<Player> getLeaderboard(String period, String query) {
        List<Player> all = playerRepository.findAllByOrderByRatingDesc();
        String p = (period == null || period.trim().isEmpty()) ? "All-Time" : period.trim();

        double scale = 1.0;
        int ratingOffsetFactor = 0;
        if ("Weekly".equalsIgnoreCase(p)) {
            scale = 0.06;
            ratingOffsetFactor = 37;
        } else if ("Monthly".equalsIgnoreCase(p)) {
            scale = 0.22;
            ratingOffsetFactor = 19;
        }

        List<Player> adjusted = new ArrayList<>();
        for (int i = 0; i < all.size(); i++) {
            Player orig = all.get(i);
            int wins = (int) Math.max(1, Math.round(orig.getWins() * scale));
            int losses = (int) Math.max(0, Math.round(orig.getLosses() * scale));
            int rating = ratingOffsetFactor == 0 ? orig.getRating() : orig.getRating() - ((i * ratingOffsetFactor) % 90);

            Player copy = new Player(
                    orig.getId(),
                    orig.getName(),
                    orig.getHandle(),
                    rating,
                    wins,
                    losses,
                    orig.getStreak(),
                    orig.getCountry(),
                    orig.getHue()
            );
            adjusted.add(copy);
        }

        adjusted.sort(Comparator.comparingInt(Player::getRating).reversed());

        if (query != null && !query.trim().isEmpty()) {
            String q = query.trim().toLowerCase();
            return adjusted.stream()
                    .filter(player -> (player.getName() + " " + player.getHandle()).toLowerCase().contains(q))
                    .collect(Collectors.toList());
        }

        return adjusted;
    }
}

