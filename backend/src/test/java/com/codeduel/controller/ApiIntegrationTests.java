package com.codeduel.controller;

import com.codeduel.dto.ExecuteCodeRequest;
import com.codeduel.dto.LoginRequest;
import com.codeduel.dto.MatchmakingRequest;
import com.codeduel.dto.RecordMatchRequest;
import com.codeduel.dto.RegisterRequest;
import com.codeduel.dto.SubmitCodeRequest;
import com.codeduel.dto.UserProfileUpdateRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAuthRegisterAndLogin() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 6);
        RegisterRequest reg = new RegisterRequest("Test User", "testuser_" + unique, "user_" + unique + "@example.com", "password123");

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.handle", is("testuser_" + unique)))
                .andReturn();

        String token = objectMapper.readTree(regResult.getResponse().getContentAsString()).path("token").asText();

        // Test login
        LoginRequest login = new LoginRequest("testuser_" + unique, "password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.name", is("Test User")));

        // Test /me with token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle", is("testuser_" + unique)));
    }

    @Test
    void testDemoLogin() throws Exception {
        LoginRequest login = new LoginRequest("alexr", "password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.handle", is("alexr")));
    }

    @Test
    void testGetProblems() throws Exception {
        mockMvc.perform(get("/api/problems"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(5))))
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].starter.python").exists());
    }

    @Test
    void testGetProblemById() throws Exception {
        mockMvc.perform(get("/api/problems/two-sum"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("two-sum")))
                .andExpect(jsonPath("$.title", is("Two Sum")))
                .andExpect(jsonPath("$.tests", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void testGetPlayers() throws Exception {
        mockMvc.perform(get("/api/players"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(15))));
    }

    @Test
    void testGetLeaderboard() throws Exception {
        mockMvc.perform(get("/api/players/leaderboard?period=Weekly"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(15))));
    }

    @Test
    void testGetUserProfile() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Alex Rivera")))
                .andExpect(jsonPath("$.stats.total", greaterThanOrEqualTo(20)))
                .andExpect(jsonPath("$.weeklyActivity", hasSize(7)));
    }

    @Test
    void testUpdateUserProfile() throws Exception {
        UserProfileUpdateRequest updateReq = new UserProfileUpdateRequest();
        updateReq.setBio("Updated bio for testing");
        updateReq.setLanguages(List.of("python", "cpp"));

        mockMvc.perform(put("/api/user/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bio", is("Updated bio for testing")));
    }

    @Test
    void testMatchmaking() throws Exception {
        MatchmakingRequest req = new MatchmakingRequest(1200);
        mockMvc.perform(post("/api/matchmaking/find")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchId").isNotEmpty())
                .andExpect(jsonPath("$.opponent.name").isNotEmpty())
                .andExpect(jsonPath("$.problem.title").isNotEmpty());
    }

    @Test
    void testMatches() throws Exception {
        mockMvc.perform(get("/api/matches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        RecordMatchRequest newMatch = new RecordMatchRequest();
        newMatch.setId("M-TEST123");
        newMatch.setOpponentId("p1");
        newMatch.setProblemId("two-sum");
        newMatch.setDifficulty("Easy");
        newMatch.setResult("win");
        newMatch.setDelta(25);
        newMatch.setDuration(180);
        newMatch.setLanguage("python");

        mockMvc.perform(post("/api/matches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newMatch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("M-TEST123")));
    }

    @Test
    void testExecuteCodeRun() throws Exception {
        ExecuteCodeRequest req = new ExecuteCodeRequest();
        req.setProblemId("two-sum");
        req.setLanguage("python");
        req.setCode("class Solution:\n    def twoSum(self, nums, target):\n        lookup = {}\n        for i, n in enumerate(nums):\n            if target - n in lookup: return [lookup[target - n], i]\n            lookup[n] = i\n");

        mockMvc.perform(post("/api/code/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.results", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void testExecuteCodeSubmit() throws Exception {
        SubmitCodeRequest req = new SubmitCodeRequest();
        req.setProblemId("two-sum");
        req.setLanguage("python");
        req.setCode("class Solution:\n    def twoSum(self, nums, target):\n        lookup = {}\n        for i, n in enumerate(nums):\n            if target - n in lookup: return [lookup[target - n], i]\n            lookup[n] = i\n");

        mockMvc.perform(post("/api/code/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passedTests", greaterThan(0)));
    }

    @Test
    void testPlatformEndpoints() throws Exception {
        mockMvc.perform(get("/api/platform/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeBattlers").isNumber());

        mockMvc.perform(get("/api/platform/languages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));

        mockMvc.perform(get("/api/platform/tiers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)));
    }

    @Test
    void testPerUserDataIsolation() throws Exception {
        String u1 = UUID.randomUUID().toString().substring(0, 6);
        String u2 = UUID.randomUUID().toString().substring(0, 6);

        // Register User 1
        RegisterRequest reg1 = new RegisterRequest("User One", "user1_" + u1, "u1_" + u1 + "@test.com", "password123");
        MvcResult res1 = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.stats.total", is(0)))
                .andReturn();
        String token1 = objectMapper.readTree(res1.getResponse().getContentAsString()).path("token").asText();

        // Register User 2
        RegisterRequest reg2 = new RegisterRequest("User Two", "user2_" + u2, "u2_" + u2 + "@test.com", "password123");
        MvcResult res2 = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.stats.total", is(0)))
                .andReturn();
        String token2 = objectMapper.readTree(res2.getResponse().getContentAsString()).path("token").asText();

        // Record a match for User 1
        RecordMatchRequest matchReq = new RecordMatchRequest();
        matchReq.setId("M-TEST-" + u1);
        matchReq.setOpponentId("p1");
        matchReq.setProblemId("two-sum");
        matchReq.setDifficulty("Easy");
        matchReq.setResult("win");
        matchReq.setDelta(25);
        matchReq.setDuration(180);
        matchReq.setLanguage("python");
        matchReq.setRatingAfter(1225);

        mockMvc.perform(post("/api/matches")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(matchReq)))
                .andExpect(status().isOk());

        // Verify User 1 profile now has 1 match and rating 1225
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating", is(1225)))
                .andExpect(jsonPath("$.stats.total", is(1)))
                .andExpect(jsonPath("$.stats.wins", is(1)))
                .andExpect(jsonPath("$.matches", hasSize(1)));

        // Verify User 2 profile STILL has 0 matches and rating 1200 (isolated!)
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating", is(1200)))
                .andExpect(jsonPath("$.stats.total", is(0)))
                .andExpect(jsonPath("$.matches", hasSize(0)));

        // Verify matches endpoint filters by logged-in user
        mockMvc.perform(get("/api/matches")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/matches")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
