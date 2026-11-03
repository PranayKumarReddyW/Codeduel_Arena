package com.codeduel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class TestCase {

    @Column(length = 4000)
    private String input;

    @Column(length = 4000)
    private String expected;

    private boolean hidden = false;

    public TestCase() {
    }

    public TestCase(String input, String expected) {
        this.input = input;
        this.expected = expected;
        this.hidden = false;
    }

    public TestCase(String input, String expected, boolean hidden) {
        this.input = input;
        this.expected = expected;
        this.hidden = hidden;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
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

