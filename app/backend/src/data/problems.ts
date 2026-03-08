export interface Problem {
    id: string
    title: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    category: string
    tags: string[]
    description: string
    examples: { input: string; output: string; explanation?: string }[]
    starterCode: Record<string, string>
    testCases: { input: string; expected: string; hidden: boolean }[]
}

export const DEMO_PROBLEMS: Problem[] = [
    {
        id: '1',
        title: 'Two Sum',
        difficulty: 'EASY',
        category: 'Arrays',
        tags: ['Hash Table', 'Array'],
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            }
        ],
        starterCode: {
            javascript: 'function twoSum(nums, target) {\n  // your code\n}',
            python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass'
        },
        testCases: [
            { input: '2 7 11 15\n9', expected: '0 1', hidden: false },
            { input: '3 2 4\n6', expected: '1 2', hidden: false }
        ]
    },
    {
        id: '2',
        title: 'Reverse String',
        difficulty: 'EASY',
        category: 'Strings',
        tags: ['Two Pointers', 'String'],
        description: 'Write a function that reverses a string.',
        examples: [
            { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
        ],
        starterCode: {
            javascript: 'function reverseString(s) {\n  // your code\n}',
            python: 'class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        pass'
        },
        testCases: [
            { input: 'h e l l o', expected: 'o l l e h', hidden: false }
        ]
    }
]
