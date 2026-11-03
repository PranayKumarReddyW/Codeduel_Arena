package com.codeduel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class TestCase {

    @Column(length = 4000)
    private String input;

    @Column(length = 4000)
    private String expected;

    private Boolean hidden = false;

    public TestCase() {
    }

    public TestCase(String input, String expected) {
        this.input = input;
        this.expected = expected;
        this.hidden = false;
    }

    public TestCase(String input, String expected, Boolean hidden) {
        this.input = input;
        this.expected = expected;
        this.hidden = hidden != null ? hidden : false;
    }

    public boolean isHidden() {
        return Boolean.TRUE.equals(hidden);
    }

    public void setHidden(Boolean hidden) {
        this.hidden = hidden != null ? hidden : false;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpected() {
        return expected;
    }

    public void setExpected(String expected) {
        this.expected = expected;
    }
}

