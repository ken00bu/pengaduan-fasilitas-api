import { Report } from "src/reports/entity/report.entity";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Category } from "src/categories/entity/category.entity";

export enum UserRoles {
    USER = 'user',
    ADMIN = 'admin',
    TECHNICIAN = 'technician'
}

enum UserType {
    MAHASISWA = 'mahasiswa',
    STAFF = 'staff'
}

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: 'unverified_user' })
    username: string //user

    @Column({ nullable: true })
    email: string 

    @Column({ nullable: true, default: false })
    email_is_verified: boolean

    @Column({ nullable: true })
    hashed_password: string 

    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.MAHASISWA,
        nullable: true
    })
    user_type: UserType;

    @OneToMany(()=>Report, (report)=>report.user)
    report: Report[]

    @OneToMany(()=>Report, (report)=>report.assignedTechnician)
    assigned_report: Report[]

    @Column({
        type: "enum",
        enum: UserRoles,
        default: UserRoles.USER
    })
    role: UserRoles

    @ManyToMany(()=> Category)
    @JoinTable()
    skills: Category[]

    @CreateDateColumn()
    created_at: Date

}