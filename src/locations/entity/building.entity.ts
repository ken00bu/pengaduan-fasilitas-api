    import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Repository, OneToMany, ManyToOne, DeleteDateColumn } from "typeorm";
    import { Location } from "./location.entity";
    import { Faculty } from "./faculty.entity";

    @Entity('buildings')
    export class Building {

        @PrimaryGeneratedColumn()
        id: number
        
        @Column({unique: true})
        name: string

        @Column()
        floors: number

        @ManyToOne(()=> Faculty, (faculty)=> faculty.building, {nullable: true})
        faculty: Faculty

        @OneToMany(()=> Location, (location)=> location.building)
        location: Location[]
        
        @Column({
            default: true,
        })
        isSystem: boolean;

        @Column({
            default: false
        })
        isGeneral: boolean

        @CreateDateColumn()
        created_at: Date;

        @DeleteDateColumn()
        delete_at: Date

    }