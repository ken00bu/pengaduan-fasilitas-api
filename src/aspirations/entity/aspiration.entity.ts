import { Report } from "src/reports/entity/report.entity";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { User } from "src/users/entity/user.entity";
import { Category } from "src/categories/entity/category.entity";

@Entity('aspirations')
export class Aspiration {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(()=> User, (user)=> user.report)
    user: User //relasi USER DONE

    @Column()
    title: string

    @ManyToOne(()=> Category, (category)=>category.aspiration)
    category: Category

    @Column({nullable: true})
    img_url: string

    @CreateDateColumn()
    created_at: Date;

}