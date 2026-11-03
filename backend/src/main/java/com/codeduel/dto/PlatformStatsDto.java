package com.codeduel.dto;

public class PlatformStatsDto {
    private int activeBattlers;
    private int queueCount;
    private int totalMatchesPlayed;

    public PlatformStatsDto() {
    }

    public PlatformStatsDto(int activeBattlers, int queueCount, int totalMatchesPlayed) {
        this.activeBattlers = activeBattlers;
        this.queueCount = queueCount;
        this.totalMatchesPlayed = totalMatchesPlayed;
    }

    public int getActiveBattlers() {
        return activeBattlers;
    }

    public void setActiveBattlers(int activeBattlers) {
        this.activeBattlers = activeBattlers;
    }

    public int getQueueCount() {
        return queueCount;
    }

    public void setQueueCount(int queueCount) {
        this.queueCount = queueCount;
    }

    public int getTotalMatchesPlayed() {
        return totalMatchesPlayed;
    }

    public void setTotalMatchesPlayed(int totalMatchesPlayed) {
        this.totalMatchesPlayed = totalMatchesPlayed;
    }
}

