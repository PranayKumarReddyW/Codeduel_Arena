package com.codeduel.dto;

import java.util.ArrayList;
import java.util.List;

public class SubmitCodeResponse {
    private boolean accepted;
    private int passedTests;
    private int totalTests;
    private double runtimeMs;
    private double memoryMb;
    private List<String> logs = new ArrayList<>();
    private List<TestCaseResult> results = new ArrayList<>();
    private boolean isMock;

    public SubmitCodeResponse() {
    }

    public boolean isAccepted() {
        return accepted;
    }

    public void setAccepted(boolean accepted) {
        this.accepted = accepted;
    }

    public int getPassedTests() {
        return passedTests;
    }

    public void setPassedTests(int passedTests) {
        this.passedTests = passedTests;
    }

    public int getTotalTests() {
        return totalTests;
    }

    public void setTotalTests(int totalTests) {
        this.totalTests = totalTests;
    }

    public double getRuntimeMs() {
        return runtimeMs;
    }

    public void setRuntimeMs(double runtimeMs) {
        this.runtimeMs = runtimeMs;
    }

    public double getMemoryMb() {
        return memoryMb;
    }

    public void setMemoryMb(double memoryMb) {
        this.memoryMb = memoryMb;
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

