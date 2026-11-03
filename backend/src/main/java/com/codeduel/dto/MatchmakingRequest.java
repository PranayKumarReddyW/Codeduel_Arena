package com.codeduel.dto;

public class MatchmakingRequest {
    private Integer userRating;
    private Boolean allowBotFallback = true;
    private String clientSessionId;

    public MatchmakingRequest() {
    }

    public MatchmakingRequest(Integer userRating) {
        this.userRating = userRating;
        this.allowBotFallback = true;
    }

    public MatchmakingRequest(Integer userRating, Boolean allowBotFallback) {
        this.userRating = userRating;
        this.allowBotFallback = allowBotFallback;
    }

    public MatchmakingRequest(Integer userRating, Boolean allowBotFallback, String clientSessionId) {
        this.userRating = userRating;
        this.allowBotFallback = allowBotFallback;
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
        return allowBotFallback != null ? allowBotFallback : true;
    }

    public void setAllowBotFallback(Boolean allowBotFallback) {
        this.allowBotFallback = allowBotFallback;
    }
}
