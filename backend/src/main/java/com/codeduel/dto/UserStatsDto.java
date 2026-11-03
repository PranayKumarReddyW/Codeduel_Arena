package com.codeduel.dto;

public class UserStatsDto {
    private int total;
    private int wins;
    private int losses;
    private int winRate;
    private int streak;

    public UserStatsDto() {
    }

    public UserStatsDto(int total, int wins, int losses, int winRate, int streak) {
        this.total = total;
        this.wins = wins;
        this.losses = losses;
        this.winRate = winRate;
        this.streak = streak;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
    }

    public int getWinRate() {
        return winRate;
    }

    public void setWinRate(int winRate) {
        this.winRate = winRate;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }
}

