import { auth } from "../auth/auth"

export const listUsers = async () => {
    return await auth.api.listUsers({
        query: {
            limit: 10
        }
    })
}
export const banUser = async (userId: string) => {
    await auth.api.banUser({
        userId,
        reason: "Banned by admin"
    })
    await auth.api.revokeUserSessions({
        userId
    })

    return { success: true, message: "User banned successfully" }
}