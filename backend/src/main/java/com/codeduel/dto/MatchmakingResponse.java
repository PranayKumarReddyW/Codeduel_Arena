package com.codeduel.dto;

import com.codeduel.model.Player;
import com.fasterxml.jackson.annotation.JsonProperty;

public class MatchmakingResponse {
    private String matchId;
    private Player opponent;
    private ProblemDto problem;

    @JsonProperty("isBot")
    private boolean isBot;

    private String statusMessage;

    @JsonProperty("isWaiting")
    private boolean isWaiting;

    private int queueCount;

    public MatchmakingResponse() {
    }

    public MatchmakingResponse(String matchId, Player opponent, ProblemDto problem) {
        this.matchId = matchId;
        this.opponent = opponent;
        this.problem = problem;
        this.isBot = false;
        this.statusMessage = "Matched with opponent";
        this.isWaiting = false;
        this.queueCount = 1;
    }

    public MatchmakingResponse(String matchId, Player opponent, ProblemDto problem, boolean isBot, String statusMessage) {
        this.matchId = matchId;
        this.opponent = opponent;
        this.problem = problem;
        this.isBot = isBot;
        this.statusMessage = statusMessage;
        this.isWaiting = false;
        this.queueCount = 1;
    }

    public MatchmakingResponse(String matchId, Player opponent, ProblemDto problem, boolean isBot, String statusMessage, boolean isWaiting, int queueCount) {
        this.matchId = matchId;
        this.opponent = opponent;
        this.problem = problem;
        this.isBot = isBot;
        this.statusMessage = statusMessage;
        this.isWaiting = isWaiting;
        this.queueCount = queueCount;
    }

    public String getMatchId() {
        return matchId;
    }

    public void setMatchId(String matchId) {
        this.matchId = matchId;
    }

    public Player getOpponent() {
        return opponent;
    }

    public void setOpponent(Player opponent) {
        this.opponent = opponent;
    }

    public ProblemDto getProblem() {
        return problem;
    }

    public void setProblem(ProblemDto problem) {
        this.problem = problem;
    }

    @JsonProperty("isBot")
    public boolean isBot() {
        return isBot;
    }

    public void setBot(boolean bot) {
        isBot = bot;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    @JsonProperty("isWaiting")
    public boolean isWaiting() {
        return isWaiting;
    }

    public void setWaiting(boolean waiting) {
        isWaiting = waiting;
    }

    public int getQueueCount() {
        return queueCount;
    }

    public void setQueueCount(int queueCount) {
        this.queueCount = queueCount;
    }
}
