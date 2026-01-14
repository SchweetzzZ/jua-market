import { ac } from "./access-control"

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
