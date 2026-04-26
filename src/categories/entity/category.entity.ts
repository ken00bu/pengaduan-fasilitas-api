import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Repository, OneToMany, ManyToOne } from "typeorm";
import { Report } from "src/reports/entity/report.entity";
import { Aspiration } from "src/aspirations/entity/aspiration.entity";
import { Priority } from "src/priority/entity/priority.entity";
import { Skill } from "src/skills/entity/skill.entity";

@Entity('categories')
export class Category {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string

    @Column({
        default: true,
    })
    isSystem: boolean;

    @ManyToOne(()=>Priority, (priority)=>priority.category)
    priority: Priority
    
    @OneToMany(()=> Report, (report)=> report.category)
    report: Report[];

    @OneToMany(()=>Aspiration, (aspiration)=>aspiration.category)
    aspiration: Aspiration

    @CreateDateColumn()
    createdAt: Date;
    
}