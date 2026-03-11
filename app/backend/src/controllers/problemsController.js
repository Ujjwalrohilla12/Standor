// Built-in coding problems for the interview platform
const PROBLEMS = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "EASY",
    category: "Arrays",
    tags: ["array", "hash-map"],
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your solution here\n}\n",
      python: "def two_sum(nums, target):\n    # Write your solution here\n    pass\n",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n",
      cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};\n",
    },
    testCases: [
      { input: "[2,7,11,15]\n9", expected: "[0,1]" },
      { input: "[3,2,4]\n6", expected: "[1,2]" },
      { input: "[3,3]\n6", expected: "[0,1]" },
    ],
  },
  {
    id: "2",
    title: "Valid Parentheses",
    difficulty: "EASY",
    category: "Stacks",
    tags: ["stack", "string"],
    description:
      "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    starterCode: {
      javascript: "function isValid(s) {\n  // Write your solution here\n}\n",
      python: "def is_valid(s):\n    # Write your solution here\n    pass\n",
    },
    testCases: [
      { input: "()", expected: "true" },
      { input: "()[]{}", expected: "true" },
      { input: "(]", expected: "false" },
      { input: "([)]", expected: "false" },
      { input: "{[]}", expected: "true" },
    ],
  },
  {
    id: "3",
    title: "Reverse Linked List",
    difficulty: "EASY",
    category: "Linked Lists",
    tags: ["linked-list", "recursion"],
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
    ],
    starterCode: {
      javascript: "function reverseList(head) {\n  // Write your solution here\n}\n",
      python: "def reverse_list(head):\n    # Write your solution here\n    pass\n",
    },
    testCases: [
      { input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]" },
      { input: "[1,2]", expected: "[2,1]" },
      { input: "[]", expected: "[]" },
    ],
  },
  {
    id: "4",
    title: "Maximum Subarray",
    difficulty: "MEDIUM",
    category: "Dynamic Programming",
    tags: ["array", "dp", "divide-and-conquer"],
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
    ],
    starterCode: {
      javascript: "function maxSubArray(nums) {\n  // Write your solution here\n}\n",
      python: "def max_sub_array(nums):\n    # Write your solution here\n    pass\n",
    },
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "[1]", expected: "1" },
      { input: "[5,4,-1,7,8]", expected: "23" },
    ],
  },
  {
    id: "5",
    title: "Merge Intervals",
    difficulty: "MEDIUM",
    category: "Arrays",
    tags: ["array", "sorting"],
    description:
      "Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" },
    ],
    starterCode: {
      javascript: "function merge(intervals) {\n  // Write your solution here\n}\n",
      python: "def merge(intervals):\n    # Write your solution here\n    pass\n",
    },
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]" },
      { input: "[[1,4],[4,5]]", expected: "[[1,5]]" },
    ],
  },
  {
    id: "6",
    title: "LRU Cache",
    difficulty: "HARD",
    category: "Design",
    tags: ["hash-map", "linked-list", "design"],
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size `capacity`.\n- `int get(int key)` Return the value of the `key` if the key exists, otherwise return `-1`.\n- `void put(int key, int value)` Update the value of the `key` if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the `capacity`, evict the least recently used key.",
    examples: [
      {
        input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
        output: "[null,null,null,1,null,-1,null,-1,3,4]",
      },
    ],
    starterCode: {
      javascript: "class LRUCache {\n  constructor(capacity) {\n    // Initialize\n  }\n  get(key) {\n    // Return value or -1\n  }\n  put(key, value) {\n    // Insert or update\n  }\n}\n",
      python: "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        pass\n    def put(self, key: int, value: int) -> None:\n        pass\n",
    },
    testCases: [
      { input: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", expected: "1\n-1" },
    ],
  },
];

export function listProblems(req, res) {
  try {
    let filtered = [...PROBLEMS];

    const { q, difficulty, category } = req.query;

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tags.some((t) => t.includes(query))
      );
    }

    if (difficulty) {
      filtered = filtered.filter(
        (p) => p.difficulty === difficulty.toUpperCase()
      );
    }

    if (category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.status(200).json(filtered);
  } catch (error) {
    console.log("Error in listProblems:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function getProblemBySlug(req, res) {
  try {
    const title = decodeURIComponent(req.params.title);
    const problem = PROBLEMS.find(
      (p) => p.title.toLowerCase() === title.toLowerCase()
    );

    if (!problem) return res.status(404).json({ message: "Problem not found" });

    res.status(200).json(problem);
  } catch (error) {
    console.log("Error in getProblemBySlug:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function runTests(req, res) {
  try {
    const title = decodeURIComponent(req.params.title);
    const problem = PROBLEMS.find(
      (p) => p.title.toLowerCase() === title.toLowerCase()
    );

    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const { code, language } = req.body;
    if (!code) return res.status(400).json({ message: "Code is required" });

    // Return test case structure (actual execution handled by the execution endpoint)
    const results = problem.testCases.map((tc, index) => ({
      index,
      passed: false,
      hidden: index >= 2,
      input: index < 2 ? tc.input : null,
      expected: index < 2 ? tc.expected : null,
      actual: "",
      stderr: null,
    }));

    res.status(200).json({
      passed: 0,
      total: problem.testCases.length,
      results,
    });
  } catch (error) {
    console.log("Error in runTests:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
