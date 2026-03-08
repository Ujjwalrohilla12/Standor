import argon2 from 'argon2'

/**
 * FAANG-quality password hashing using Argon2id.
 * Argon2id is the winner of the Password Hashing Competition and 
 * provides strong resistance against GPU/ASIC attacks.
 */
export class HashService {
    /**
     * Hashes a password using Argon2id with recommended parameters.
     */
    static async hash(password: string): Promise<string> {
        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64MB
            timeCost: 3,         // 3 iterations
            parallelism: 1,      // 1 thread
        })
    }

    /**
     * Verifies a password against an Argon2id hash.
     */
    static async verify(hash: string, password: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, password)
        } catch (error) {
            console.error('[HashService] Verification failed:', error)
            return false
        }
    }
}
