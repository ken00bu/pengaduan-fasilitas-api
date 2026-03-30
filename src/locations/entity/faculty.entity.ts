import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Repository, OneToMany, ManyToOne } from "typeorm";
import { Location } from "./location.entity";
import { Building } from "./building.entity";

@Entity('faculties')
export class Faculty {

    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    name: string

    @Column()
    code: string

    @OneToMany(()=> Building, (building)=> building.faculty)
    building: Building[]

    @Column({
        default: true,
    })
    isSystem: boolean;

    @CreateDateColumn()
    createdAt: Date;

}