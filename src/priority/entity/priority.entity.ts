import { Category } from "src/categories/entity/category.entity";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne, OneToMany } from "typeorm";
import { Report } from "src/reports/entity/report.entity";


@Entity('priorities')
export class Priority{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string
    
    @Column()
    slaHours: number

    @Column()
    weight: number

    @OneToMany(()=>Category, (category)=>category.priority)
    category: Category[]

    @OneToMany(()=>Report, (report)=>report.priority)
    report: Report[]

}