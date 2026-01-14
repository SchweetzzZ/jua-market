import { createAccessControl } from "better-auth/plugins/access"
import { statements } from "./statements"

export const ac = createAccessControl(statements)