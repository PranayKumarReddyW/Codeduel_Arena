package com.codeduel.dto;

public class TestCaseResult {
    private String status; // "pass" | "fail"
    private String output;
    private String expected;
    private String stdout; // User print / console output
    private double time; // ms
    private double memory; // MB

    public TestCaseResult() {
    }

    public TestCaseResult(String status, String output, String expected, double time, double memory) {
        this(status, output, expected, "", time, memory);
    }

    public TestCaseResult(String status, String output, String expected, String stdout, double time, double memory) {
        this.status = status;
        this.output = output;
        this.expected = expected;
        this.stdout = stdout;
        this.time = time;
        this.memory = memory;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getExpected() {
        return expected;
    }

    public void setExpected(String expected) {
        this.expected = expected;
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }

    public double getTime() {
        return time;
    }

    public void setTime(double time) {
        this.time = time;
    }

    public double getMemory() {
        return memory;
    }

    public void setMemory(double memory) {
        this.memory = memory;
    }
}
