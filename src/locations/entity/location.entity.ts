import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Repository, OneToMany, ManyToMany, ManyToOne, OneToOne } from "typeorm";
import { Faculty } from "./faculty.entity";
import { Building } from "./building.entity";
import { Report } from "src/reports/entity/report.entity";

@Entity('locations')
export class Location {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(()=>Building, (building)=>building.location)
    building: Building

    @Column()
    floor: number

    @Column()
    room: string

    @Column()
    detail: string

    @OneToOne(()=>Report, (report)=>report.location)
    report: Report

    @Column({
        default: true,
    })
    isSystem: boolean;

    @CreateDateColumn()
    createdAt: Date;

}