import { UserRoles } from "../entity/user.entity"

export class User{
    id: number
    email: string
    role: UserRoles
}