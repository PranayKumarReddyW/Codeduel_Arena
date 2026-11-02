export type Tier = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Language = "python" | "javascript" | "cpp" | "java";

export function getTier(rating: number): Tier {
  if (rating >= 2200) return "Master";
  if (rating >= 1800) return "Expert";
  if (rating >= 1400) return "Advanced";
  if (rating >= 1000) return "Intermediate";
  return "Beginner";
}

export const TIER_CLASS: Record<Tier, string> = {
  Beginner: "text-tier-beginner border-tier-beginner/40 bg-tier-beginner/10",
  Intermediate: "text-tier-intermediate border-tier-intermediate/40 bg-tier-intermediate/10",
  Advanced: "text-tier-advanced border-tier-advanced/40 bg-tier-advanced/10",
  Expert: "text-tier-expert border-tier-expert/40 bg-tier-expert/10",
  Master: "text-tier-master border-tier-master/40 bg-tier-master/10",
};

export const DIFF_CLASS: Record<Difficulty, string> = {
  Easy: "text-success bg-success/10 border-success/30",
  Medium: "text-warning bg-warning/10 border-warning/30",
  Hard: "text-destructive bg-destructive/10 border-destructive/30",
};

export interface Player {
  id: string;
  name: string;
  handle: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  country: string;
  hue: number;
}

export const PLAYERS: Player[] = [
  { id: "p1", name: "Aiko Tanaka", handle: "aiko.exe", rating: 2487, wins: 412, losses: 98, streak: 14, country: "JP", hue: 290 },
  { id: "p2", name: "Lukas Weber", handle: "segfault_lw", rating: 2391, wins: 388, losses: 121, streak: 6, country: "DE", hue: 210 },
  { id: "p3", name: "Priya Nair", handle: "priyacodes", rating: 2305, wins: 351, losses: 110, streak: 9, country: "IN", hue: 150 },
  { id: "p4", name: "Marcus Hill", handle: "mhill", rating: 2188, wins: 299, losses: 140, streak: 3, country: "US", hue: 30 },
  { id: "p5", name: "Sofia Rossi", handle: "sofi_r", rating: 2102, wins: 280, losses: 133, streak: 5, country: "IT", hue: 340 },
  { id: "p6", name: "Chen Wei", handle: "dp_master", rating: 1996, wins: 261, losses: 150, streak: 2, country: "CN", hue: 0 },
  { id: "p7", name: "Omar Haddad", handle: "omarh", rating: 1874, wins: 230, losses: 162, streak: 4, country: "AE", hue: 60 },
  { id: "p8", name: "Emma Larsen", handle: "emmal", rating: 1780, wins: 205, losses: 170, streak: 1, country: "NO", hue: 190 },
  { id: "p9", name: "Diego Alvarez", handle: "dalvarez", rating: 1702, wins: 188, losses: 159, streak: 7, country: "MX", hue: 110 },
  { id: "p10", name: "Hana Kim", handle: "hanabyte", rating: 1655, wins: 176, losses: 151, streak: 2, country: "KR", hue: 260 },
  { id: "p11", name: "Noah Brown", handle: "nbrown", rating: 1589, wins: 160, losses: 149, streak: 0, country: "CA", hue: 20 },
  { id: "p12", name: "Zara Ali", handle: "zara.dev", rating: 1512, wins: 148, losses: 140, streak: 3, country: "PK", hue: 320 },
  { id: "p13", name: "Felix Moreau", handle: "fmoreau", rating: 1430, wins: 131, losses: 133, streak: 1, country: "FR", hue: 230 },
  { id: "p14", name: "Ivy Chen", handle: "ivyc", rating: 1366, wins: 118, losses: 120, streak: 2, country: "SG", hue: 170 },
  { id: "p15", name: "Tom Becker", handle: "tbeck", rating: 1240, wins: 97, losses: 110, streak: 0, country: "AT", hue: 45 },
];

export interface Example { input: string; output: string; explanation?: string }
export interface TestCase { input: string; expected: string }
export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  statement: string[];
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: Example[];
  tests: TestCase[];
  starter: Record<Language, string>;
}

export const PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    statement: [
      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
      "You may assume that each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.",
    ],
    inputFormat: "First line: space-separated integers nums. Second line: integer target.",
    outputFormat: "Two space-separated indices i and j (i < j).",
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists."],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, so we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    tests: [
      { input: "[2,7,11,15]\n9", expected: "[0,1]" },
      { input: "[3,2,4]\n6", expected: "[1,2]" },
      { input: "[3,3]\n6", expected: "[0,1]" },
    ],
    starter: {
      python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass\n",
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your solution here\n}\n",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};\n",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n    }\n}\n",
    },
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    statement: [
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      "An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    ],
    inputFormat: "A single string s.",
    outputFormat: "true if s is valid, otherwise false.",
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'."],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    tests: [
      { input: '"()"', expected: "true" },
      { input: '"()[]{}"', expected: "true" },
      { input: '"(]"', expected: "false" },
    ],
    starter: {
      python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your solution here\n        pass\n",
      javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Write your solution here\n}\n",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n    }\n};\n",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n    }\n}\n",
    },
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["String", "Sliding Window", "Hash Table"],
    statement: [
      "Given a string s, find the length of the longest substring without repeating characters.",
      "A substring is a contiguous non-empty sequence of characters within a string.",
    ],
    inputFormat: "A single string s.",
    outputFormat: "An integer — the length of the longest substring.",
    constraints: ["0 ≤ s.length ≤ 5 × 10⁴", "s consists of English letters, digits, symbols and spaces."],
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' },
    ],
    tests: [
      { input: '"abcabcbb"', expected: "3" },
      { input: '"bbbbb"', expected: "1" },
      { input: '"pwwkew"', expected: "3" },
    ],
    starter: {
      python: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        pass\n",
      javascript: "/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n  // Write your solution here\n}\n",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n    }\n};\n",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n    }\n}\n",
    },
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Array", "Sorting"],
    statement: [
      "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.",
      "Return an array of the non-overlapping intervals that cover all the intervals in the input.",
    ],
    inputFormat: "A list of intervals [[s1,e1],[s2,e2],...].",
    outputFormat: "The merged list of intervals.",
    constraints: ["1 ≤ intervals.length ≤ 10⁴", "intervals[i].length == 2", "0 ≤ start_i ≤ end_i ≤ 10⁴"],
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Intervals [1,3] and [2,6] overlap, merge them into [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" },
    ],
    tests: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]" },
      { input: "[[1,4],[4,5]]", expected: "[[1,5]]" },
      { input: "[[1,4],[0,4]]", expected: "[[0,4]]" },
    ],
    starter: {
      python: "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        # Write your solution here\n        pass\n",
      javascript: "/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n  // Write your solution here\n}\n",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your solution here\n    }\n};\n",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your solution here\n    }\n}\n",
    },
  },
  {
    id: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Stack"],
    statement: [
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    ],
    inputFormat: "A list of non-negative integers height.",
    outputFormat: "An integer — total units of trapped water.",
    constraints: ["n == height.length", "1 ≤ n ≤ 2 × 10⁴", "0 ≤ height[i] ≤ 10⁵"],
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "6 units of rain water are trapped." },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    tests: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expected: "6" },
      { input: "[4,2,0,3,2,5]", expected: "9" },
      { input: "[2,0,2]", expected: "2" },
    ],
    starter: {
      python: "class Solution:\n    def trap(self, height: list[int]) -> int:\n        # Write your solution here\n        pass\n",
      javascript: "/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n  // Write your solution here\n}\n",
      cpp: "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n    }\n};\n",
      java: "class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n    }\n}\n",
    },
  },
];

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript" },
  { id: "cpp", label: "C++ 17" },
  { id: "java", label: "Java 21" },
];

export function getProblem(id: string) {
  return PROBLEMS.find((p) => p.id === id) ?? PROBLEMS[0]!;
}

export function getPlayer(id: string) {
  return PLAYERS.find((p) => p.id === id);
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
