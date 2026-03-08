import mongoose from 'mongoose'
import User from '../apps/backend/src/models/User.js'
import Problem from '../apps/backend/src/models/Problem.js'
import InterviewRoom from '../apps/backend/src/models/InterviewRoom.js'
import { nanoid } from 'nanoid'

const MONGO_URI = 'mongodb://localhost:27017/standor'

async function seed() {
    console.log('--- Database Seeding Started ---')
    await mongoose.connect(MONGO_URI)

    // Clear existing
    await User.deleteMany({})
    await Problem.deleteMany({})
    await InterviewRoom.deleteMany({})

    // Create User
    const user = await User.create({
        name: 'Demo Principal',
        email: 'principal@standor.dev',
        avatar: 'https://github.com/shadcn.png'
    })

    // Create Problem
    const problem = await Problem.create({
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'EASY',
        content: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        template: 'function twoSum(nums, target) {\n  // Implementation here\n}'
    })

    // Create Interview Room
    await InterviewRoom.create({
        roomId: nanoid(10),
        title: 'Technical Round - Principal Engineer',
        problemId: problem._id,
        hostId: user._id,
        status: 'active'
    })

    console.log('--- Seeding Successful ---')
    process.exit(0)
}

seed().catch(err => {
    console.error('Seeding failed:', err)
    process.exit(1)
})
