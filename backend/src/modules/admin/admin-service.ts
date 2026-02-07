import { auth } from "../auth/auth"

type Role = "user" | "admin" | "seller"

interface CreateUserAdminInput {
  email: string
  password: string
  name: string
  role: Role
}

/*
export const createUserAdmin = async (input: CreateUserAdminInput) => {
  try {
    const createdUser = await auth.api.createUser({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role
      }
    })

    return {
      success: true,
      message: "Usuário criado com sucesso",
      data: createdUser
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? "Erro ao criar usuário",
      data: null
    }
  }
}
*/
