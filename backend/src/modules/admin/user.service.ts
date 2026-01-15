export const listUsers = async () => {
    const res = await fetch("/admin/users")
    return res.json()
}

export const changePass = async (userId: string, newPassword: string) => {
    const res = await fetch("/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword })
    })
    return res.json()
}

export const banUser = async (userId: string) => {
    const res = await fetch("/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
    })
    return res.json()

}
export const impersonateUser = async (userId: string) => {
    const res = await fetch("/admin/impersonate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
    })
    return res.json()
}