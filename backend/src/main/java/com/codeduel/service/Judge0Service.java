package com.codeduel.service;

import com.codeduel.dto.TestCaseResult;
import com.codeduel.model.TestCase;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class Judge0Service {

    private static final Logger log = LoggerFactory.getLogger(Judge0Service.class);

    @Value("${judge0.api.url:http://54.196.209.169:2358}")
    private String apiUrl;

    @Value("${judge0.api.key:}")
    private String apiKey;

    @Value("${judge0.api.host:}")
    private String apiHost;

    @Value("${judge0.api.wait:true}")
    private boolean waitMode;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final Map<String, Integer> LANGUAGE_IDS = Map.of(
            "python", 71,       // Python (3.8.1)
            "javascript", 63,   // JavaScript (Node.js 12.14.0)
            "cpp", 54,          // C++ (GCC 9.2.0)
            "java", 62          // Java (OpenJDK 13.0.1)
    );
    public static final String DELIMITER = "__CODEDUEL_RET_VAL__";

    public String getFormattedApiUrl() {
        if (apiUrl == null || apiUrl.trim().isEmpty()) {
            return "http://host.docker.internal:2358";
        }
        String trimmed = apiUrl.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "http://" + trimmed;
        }
        // If it's a bare IP or host without a port, default to 2358 (standard Judge0 port)
        if (trimmed.matches("^https?://[0-9.]+$")) {
            trimmed = trimmed + ":2358";
        }
        return trimmed.replaceAll("/+$", "");
    }

    private List<String> getCandidateBaseUrls() {
        List<String> list = new ArrayList<>();
        String primary = getFormattedApiUrl();
        list.add(primary);
        if (primary.contains("54.196.209.169") || primary.contains("host.docker.internal")) {
            if (!primary.contains("172.17.0.1")) list.add("http://172.17.0.1:2358");
            if (!primary.contains("127.0.0.1")) list.add("http://127.0.0.1:2358");
            if (!primary.contains("localhost")) list.add("http://localhost:2358");
        }
        return list;
    }

    public boolean isLiveJudge0Configured() {
        boolean hasKey = apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equalsIgnoreCase("mock");
        String formattedUrl = getFormattedApiUrl();
        boolean isSelfHosted = formattedUrl != null && !formattedUrl.contains("rapidapi.com");
        return hasKey || isSelfHosted;
    }

    public int getLanguageId(String language) {
        if (language == null) return 71;
        return LANGUAGE_IDS.getOrDefault(language.toLowerCase(), 71);
    }

    /**
     * Executes test cases using Judge0 if configured, or uses the intelligent evaluator fallback.
     */
    public List<TestCaseResult> executeTests(String language, String code, List<TestCase> tests, String starterCode) {
        if (isLiveJudge0Configured()) {
            try {
                return executeWithJudge0(language, code, tests, starterCode);
            } catch (Exception e) {
                log.warn("Judge0 call failed: {}. Falling back to evaluator.", e.getMessage());
                return executeWithFallback(language, code, tests, starterCode);
            }
        } else {
            return executeWithFallback(language, code, tests, starterCode);
        }
    }

    public String extractMethodName(String starterCode) {
        if (starterCode == null || starterCode.isEmpty()) return null;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(?:def|function|\\b[a-zA-Z0-9_<>\\[\\]]+)\\s+([a-zA-Z0-9_]+)\\s*\\(");
        java.util.regex.Matcher matcher = pattern.matcher(starterCode);
        Set<String> keywords = Set.of("if", "for", "while", "switch", "catch", "Solution", "public", "private", "protected", "class", "void", "return");
        while (matcher.find()) {
            String name = matcher.group(1);
            if (!keywords.contains(name)) {
                return name;
            }
        }
        return null;
    }

    public String wrapCodeForExecution(String language, String code, String starterCode) {
        if (code == null) return "";
        String lang = language != null ? language.toLowerCase().trim() : "python";
        String methodName = extractMethodName(starterCode);

        if ("python".equals(lang)) {
            return wrapPython(code, methodName);
        } else if ("javascript".equals(lang)) {
            return wrapJavascript(code, methodName);
        } else if ("java".equals(lang)) {
            return wrapJava(code, methodName);
        } else if ("cpp".equals(lang)) {
            return wrapCpp(code, methodName);
        }
        return code;
    }

    private String wrapPython(String code, String methodName) {
        StringBuilder sb = new StringBuilder();
        if (!code.contains("from __future__ import annotations")) {
            sb.append("from __future__ import annotations\n");
        }
        if (!code.contains("import sys")) {
            sb.append("import sys, json, math, collections, heapq, bisect, itertools\n");
            sb.append("from typing import *\n\n");
        }
        sb.append(code);

        if (!code.contains("__name__ == '__main__'") && !code.contains("sys.stdin")) {
            sb.append("\n\nif __name__ == '__main__':\n")
              .append("    import sys, json\n")
              .append("    try:\n")
              .append("        _raw = sys.stdin.read().strip()\n")
              .append("        _lines = [l.strip() for l in _raw.splitlines() if l.strip()]\n")
              .append("        _args = []\n")
              .append("        for _l in _lines:\n")
              .append("            try:\n")
              .append("                _args.append(json.loads(_l))\n")
              .append("            except Exception:\n")
              .append("                _args.append(_l)\n")
              .append("        _sol = Solution()\n")
              .append("        _target = \"").append(methodName != null ? methodName : "").append("\"\n")
              .append("        _fn = getattr(_sol, _target, None) if _target else None\n")
              .append("        if not _fn:\n")
              .append("            _methods = [m for m in dir(_sol) if not m.startswith('_') and callable(getattr(_sol, m))]\n")
              .append("            if _methods:\n")
              .append("                _fn = getattr(_sol, _methods[0])\n")
              .append("        if _fn:\n")
              .append("            _res = _fn(*_args)\n")
              .append("            print(\"\\n__CODEDUEL_RET_VAL__\")\n")
              .append("            if isinstance(_res, bool):\n")
              .append("                print('true' if _res else 'false')\n")
              .append("            elif isinstance(_res, (list, dict)):\n")
              .append("                print(json.dumps(_res, separators=(',', ':')))\n")
              .append("            else:\n")
              .append("                print(_res)\n")
              .append("    except Exception as _e:\n")
              .append("        import traceback\n")
              .append("        traceback.print_exc()\n");
        }
        return sb.toString();
    }

    private String wrapJavascript(String code, String methodName) {
        StringBuilder sb = new StringBuilder();
        sb.append(code);
        if (!code.contains("fs.readFileSync") && !code.contains("process.stdin")) {
            sb.append("\n\nconst _fs = require('fs');\n")
              .append("try {\n")
              .append("    const _input = _fs.readFileSync(0, 'utf-8').trim();\n")
              .append("    if (_input) {\n")
              .append("        const _lines = _input.split('\\n').map(l => l.trim()).filter(Boolean);\n")
              .append("        const _args = _lines.map(line => {\n")
              .append("            try { return JSON.parse(line); } catch (e) { return line; }\n")
              .append("        });\n")
              .append("        const _target = \"").append(methodName != null ? methodName : "").append("\";\n")
              .append("        let _fn = null;\n")
              .append("        if (_target) {\n")
              .append("            try {\n")
              .append("                const _f = eval(_target);\n")
              .append("                if (typeof _f === 'function') _fn = _f;\n")
              .append("            } catch (e) {}\n")
              .append("        }\n")
              .append("        if (!_fn && typeof Solution === 'function') {\n")
              .append("            try {\n")
              .append("                const _inst = new Solution();\n")
              .append("                if (_target && typeof _inst[_target] === 'function') {\n")
              .append("                    _fn = _inst[_target].bind(_inst);\n")
              .append("                } else {\n")
              .append("                    const _proto = Object.getPrototypeOf(_inst);\n")
              .append("                    for (const m of Object.getOwnPropertyNames(_proto)) {\n")
              .append("                        if (m !== 'constructor' && typeof _inst[m] === 'function') {\n")
              .append("                            _fn = _inst[m].bind(_inst);\n")
              .append("                            break;\n")
              .append("                        }\n")
              .append("                    }\n")
              .append("                }\n")
              .append("            } catch (e) {}\n")
              .append("        }\n")
              .append("        if (!_fn) {\n")
              .append("            const _cands = ['twoSum', 'isValid', 'lengthOfLongestSubstring', 'merge', 'trap', 'maxProfit', 'isPalindrome', 'maxSubArray', 'climbStairs', 'coinChange', 'search', 'maxArea'];\n")
              .append("            for (const c of _cands) {\n")
              .append("                try {\n")
              .append("                    const _f = eval(c);\n")
              .append("                    if (typeof _f === 'function') { _fn = _f; break; }\n")
              .append("                } catch (e) {}\n")
              .append("            }\n")
              .append("        }\n")
              .append("        if (!_fn) {\n")
              .append("            try {\n")
              .append("                const _keys = Object.keys(global).filter(k => typeof global[k] === 'function' && !k.startsWith('_'));\n")
              .append("                if (_keys.length > 0) _fn = global[_keys[_keys.length - 1]];\n")
              .append("            } catch (e) {}\n")
              .append("        }\n")
              .append("        if (_fn) {\n")
              .append("            const _res = _fn(..._args);\n")
              .append("            console.log(\"\\n__CODEDUEL_RET_VAL__\");\n")
              .append("            if (typeof _res === 'boolean') {\n")
              .append("                console.log(_res ? 'true' : 'false');\n")
              .append("            } else if (typeof _res === 'object' && _res !== null) {\n")
              .append("                console.log(JSON.stringify(_res));\n")
              .append("            } else {\n")
              .append("                console.log(_res);\n")
              .append("            }\n")
              .append("        }\n")
              .append("    }\n")
              .append("} catch (_err) {\n")
              .append("    console.error(_err);\n")
              .append("}\n");
        }
        return sb.toString();
    }

    private String wrapJava(String code, String methodName) {
        if (code.contains("public static void main")) return code;
        String sanitizedCode = code.replaceAll("\\bpublic\\s+class\\s+Solution\\b", "class Solution");
        StringBuilder sb = new StringBuilder();
        if (!sanitizedCode.contains("package ")) {
            sb.append("import java.util.*;\nimport java.util.stream.*;\nimport java.lang.reflect.*;\n\n");
        }
        sb.append(sanitizedCode);
        sb.append("\n\npublic class Main {\n")
          .append("    public static void main(String[] args) throws Exception {\n")
          .append("        java.util.Scanner sc = new java.util.Scanner(System.in);\n")
          .append("        java.util.List<String> lines = new java.util.ArrayList<>();\n")
          .append("        while (sc.hasNextLine()) {\n")
          .append("            String l = sc.nextLine().trim();\n")
          .append("            if (!l.isEmpty()) lines.add(l);\n")
          .append("        }\n")
          .append("        Solution sol = new Solution();\n")
          .append("        java.lang.reflect.Method target = null;\n")
          .append("        String expectedMethod = \"").append(methodName != null ? methodName : "").append("\";\n")
          .append("        for (java.lang.reflect.Method m : Solution.class.getDeclaredMethods()) {\n")
          .append("            if (java.lang.reflect.Modifier.isPublic(m.getModifiers()) && !m.getName().startsWith(\"_\")) {\n")
          .append("                if (m.getName().equals(expectedMethod) || target == null) {\n")
          .append("                    target = m;\n")
          .append("                    if (m.getName().equals(expectedMethod)) break;\n")
          .append("                }\n")
          .append("            }\n")
          .append("        }\n")
          .append("        if (target == null) return;\n")
          .append("        Class<?>[] paramTypes = target.getParameterTypes();\n")
          .append("        Object[] callArgs = new Object[paramTypes.length];\n")
          .append("        for (int i = 0; i < paramTypes.length; i++) {\n")
          .append("            String inputLine = i < lines.size() ? lines.get(i) : \"\";\n")
          .append("            callArgs[i] = parseArg(inputLine, paramTypes[i]);\n")
          .append("        }\n")
          .append("        Object result = target.invoke(sol, callArgs);\n")
          .append("        printResult(result);\n")
          .append("    }\n\n")
          .append("    static Object parseArg(String raw, Class<?> type) {\n")
          .append("        raw = raw.trim();\n")
          .append("        if (raw.startsWith(\"\\\"\") && raw.endsWith(\"\\\"\") && raw.length() >= 2) {\n")
          .append("            raw = raw.substring(1, raw.length() - 1);\n")
          .append("        }\n")
          .append("        if (type == int[].class) {\n")
          .append("            String clean = raw.replaceAll(\"[\\\\[\\\\]\\\\s]\", \"\");\n")
          .append("            if (clean.isEmpty()) return new int[0];\n")
          .append("            String[] parts = clean.split(\",\");\n")
          .append("            int[] arr = new int[parts.length];\n")
          .append("            for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());\n")
          .append("            return arr;\n")
          .append("        } else if (type == int[][].class) {\n")
          .append("            raw = raw.trim();\n")
          .append("            if (raw.startsWith(\"[\") && raw.endsWith(\"]\")) raw = raw.substring(1, raw.length() - 1).trim();\n")
          .append("            if (raw.isEmpty()) return new int[0][0];\n")
          .append("            String[] rows = raw.split(\"(?<=\\\\])\\\\s*,\\\\s*(?=\\\\[)\");\n")
          .append("            java.util.List<int[]> rowList = new java.util.ArrayList<>();\n")
          .append("            for (String r : rows) {\n")
          .append("                String clean = r.replaceAll(\"[\\\\[\\\\]\\\\s]\", \"\");\n")
          .append("                if (clean.isEmpty()) continue;\n")
          .append("                String[] parts = clean.split(\",\");\n")
          .append("                int[] arr = new int[parts.length];\n")
          .append("                for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());\n")
          .append("                rowList.add(arr);\n")
          .append("            }\n")
          .append("            return rowList.toArray(new int[0][]);\n")
          .append("        } else if (type == int.class || type == Integer.class) {\n")
          .append("            return Integer.parseInt(raw);\n")
          .append("        } else if (type == boolean.class || type == Boolean.class) {\n")
          .append("            return Boolean.parseBoolean(raw);\n")
          .append("        } else if (type == String.class) {\n")
          .append("            return raw;\n")
          .append("        }\n")
          .append("        return raw;\n")
          .append("    }\n\n")
          .append("    static void printResult(Object res) {\n")
          .append("        System.out.println(\"\\n__CODEDUEL_RET_VAL__\");\n")
          .append("        if (res == null) return;\n")
          .append("        if (res instanceof int[]) {\n")
          .append("            System.out.println(java.util.Arrays.toString((int[]) res).replaceAll(\"\\\\s+\", \"\"));\n")
          .append("        } else if (res instanceof int[][]) {\n")
          .append("            System.out.println(java.util.Arrays.deepToString((int[][]) res).replaceAll(\"\\\\s+\", \"\"));\n")
          .append("        } else if (res instanceof Boolean) {\n")
          .append("            System.out.println((Boolean) res ? \"true\" : \"false\");\n")
          .append("        } else {\n")
          .append("            System.out.println(res);\n")
          .append("        }\n")
          .append("    }\n")
          .append("}\n");
        return sb.toString();
    }

    private String wrapCpp(String code, String methodName) {
        if (code.contains("int main(")) return code;
        StringBuilder sb = new StringBuilder();
        sb.append("#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <algorithm>\n#include <unordered_map>\n#include <unordered_set>\n#include <queue>\n#include <stack>\n#include <cmath>\nusing namespace std;\n\n");
        sb.append(code);
        sb.append("\n\n// CodeDuel Driver\n")
          .append("vector<int> _parseVec(string s) {\n")
          .append("    vector<int> res;\n")
          .append("    stringstream ss(s);\n")
          .append("    char ch;\n")
          .append("    int val;\n")
          .append("    while (ss >> ch) {\n")
          .append("        if (isdigit(ch) || ch == '-') {\n")
          .append("            ss.putback(ch);\n")
          .append("            if (ss >> val) res.push_back(val);\n")
          .append("        }\n")
          .append("    }\n")
          .append("    return res;\n")
          .append("}\n\n")
          .append("vector<vector<int>> _parse2D(string s) {\n")
          .append("    vector<vector<int>> res;\n")
          .append("    size_t i = 0;\n")
          .append("    while (i < s.size()) {\n")
          .append("        if (s[i] == '[') {\n")
          .append("            size_t end = s.find(']', i + 1);\n")
          .append("            if (end != string::npos && end > i + 1) {\n")
          .append("                auto v = _parseVec(s.substr(i, end - i + 1));\n")
          .append("                if (!v.empty()) res.push_back(v);\n")
          .append("                i = end + 1;\n")
          .append("            } else i++;\n")
          .append("        } else i++;\n")
          .append("    }\n")
          .append("    return res;\n")
          .append("}\n\n")
          .append("string _cleanStr(string s) {\n")
          .append("    s.erase(0, s.find_first_not_of(\" \\t\\r\\n\"));\n")
          .append("    s.erase(s.find_last_not_of(\" \\t\\r\\n\") + 1);\n")
          .append("    if (s.size() >= 2 && s.front() == '\"' && s.back() == '\"') {\n")
          .append("        return s.substr(1, s.size() - 2);\n")
          .append("    }\n")
          .append("    return s;\n")
          .append("}\n\n")
          .append("int main() {\n")
          .append("    vector<string> lines;\n")
          .append("    string line;\n")
          .append("    while (getline(cin, line)) {\n")
          .append("        line.erase(0, line.find_first_not_of(\" \\t\\r\\n\"));\n")
          .append("        line.erase(line.find_last_not_of(\" \\t\\r\\n\") + 1);\n")
          .append("        if (!line.empty()) lines.push_back(line);\n")
          .append("    }\n")
          .append("    Solution sol;\n")
          .append("    cout << \"\\n__CODEDUEL_RET_VAL__\\n\";\n");

        String m = methodName != null ? methodName : "twoSum";
        switch (m) {
            case "twoSum":
            case "search":
                sb.append("    if (lines.size() >= 2) {\n")
                  .append("        auto nums = _parseVec(lines[0]);\n")
                  .append("        int target = stoi(lines[1]);\n");
                if ("twoSum".equals(m)) {
                    sb.append("        auto res = sol.twoSum(nums, target);\n")
                      .append("        cout << \"[\" << res[0] << \",\" << res[1] << \"]\" << endl;\n");
                } else {
                    sb.append("        cout << sol.search(nums, target) << endl;\n");
                }
                sb.append("    }\n");
                break;
            case "isValid":
                sb.append("    if (!lines.empty()) {\n")
                  .append("        cout << (sol.isValid(_cleanStr(lines[0])) ? \"true\" : \"false\") << endl;\n")
                  .append("    }\n");
                break;
            case "lengthOfLongestSubstring":
                sb.append("    if (!lines.empty()) {\n")
                  .append("        cout << sol.lengthOfLongestSubstring(_cleanStr(lines[0])) << endl;\n")
                  .append("    } else { cout << 0 << endl; }\n");
                break;
            case "isPalindrome":
                sb.append("    if (!lines.empty()) {\n")
                  .append("        cout << (sol.isPalindrome(_cleanStr(lines[0])) ? \"true\" : \"false\") << endl;\n")
                  .append("    } else { cout << \"true\" << endl; }\n");
                break;
            case "merge":
                sb.append("    if (!lines.empty()) {\n")
                  .append("        auto intervals = _parse2D(lines[0]);\n")
                  .append("        auto res = sol.merge(intervals);\n")
                  .append("        cout << \"[\";\n")
                  .append("        for (size_t i = 0; i < res.size(); i++) {\n")
                  .append("            cout << \"[\" << res[i][0] << \",\" << res[i][1] << \"]\" << (i + 1 < res.size() ? \",\" : \"\");\n")
                  .append("        }\n")
                  .append("        cout << \"]\" << endl;\n")
                  .append("    }\n");
                break;
            case "trap":
                sb.append("    if (!lines.empty()) cout << sol.trap(_parseVec(lines[0])) << endl;\n");
                break;
            case "maxProfit":
                sb.append("    if (!lines.empty()) cout << sol.maxProfit(_parseVec(lines[0])) << endl;\n");
                break;
            case "maxSubArray":
                sb.append("    if (!lines.empty()) cout << sol.maxSubArray(_parseVec(lines[0])) << endl;\n");
                break;
            case "climbStairs":
                sb.append("    if (!lines.empty()) cout << sol.climbStairs(stoi(lines[0])) << endl;\n");
                break;
            case "coinChange":
                sb.append("    if (lines.size() >= 2) cout << sol.coinChange(_parseVec(lines[0]), stoi(lines[1])) << endl;\n");
                break;
            case "maxArea":
                sb.append("    if (!lines.empty()) cout << sol.maxArea(_parseVec(lines[0])) << endl;\n");
                break;
            default:
                sb.append("    cout << 0 << endl;\n");
                break;
        }
        sb.append("    return 0;\n}\n");
        return sb.toString();
    }

    private List<TestCaseResult> executeWithJudge0(String language, String code, List<TestCase> tests, String starterCode) {
        List<TestCaseResult> results = new ArrayList<>();
        int languageId = getLanguageId(language);
        List<String> candidateUrls = getCandidateBaseUrls();
        String executableCode = wrapCodeForExecution(language, code, starterCode);

        for (TestCase tc : tests) {
            try {
                Map<String, Object> payload = new HashMap<>();
                payload.put("source_code", executableCode);
                payload.put("language_id", languageId);
                payload.put("stdin", tc.getInput() != null ? tc.getInput() : "");
                payload.put("expected_output", tc.getExpected() != null ? tc.getExpected() : "");

                String requestBody = objectMapper.writeValueAsString(payload);

                HttpResponse<String> response = null;
                Exception lastErr = null;

                for (String baseUrl : candidateUrls) {
                    try {
                        String url = baseUrl + "/submissions?base64_encoded=false&wait=" + waitMode;
                        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                                .uri(URI.create(url))
                                .header("Content-Type", "application/json")
                                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                                .timeout(Duration.ofSeconds(6));

                        if (apiHost != null && !apiHost.trim().isEmpty() && !apiHost.equalsIgnoreCase("none")) {
                            reqBuilder.header("X-RapidAPI-Host", apiHost.trim());
                        }
                        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equalsIgnoreCase("none")) {
                            reqBuilder.header("X-RapidAPI-Key", apiKey.trim());
                            reqBuilder.header("X-Auth-Token", apiKey.trim());
                        }

                        HttpResponse<String> resp = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());
                        if (resp.statusCode() == 200 || resp.statusCode() == 201) {
                            response = resp;
                            break;
                        }
                    } catch (Exception ex) {
                        lastErr = ex;
                    }
                }

                if (response == null) {
                    if (lastErr != null) throw lastErr;
                    return executeWithFallback(language, code, tests, starterCode);
                }

                JsonNode node = objectMapper.readTree(response.body());
                int statusId = node.path("status").path("id").asInt(0);
                String stdout = node.path("stdout").asText("").trim();
                String stderr = node.path("stderr").asText("").trim();
                String compileOutput = node.path("compile_output").asText("").trim();
                double time = node.path("time").asDouble(0.0) * 1000.0; // convert to ms
                double memory = node.path("memory").asDouble(0.0) / 1024.0; // convert KB to MB

                String userStdout = "";
                String returnVal = stdout;
                int delimIdx = stdout.indexOf(DELIMITER);
                if (delimIdx >= 0) {
                    userStdout = stdout.substring(0, delimIdx).trim();
                    returnVal = stdout.substring(delimIdx + DELIMITER.length()).trim();
                }

                if (!stderr.isEmpty()) {
                    if (!userStdout.isEmpty()) userStdout += "\n";
                    userStdout += stderr;
                }
                if (!compileOutput.isEmpty()) {
                    if (!userStdout.isEmpty()) userStdout += "\n";
                    userStdout += compileOutput;
                }

                String cleanReturn = returnVal.replaceAll("\\s+", "");
                String cleanExpected = tc.getExpected() != null ? tc.getExpected().replaceAll("\\s+", "") : "";
                boolean outputMatches = !cleanReturn.isEmpty() && cleanReturn.equalsIgnoreCase(cleanExpected);

                boolean passed = false;
                if (statusId == 3) {
                    // Judge0 Accepted
                    passed = outputMatches || cleanReturn.isEmpty();
                } else if (statusId == 4 || statusId == 0) {
                    passed = outputMatches;
                }
                // Any compilation error (6), runtime error (7..12), or TLE (5) cannot pass
                if (statusId == 5 || statusId == 6 || (statusId >= 7 && statusId <= 14)) {
                    passed = false;
                }

                String displayOutput = !returnVal.isEmpty() ? returnVal : (!stderr.isEmpty() ? stderr : compileOutput);
                if (displayOutput.isEmpty()) {
                    displayOutput = passed ? tc.getExpected() : "(empty output)";
                }

                results.add(new TestCaseResult(
                        passed ? "pass" : "fail",
                        displayOutput,
                        tc.getExpected(),
                        userStdout,
                        time > 0 ? Math.round(time) : 15,
                        memory > 0 ? Math.round(memory * 10.0) / 10.0 : 14.2
                ));
            } catch (Exception e) {
                log.warn("Judge0 submission attempt failed: {}. Falling back to error result.", e.getMessage());
                return executeWithFallback(language, code, tests, starterCode);
            }
        }

        return results;
    }

    private List<TestCaseResult> executeWithFallback(String language, String code, List<TestCase> tests, String starterCode) {
        log.warn("[Judge0Service] Code execution failed or Judge0 service is unreachable.");
        List<TestCaseResult> results = new ArrayList<>();
        for (TestCase tc : tests) {
            results.add(new TestCaseResult(
                    "fail",
                    "Execution Error: Judge0 service is unreachable. Verify Judge0 is running on port 2358.",
                    tc.getExpected(),
                    "Could not connect to code execution runner.",
                    0,
                    0
            ));
        }
        return results;
    }
}

