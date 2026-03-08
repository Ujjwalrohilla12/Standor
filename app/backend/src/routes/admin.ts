import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import Organization from '../models/Organization.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/stats', authMiddleware, async (req, res) => {
    // Admin dashboard stats
    const usersCount = await User.countDocuments()
    const orgsCount = await Organization.countDocuments()
    res.json({ usersCount, orgsCount })
})

export default router
