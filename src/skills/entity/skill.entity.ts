import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Repository, OneToMany, ManyToOne, OneToOne } from "typeorm";
import { Report } from "src/reports/entity/report.entity";
import { Aspiration } from "src/aspirations/entity/aspiration.entity";
import { Priority } from "src/priority/entity/priority.entity";
import { Category } from "src/categories/entity/category.entity";
import { User } from "src/users/entity/user.entity";

@Entity('skills')
export class Skill {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string

    @Column({
        default: true,
    })
    isSystem: boolean;

    @OneToMany(()=>User, (user)=>user.skill)
    user: User
    
    @CreateDateColumn()
    createdAt: Date;
    
}