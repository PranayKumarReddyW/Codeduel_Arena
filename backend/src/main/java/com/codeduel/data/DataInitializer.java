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
        if (problemRepository.count() < 12) {
            log.info("[DataInitializer] Seeding competitive arena problems and hidden test cases...");
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
                new TestCase("[2,7,11,15]\n9", "[0,1]", false),
                new TestCase("[3,2,4]\n6", "[1,2]", false),
                new TestCase("[3,3]\n6", "[0,1]", false),
                new TestCase("[1,5,8,12,14]\n13", "[1,2]", true),
                new TestCase("[0,4,3,0]\n0", "[0,3]", true),
                new TestCase("[-3,4,3,90]\n0", "[0,2]", true),
                new TestCase("[1,2,3,4,5,6]\n11", "[4,5]", true),
                new TestCase("[1000000,-1000000]\n0", "[0,1]", true),
                new TestCase("[2,5,5,11]\n10", "[1,2]", true)
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
                new TestCase("\"()\"", "true", false),
                new TestCase("\"()[]{}\"", "true", false),
                new TestCase("\"(]\"", "false", false),
                new TestCase("\"([{}])\"", "true", true),
                new TestCase("\"[(])\"", "false", true),
                new TestCase("\"{\"", "false", true),
                new TestCase("\"(((((())))))\"", "true", true),
                new TestCase("\"()()()()\"", "true", true),
                new TestCase("\"][{\"", "false", true)
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
                new TestCase("\"abcabcbb\"", "3", false),
                new TestCase("\"bbbbb\"", "1", false),
                new TestCase("\"pwwkew\"", "3", false),
                new TestCase("\"\"", "0", true),
                new TestCase("\" \"", "1", true),
                new TestCase("\"au\"", "2", true),
                new TestCase("\"dvdf\"", "3", true),
                new TestCase("\"abcdefg\"", "7", true),
                new TestCase("\"tmmzuxt\"", "5", true)
        ));
        p3.setStarterPython("class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        pass\n");
        p3.setStarterJavascript("/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n  // Write your solution here\n}\n");
        p3.setStarterCpp("class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n    }\n};\n");
        p3.setStarterJava("class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n    }\n}\n");

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
                new TestCase("[[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]", false),
                new TestCase("[[1,4],[4,5]]", "[[1,5]]", false),
                new TestCase("[[1,4],[0,4]]", "[[0,4]]", false),
                new TestCase("[[1,4],[2,3]]", "[[1,4]]", true),
                new TestCase("[[1,4],[0,0]]", "[[0,0],[1,4]]", true),
                new TestCase("[[2,3],[4,5],[6,7],[8,9],[1,10]]", "[[1,10]]", true),
                new TestCase("[[1,4],[5,6]]", "[[1,4],[5,6]]", true),
                new TestCase("[[1,10]]", "[[1,10]]", true),
                new TestCase("[[1,3],[2,4],[5,7],[6,8]]", "[[1,4],[5,8]]", true)
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
                new TestCase("[0,1,0,2,1,0,1,3,2,1,2,1]", "6", false),
                new TestCase("[4,2,0,3,2,5]", "9", false),
                new TestCase("[2,0,2]", "2", false),
                new TestCase("[3,0,0,2,0,4]", "10", true),
                new TestCase("[0,2,0]", "0", true),
                new TestCase("[5,4,1,2]", "1", true),
                new TestCase("[5]", "0", true),
                new TestCase("[4,2,3]", "1", true),
                new TestCase("[1,2,3,4,5]", "0", true)
        ));
        p5.setStarterPython("class Solution:\n    def trap(self, height: list[int]) -> int:\n        # Write your solution here\n        pass\n");
        p5.setStarterJavascript("/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n  // Write your solution here\n}\n");
        p5.setStarterCpp("class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n    }\n};\n");
        p5.setStarterJava("class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n    }\n}\n");

        Problem p6 = new Problem();
        p6.setId("best-time-to-buy-and-sell-stock");
        p6.setTitle("Best Time to Buy and Sell Stock");
        p6.setDifficulty("Easy");
        p6.setTags(List.of("Array", "Dynamic Programming"));
        p6.setStatement(List.of(
                "You are given an array prices where prices[i] is the price of a given stock on the ith day.",
                "You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
                "Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0."
        ));
        p6.setInputFormat("An array of integers prices.");
        p6.setOutputFormat("An integer representing the maximum profit.");
        p6.setConstraints(List.of("1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"));
        p6.setExamples(List.of(
                new Example("prices = [7,1,5,3,6,4]", "5", "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."),
                new Example("prices = [7,6,4,3,1]", "0", "In this case, no transactions are done and the max profit = 0.")
        ));
        p6.setTests(List.of(
                new TestCase("[7,1,5,3,6,4]", "5", false),
                new TestCase("[7,6,4,3,1]", "0", false),
                new TestCase("[1,2]", "1", false),
                new TestCase("[2,4,1]", "2", true),
                new TestCase("[3,2,6,5,0,3]", "4", true),
                new TestCase("[1]", "0", true),
                new TestCase("[2,1,2,1,0,1,2]", "2", true),
                new TestCase("[3,3,5,0,0,3,1,4]", "4", true),
                new TestCase("[1,4,2]", "3", true)
        ));
        p6.setStarterPython("class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        # Write your solution here\n        pass\n");
        p6.setStarterJavascript("/**\n * @param {number[]} prices\n * @return {number}\n */\nfunction maxProfit(prices) {\n  // Write your solution here\n}\n");
        p6.setStarterCpp("class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your solution here\n    }\n};\n");
        p6.setStarterJava("class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n    }\n}\n");

        Problem p7 = new Problem();
        p7.setId("valid-palindrome");
        p7.setTitle("Valid Palindrome");
        p7.setDifficulty("Easy");
        p7.setTags(List.of("String", "Two Pointers"));
        p7.setStatement(List.of(
                "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
                "Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise."
        ));
        p7.setInputFormat("A single string s.");
        p7.setOutputFormat("true if s is a palindrome, false otherwise.");
        p7.setConstraints(List.of("1 ≤ s.length ≤ 2 × 10⁵", "s consists only of printable ASCII characters."));
        p7.setExamples(List.of(
                new Example("s = \"A man, a plan, a canal: Panama\"", "true", "\"amanaplanacanalpanama\" is a palindrome."),
                new Example("s = \"race a car\"", "false", "\"raceacar\" is not a palindrome.")
        ));
        p7.setTests(List.of(
                new TestCase("\"A man, a plan, a canal: Panama\"", "true", false),
                new TestCase("\"race a car\"", "false", false),
                new TestCase("\" \"", "true", false),
                new TestCase("\"0P\"", "false", true),
                new TestCase("\"ab_a\"", "true", true),
                new TestCase("\"a.\"", "true", true),
                new TestCase("\"Was it a car or a cat I saw?\"", "true", true),
                new TestCase("\"tab a cat\"", "false", true),
                new TestCase("\"Madam, in Eden, I'm Adam\"", "true", true)
        ));
        p7.setStarterPython("class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # Write your solution here\n        pass\n");
        p7.setStarterJavascript("/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isPalindrome(s) {\n  // Write your solution here\n}\n");
        p7.setStarterCpp("class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your solution here\n    }\n};\n");
        p7.setStarterJava("class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n    }\n}\n");

        Problem p8 = new Problem();
        p8.setId("maximum-subarray");
        p8.setTitle("Maximum Subarray");
        p8.setDifficulty("Medium");
        p8.setTags(List.of("Array", "Dynamic Programming", "Divide and Conquer"));
        p8.setStatement(List.of(
                "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
                "A subarray is a contiguous non-empty sequence of elements within an array."
        ));
        p8.setInputFormat("An integer array nums.");
        p8.setOutputFormat("An integer — largest sum of any contiguous subarray.");
        p8.setConstraints(List.of("1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"));
        p8.setExamples(List.of(
                new Example("nums = [-2,1,-3,4,-1,2,1,-5,4]", "6", "The subarray [4,-1,2,1] has the largest sum 6."),
                new Example("nums = [5,4,-1,7,8]", "23", "The subarray [5,4,-1,7,8] has the largest sum 23.")
        ));
        p8.setTests(List.of(
                new TestCase("[-2,1,-3,4,-1,2,1,-5,4]", "6", false),
                new TestCase("[1]", "1", false),
                new TestCase("[5,4,-1,7,8]", "23", false),
                new TestCase("[-1]", "-1", true),
                new TestCase("[-2,-1]", "-1", true),
                new TestCase("[-1,-2]", "-1", true),
                new TestCase("[1,2,3,4,5]", "15", true),
                new TestCase("[-2,1]", "1", true),
                new TestCase("[8,-19,5,-4,20]", "21", true)
        ));
        p8.setStarterPython("class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass\n");
        p8.setStarterJavascript("/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n  // Write your solution here\n}\n");
        p8.setStarterCpp("class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n    }\n};\n");
        p8.setStarterJava("class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n    }\n}\n");

        Problem p9 = new Problem();
        p9.setId("climbing-stairs");
        p9.setTitle("Climbing Stairs");
        p9.setDifficulty("Easy");
        p9.setTags(List.of("Dynamic Programming", "Math"));
        p9.setStatement(List.of(
                "You are climbing a staircase. It takes n steps to reach the top.",
                "Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?"
        ));
        p9.setInputFormat("An integer n.");
        p9.setOutputFormat("An integer — distinct ways to climb to the top.");
        p9.setConstraints(List.of("1 ≤ n ≤ 45"));
        p9.setExamples(List.of(
                new Example("n = 2", "2", "There are two ways: 1 step + 1 step, or 2 steps."),
                new Example("n = 3", "3", "There are three ways: 1+1+1, 1+2, or 2+1.")
        ));
        p9.setTests(List.of(
                new TestCase("2", "2", false),
                new TestCase("3", "3", false),
                new TestCase("4", "5", false),
                new TestCase("1", "1", true),
                new TestCase("5", "8", true),
                new TestCase("6", "13", true),
                new TestCase("7", "21", true),
                new TestCase("8", "34", true),
                new TestCase("10", "89", true)
        ));
        p9.setStarterPython("class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your solution here\n        pass\n");
        p9.setStarterJavascript("/**\n * @param {number} n\n * @return {number}\n */\nfunction climbStairs(n) {\n  // Write your solution here\n}\n");
        p9.setStarterCpp("class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n    }\n};\n");
        p9.setStarterJava("class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n    }\n}\n");

        Problem p10 = new Problem();
        p10.setId("coin-change");
        p10.setTitle("Coin Change");
        p10.setDifficulty("Medium");
        p10.setTags(List.of("Dynamic Programming", "Breadth-First Search"));
        p10.setStatement(List.of(
                "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.",
                "Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
                "You may assume that you have an infinite number of each kind of coin."
        ));
        p10.setInputFormat("Line 1: space-separated integers coins. Line 2: integer amount.");
        p10.setOutputFormat("An integer — minimum coins needed, or -1 if impossible.");
        p10.setConstraints(List.of("1 ≤ coins.length ≤ 12", "1 ≤ coins[i] ≤ 2³¹ - 1", "0 ≤ amount ≤ 10⁴"));
        p10.setExamples(List.of(
                new Example("coins = [1,2,5], amount = 11", "3", "11 = 5 + 5 + 1 (3 coins)"),
                new Example("coins = [2], amount = 3", "-1", "Cannot form 3 using only 2.")
        ));
        p10.setTests(List.of(
                new TestCase("[1,2,5]\n11", "3", false),
                new TestCase("[2]\n3", "-1", false),
                new TestCase("[1]\n0", "0", false),
                new TestCase("[1]\n1", "1", true),
                new TestCase("[1]\n2", "2", true),
                new TestCase("[2,5,10,1]\n27", "4", true),
                new TestCase("[186,419,83,408]\n6249", "20", true),
                new TestCase("[2,4,6]\n7", "-1", true),
                new TestCase("[1,2,5]\n100", "20", true)
        ));
        p10.setStarterPython("class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        # Write your solution here\n        pass\n");
        p10.setStarterJavascript("/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount) {\n  // Write your solution here\n}\n");
        p10.setStarterCpp("class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your solution here\n    }\n};\n");
        p10.setStarterJava("class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n    }\n}\n");

        Problem p11 = new Problem();
        p11.setId("binary-search");
        p11.setTitle("Binary Search");
        p11.setDifficulty("Easy");
        p11.setTags(List.of("Array", "Binary Search"));
        p11.setStatement(List.of(
                "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
                "If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity."
        ));
        p11.setInputFormat("Line 1: space-separated integers nums. Line 2: integer target.");
        p11.setOutputFormat("An integer index of target, or -1 if not found.");
        p11.setConstraints(List.of("1 ≤ nums.length ≤ 10⁴", "-10⁴ < nums[i], target < 10⁴", "All elements in nums are unique and sorted in ascending order."));
        p11.setExamples(List.of(
                new Example("nums = [-1,0,3,5,9,12], target = 9", "4", "9 exists in nums and its index is 4"),
                new Example("nums = [-1,0,3,5,9,12], target = 2", "-1", "2 does not exist in nums so return -1")
        ));
        p11.setTests(List.of(
                new TestCase("[-1,0,3,5,9,12]\n9", "4", false),
                new TestCase("[-1,0,3,5,9,12]\n2", "-1", false),
                new TestCase("[5]\n5", "0", false),
                new TestCase("[2,5]\n5", "1", true),
                new TestCase("[2,5]\n2", "0", true),
                new TestCase("[2,5]\n0", "-1", true),
                new TestCase("[-1,0,5]\n-1", "0", true),
                new TestCase("[-1,0,5]\n5", "2", true),
                new TestCase("[1,3,5,7,9,11,13]\n11", "5", true)
        ));
        p11.setStarterPython("class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        # Write your solution here\n        pass\n");
        p11.setStarterJavascript("/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target) {\n  // Write your solution here\n}\n");
        p11.setStarterCpp("class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};\n");
        p11.setStarterJava("class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n    }\n}\n");

        Problem p12 = new Problem();
        p12.setId("container-with-most-water");
        p12.setTitle("Container With Most Water");
        p12.setDifficulty("Medium");
        p12.setTags(List.of("Array", "Two Pointers", "Greedy"));
        p12.setStatement(List.of(
                "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).",
                "Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store."
        ));
        p12.setInputFormat("An integer array height.");
        p12.setOutputFormat("An integer representing maximum area of water stored.");
        p12.setConstraints(List.of("n == height.length", "2 ≤ n ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"));
        p12.setExamples(List.of(
                new Example("height = [1,8,6,2,5,4,8,3,7]", "49", "The vertical lines are at index 1 and index 8. The max area is (8 - 1) * 7 = 49."),
                new Example("height = [1,1]", "1", "The max area is (1 - 0) * 1 = 1.")
        ));
        p12.setTests(List.of(
                new TestCase("[1,8,6,2,5,4,8,3,7]", "49", false),
                new TestCase("[1,1]", "1", false),
                new TestCase("[4,3,2,1,4]", "16", false),
                new TestCase("[1,2,1]", "2", true),
                new TestCase("[2,3,4,5,18,17,6]", "17", true),
                new TestCase("[1,2,4,3]", "4", true),
                new TestCase("[6,9]", "6", true),
                new TestCase("[1,8,6,2,5,4,8,25,7]", "49", true),
                new TestCase("[2,1]", "1", true)
        ));
        p12.setStarterPython("class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # Write your solution here\n        pass\n");
        p12.setStarterJavascript("/**\n * @param {number[]} height\n * @return {number}\n */\nfunction maxArea(height) {\n  // Write your solution here\n}\n");
        p12.setStarterCpp("class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your solution here\n    }\n};\n");
        p12.setStarterJava("class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n    }\n}\n");

        problemRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12));
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
