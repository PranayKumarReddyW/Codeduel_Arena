package com.codeduel.dto;

import java.util.ArrayList;
import java.util.List;

public class ExecuteCodeResponse {
    private boolean success;
    private List<String> logs = new ArrayList<>();
    private List<TestCaseResult> results = new ArrayList<>();
    private boolean isMock;

    public ExecuteCodeResponse() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<String> getLogs() {
        return logs;
    }

    public void setLogs(List<String> logs) {
        this.logs = logs;
    }

    public List<TestCaseResult> getResults() {
        return results;
    }

    public void setResults(List<TestCaseResult> results) {
        this.results = results;
    }

    public boolean isMock() {
        return isMock;
    }

    public void setMock(boolean mock) {
        isMock = mock;
    }
}

