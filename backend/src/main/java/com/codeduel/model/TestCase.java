package com.codeduel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class TestCase {

    @Column(length = 4000)
    private String input;

    @Column(length = 4000)
    private String expected;

    public TestCase() {
    }

    public TestCase(String input, String expected) {
        this.input = input;
        this.expected = expected;
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

