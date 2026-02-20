import { auth } from "../auth/auth"

type Role = "user" | "admin" | "seller"

interface CreateUserAdminInput {
  email: string
  password: string
  name: string
  role: Role
}
