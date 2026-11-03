package com.codeduel.dto;

import com.codeduel.model.Player;

public class MatchRoomDto {
    private String matchId;
    private ProblemDto problem;
    private Player opponent;
    private boolean isBot;
    private long startedAt;

    public MatchRoomDto() {
    }

    public MatchRoomDto(String matchId, ProblemDto problem, Player opponent, boolean isBot, long startedAt) {
        this.matchId = matchId;
        this.problem = problem;
        this.opponent = opponent;
        this.isBot = isBot;
        this.startedAt = startedAt;
    }

    public String getMatchId() {
        return matchId;
    }

    public void setMatchId(String matchId) {
        this.matchId = matchId;
    }

    public ProblemDto getProblem() {
        return problem;
    }

    public void setProblem(ProblemDto problem) {
        this.problem = problem;
    }

    public Player getOpponent() {
        return opponent;
    }

    public void setOpponent(Player opponent) {
        this.opponent = opponent;
    }

    public boolean isBot() {
        return isBot;
    }

    public void setBot(boolean bot) {
        isBot = bot;
    }

    public long getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(long startedAt) {
        this.startedAt = startedAt;
    }
}

