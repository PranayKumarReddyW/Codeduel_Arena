package com.codeduel.dto;

public class MatchmakingRequest {
    private Integer userRating;
    private Boolean allowBotFallback = false;
    private String clientSessionId;

    public MatchmakingRequest() {
        this.allowBotFallback = false;
    }

    public MatchmakingRequest(Integer userRating) {
        this.userRating = userRating;
        this.allowBotFallback = false;
    }

    public MatchmakingRequest(Integer userRating, Boolean allowBotFallback) {
        this.userRating = userRating;
        this.allowBotFallback = allowBotFallback != null ? allowBotFallback : false;
    }

    public MatchmakingRequest(Integer userRating, Boolean allowBotFallback, String clientSessionId) {
        this.userRating = userRating;
        this.allowBotFallback = allowBotFallback != null ? allowBotFallback : false;
        this.clientSessionId = clientSessionId;
    }

    public String getClientSessionId() {
        return clientSessionId;
    }

    public void setClientSessionId(String clientSessionId) {
        this.clientSessionId = clientSessionId;
    }

    public Integer getUserRating() {
        return userRating;
    }

    public void setUserRating(Integer userRating) {
        this.userRating = userRating;
    }

    public Boolean getAllowBotFallback() {
        return allowBotFallback != null ? allowBotFallback : false;
    }

    public void setAllowBotFallback(Boolean allowBotFallback) {
        this.allowBotFallback = allowBotFallback;
    }
}
