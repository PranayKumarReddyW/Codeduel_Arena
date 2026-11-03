package com.codeduel.data;

import com.codeduel.model.*;
import com.codeduel.repository.MatchRecordRepository;
import com.codeduel.repository.PlayerRepository;
import com.codeduel.repository.ProblemRepository;
import com.codeduel.repository.UserProfileRepository;
import com.codeduel.repository.UserRepository;
import com.codeduel.service.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final PlayerRepository playerRepository;
    private final ProblemRepository problemRepository;
    private final UserProfileRepository userProfileRepository;
    private final MatchRecordRepository matchRecordRepository;
    private final UserRepository userRepository;
    private final TokenService tokenService;

    public DataInitializer(PlayerRepository playerRepository,
                           ProblemRepository problemRepository,
                           UserProfileRepository userProfileRepository,
                           MatchRecordRepository matchRecordRepository,
                           UserRepository userRepository,
                           TokenService tokenService) {
        this.playerRepository = playerRepository;
        this.problemRepository = problemRepository;
        this.userProfileRepository = userProfileRepository;
        this.matchRecordRepository = matchRecordRepository;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    @Override
    public void run(String... args) {
        log.info("[DataInitializer] Checking database seed status...");
        if (playerRepository.count() == 0) {
            log.info("[DataInitializer] Seeding leaderboard players...");
            seedPlayers();
        }
        if (problemRepository.count() == 0) {
            log.info("[DataInitializer] Seeding competitive arena problems...");
            seedProblems();
        }
        if (userProfileRepository.count() == 0) {
            log.info("[DataInitializer] Seeding sample user profiles and match history...");
            seedUserProfileAndMatches();
        }
        if (userRepository.count() == 0) {
            log.info("[DataInitializer] Seeding default user accounts...");
            seedUserAccounts();
        }
        log.info("[DataInitializer] Database ready: {} problems, {} players.", problemRepository.count(), playerRepository.count());
    }

    private void seedPlayers() {
        List<Player> players = List.of(
                new Player("p1", "Aiko Tanaka", "aiko.exe", 2487, 412, 98, 14, "JP", 290),
                new Player("p2", "Lukas Weber", "segfault_lw", 2391, 388, 121, 6, "DE", 210),
                new Player("p3", "Priya Nair", "priyacodes", 2305, 351, 110, 9, "IN", 150),
                new Player("p4", "Marcus Hill", "mhill", 2188, 299, 140, 3, "US", 30),
                new Player("p5", "Sofia Rossi", "sofi_r", 2102, 280, 133, 5, "IT", 340),
                new Player("p6", "Chen Wei", "dp_master", 1996, 261, 150, 2, "CN", 0),
                new Player("p7", "Omar Haddad", "omarh", 1874, 230, 162, 4, "AE", 60),
                new Player("p8", "Emma Larsen", "emmal", 1780, 205, 170, 1, "NO", 190),
                new Player("p9", "Diego Alvarez", "dalvarez", 1702, 188, 159, 7, "MX", 110),
                new Player("p10", "Hana Kim", "hanabyte", 1655, 176, 151, 2, "KR", 260),
                new Player("p11", "Noah Brown", "nbrown", 1589, 160, 149, 0, "CA", 20),
                new Player("p12", "Zara Ali", "zara.dev", 1512, 148, 140, 3, "PK", 320),
                new Player("p13", "Felix Moreau", "fmoreau", 1430, 131, 133, 1, "FR", 230),
                new Player("p14", "Ivy Chen", "ivyc", 1366, 118, 120, 2, "SG", 170),
                new Player("p15", "Tom Becker", "tbeck", 1240, 97, 110, 0, "AT", 45)
        );
        playerRepository.saveAll(players);
    }

    private void seedProblems() {
        Problem p1 = new Problem();
        p1.setId("two-sum");
        p1.setTitle("Two Sum");
        p1.setDifficulty("Easy");
        p1.setTags(List.of("Array", "Hash Table"));
        p1.setStatement(List.of(
                "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
                "You may assume that each input has exactly one solution, and you may not use the same element twice. Return the answer in any order."
        ));
        p1.setInputFormat("First line: space-separated integers nums. Second line: integer target.");
        p1.setOutputFormat("Two space-separated indices i and j (i < j).");
        p1.setConstraints(List.of("2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists."));
        p1.setExamples(List.of(
                new Example("nums = [2,7,11,15], target = 9", "[0,1]", "nums[0] + nums[1] == 9, so we return [0, 1]."),
                new Example("nums = [3,2,4], target = 6", "[1,2]", null)
        ));
        p1.setTests(List.of(
                new TestCase("[2,7,11,15]\n9", "[0,1]"),
                new TestCase("[3,2,4]\n6", "[1,2]"),
                new TestCase("[3,3]\n6", "[0,1]")
        ));
        p1.setStarterPython("class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass\n");
        p1.setStarterJavascript("/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your solution here\n}\n");
        p1.setStarterCpp("class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};\n");
        p1.setStarterJava("class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n    }\n}\n");

        Problem p2 = new Problem();
        p2.setId("valid-parentheses");
        p2.setTitle("Valid Parentheses");
        p2.setDifficulty("Easy");
        p2.setTags(List.of("String", "Stack"));
        p2.setStatement(List.of(
                "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                "An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order. Every close bracket has a corresponding open bracket of the same type."
        ));
        p2.setInputFormat("A single string s.");
        p2.setOutputFormat("true if s is valid, otherwise false.");
        p2.setConstraints(List.of("1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}' ."));
        p2.setExamples(List.of(
                new Example("s = \"()\"", "true", null),
                new Example("s = \"()[]{}\"", "true", null),
                new Example("s = \"(]\"", "false", null)
        ));
        p2.setTests(List.of(
                new TestCase("\"()\"", "true"),
                new TestCase("\"()[]{}\"", "true"),
                new TestCase("\"(]\"", "false")
        ));
        p2.setStarterPython("class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your solution here\n        pass\n");
        p2.setStarterJavascript("/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Write your solution here\n}\n");
        p2.setStarterCpp("class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n    }\n};\n");
        p2.setStarterJava("class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n    }\n}\n");

        Problem p3 = new Problem();
        p3.setId("longest-substring");
        p3.setTitle("Longest Substring Without Repeating Characters");
        p3.setDifficulty("Medium");
        p3.setTags(List.of("String", "Sliding Window", "Hash Table"));
        p3.setStatement(List.of(
                "Given a string s, find the length of the longest substring without repeating characters.",
                "A substring is a contiguous non-empty sequence of characters within a string."
        ));
        p3.setInputFormat("A single string s.");
        p3.setOutputFormat("An integer — the length of the longest substring.");
        p3.setConstraints(List.of("0 ≤ s.length ≤ 5 × 10⁴", "s consists of English letters, digits, symbols and spaces."));
        p3.setExamples(List.of(
                new Example("s = \"abcabcbb\"", "3", "The answer is \"abc\", with the length of 3."),
                new Example("s = \"bbbbb\"", "1", "The answer is \"b\", with the length of 1."),
                new Example("s = \"pwwkew\"", "3", "The answer is \"wke\", with the length of 3.")
        ));
        p3.setTests(List.of(
                new TestCase("\"abcabcbb\"", "3"),
                new TestCase("\"bbbbb\"", "1"),
                new TestCase("\"pwwkew\"", "3")
        ));
        p3.setStarterPython("class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        pass\n");
        p3.setStarterJavascript("/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n  // Write your solution here\n}\n");
        p3.setStarterCpp("class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n    }\n};\n");
        p3.setStarterJava("class Solution {\n    public lengthOfLongestSubstring(String s) {\n        // Write your solution here\n    }\n}\n");

        Problem p4 = new Problem();
        p4.setId("merge-intervals");
        p4.setTitle("Merge Intervals");
        p4.setDifficulty("Medium");
        p4.setTags(List.of("Array", "Sorting"));
        p4.setStatement(List.of(
                "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.",
                "Return an array of the non-overlapping intervals that cover all the intervals in the input."
        ));
        p4.setInputFormat("A list of intervals [[s1,e1],[s2,e2],...].");
        p4.setOutputFormat("The merged list of intervals.");
        p4.setConstraints(List.of("1 ≤ intervals.length ≤ 10⁴", "intervals[i].length == 2", "0 ≤ start_i ≤ end_i ≤ 10⁴"));
        p4.setExamples(List.of(
                new Example("intervals = [[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]", "Intervals [1,3] and [2,6] overlap, merge them into [1,6]."),
                new Example("intervals = [[1,4],[4,5]]", "[[1,5]]", null)
        ));
        p4.setTests(List.of(
                new TestCase("[[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]"),
                new TestCase("[[1,4],[4,5]]", "[[1,5]]"),
                new TestCase("[[1,4],[0,4]]", "[[0,4]]")
        ));
        p4.setStarterPython("class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        # Write your solution here\n        pass\n");
        p4.setStarterJavascript("/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n  // Write your solution here\n}\n");
        p4.setStarterCpp("class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your solution here\n    }\n};\n");
        p4.setStarterJava("class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your solution here\n    }\n}\n");

        Problem p5 = new Problem();
        p5.setId("trapping-rain-water");
        p5.setTitle("Trapping Rain Water");
        p5.setDifficulty("Hard");
        p5.setTags(List.of("Array", "Two Pointers", "Stack"));
        p5.setStatement(List.of(
                "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining."
        ));
        p5.setInputFormat("A list of non-negative integers height.");
        p5.setOutputFormat("An integer — total units of trapped water.");
        p5.setConstraints(List.of("n == height.length", "1 ≤ n ≤ 2 × 10⁴", "0 ≤ height[i] ≤ 10⁵"));
        p5.setExamples(List.of(
                new Example("height = [0,1,0,2,1,0,1,3,2,1,2,1]", "6", "6 units of rain water are trapped."),
                new Example("height = [4,2,0,3,2,5]", "9", null)
        ));
        p5.setTests(List.of(
                new TestCase("[0,1,0,2,1,0,1,3,2,1,2,1]", "6"),
                new TestCase("[4,2,0,3,2,5]", "9"),
                new TestCase("[2,0,2]", "2")
        ));
        p5.setStarterPython("class Solution:\n    def trap(self, height: list[int]) -> int:\n        # Write your solution here\n        pass\n");
        p5.setStarterJavascript("/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n  // Write your solution here\n}\n");
        p5.setStarterCpp("class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n    }\n};\n");
        p5.setStarterJava("class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n    }\n}\n");

        problemRepository.saveAll(List.of(p1, p2, p3, p4, p5));
    }

    private void seedUserProfileAndMatches() {
        List<Problem> problems = problemRepository.findAll();
        List<Player> players = playerRepository.findAll();

        int rating = 1180;
        long nowMillis = Instant.now().toEpochMilli();
        List<MatchRecord> matches = new ArrayList<>();
        List<String> languages = List.of("python", "javascript", "cpp", "python");

        for (int i = 0; i < 24; i++) {
            boolean win = (i * 7) % 5 != 0 && i % 4 != 3;
            int delta = win ? 18 + ((i * 3) % 12) : -(12 + ((i * 5) % 10));
            rating += delta;
            Problem prob = problems.get(i % problems.size());
            Player opp = players.get((6 + (i % 9)) % players.size());
            String lang = languages.get(i % 4);

            long matchTime = nowMillis - (long) (23 - i) * 36 * 3600 * 1000L;
            matches.add(new MatchRecord(
                    "M-" + Integer.toString(48210 + i, 36).toUpperCase(),
                    "alexr",
                    opp.getId(),
                    prob.getId(),
                    prob.getDifficulty(),
                    win ? "win" : "loss",
                    delta,
                    240 + ((i * 97) % 900),
                    Instant.ofEpochMilli(matchTime).toString(),
                    lang,
                    rating
            ));
        }

        matchRecordRepository.saveAll(matches);

        UserProfile user = new UserProfile(
                "alexr",
                "Alex Rivera",
                "alexr",
                "Full-stack dev by day, competitive programmer by night. Graphs & DP enjoyer.",
                rating,
                new ArrayList<>(List.of("python", "javascript", "cpp"))
        );
        userProfileRepository.save(user);
    }

    private void seedUserAccounts() {
        String passHash = tokenService.hashPassword("password123");

        User alex = new User(
                "alexr",
                "alexr",
                "alex@codeduel.com",
                passHash,
                "Alex Rivera",
                "Full-stack dev by day, competitive programmer by night. Graphs & DP enjoyer.",
                1180,
                "US",
                280,
                Instant.now().toString()
        );
        alex.setLanguages(new ArrayList<>(List.of("python", "javascript", "cpp")));

        User demo = new User(
                "demo_user",
                "demo",
                "demo@codeduel.com",
                passHash,
                "Demo Challenger",
                "Testing out CodeDuel live duels!",
                1250,
                "CA",
                160,
                Instant.now().toString()
        );
        demo.setLanguages(new ArrayList<>(List.of("python", "javascript")));

        userRepository.saveAll(List.of(alex, demo));
    }
}
