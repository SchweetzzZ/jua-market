import { createAccessControl } from "better-auth/plugins/access"

const statements = {
    products: ["create", "read", "update", "delete", "*"],
    services: ["create", "read", "update", "delete", "*"],
} as const


export const ac = createAccessControl(statements)

// Define as roles com suas permissões
export const roles = {
    admin: ac.newRole({
        products: ["*"],
        services: ["*"],
    }),
    seller: ac.newRole({
        products: ["*"],
        services: ["*"],
    }),
    user: ac.newRole({
        products: ["read"],
        services: ["read"]
    }),
}

const rolePermissions = {
    admin: {
        products: ["*"],
        services: ["*"],
    },
    seller: {
        products: ["*"],
        services: ["*"],
    },
    user: {
        products: ["read"],
        services: ["read"]
    },
} as const

// Helper function para verificar permissões
export function checkPermission(
    userRole: string | null | undefined,
    resource: keyof typeof statements,
    action: string
): boolean {
    // Se não tem role, retorna false
    if (!userRole) {
        return false
    }

    // Pega as permissões da role do usuário
    const permissions = rolePermissions[userRole as keyof typeof rolePermissions]?.[resource] as readonly string[] | undefined

    if (!permissions) {
        return false
    }

    // Se tem permissão "*" (all), retorna true
    if (permissions.includes("*")) {
        return true
    }

    // Verifica se tem a ação específica
    return permissions.includes(action)
}