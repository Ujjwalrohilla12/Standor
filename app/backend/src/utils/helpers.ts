/**
 * Backend Helper Functions
 */
export const helpers = {
    isValidObjectId(id: string) {
        return /^[0-9a-fA-F]{24}$/.test(id)
    },

    parseQuery(query: any) {
        return {
            page: parseInt(query.page) || 1,
            limit: parseInt(query.limit) || 10,
            search: query.search || ''
        }
    }
}
