import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { Category } from "src/categories/entity/category.entity";
import { Location } from "src/locations/entity/location.entity";
import { User } from "src/users/entity/user.entity";
import { ReportStatus } from "./enum/report-status.enum";
import { SlaStatus } from "./enum/sla-status.enum";
import { Priority } from "src/priority/entity/priority.entity";
import { MaxLength, MinLength } from "class-validator";


@Entity('reports')
export class Report{

    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true, default: 'UNSET'})
    ticket: string

    @ManyToOne(()=> User, (user)=> user.report)
    user: User //relasi USER DONE

    @ManyToOne(()=> User, (user)=> user.assigned_reports, {nullable: true})
    assignedTechnician: User | null //relasi USER YANG TECHNITIAN DONE
    
    @ManyToOne(()=> Category, (category)=> category.report)
    category: Category; //relasi CATEGORY DONE

    @Column({nullable: true})
    slaDate: Date //category SLA + Date.now = Sla_date
    
    @OneToOne(()=>Location, (location)=>location.report, {nullable: true, cascade: true})
    @JoinColumn()
    location: Location //relasi LOCATION cascade TRUE (sebelum report harus ada location dulu) DONE I HOPE

    @Column({nullable: false})
    @MaxLength(60)
    @MinLength(20)
    title: string

    @Column({type: 'text', nullable: true})
    @MinLength(20)
    @MaxLength(1000)
    description: string
    
    @Column({nullable: true})
    adminNote: string

    @Column({type:"enum", enum: ReportStatus, default: ReportStatus.PENDING})
    status: ReportStatus

    @Column({type: 'enum', enum: SlaStatus, default: SlaStatus.ON_TIME})
    slaStatus: SlaStatus

    @ManyToOne(()=>Priority, (priority)=>priority.report, {nullable: true})
    priority: Priority

    @Column({nullable: true})
    technicianNote:string

    @Column({nullable: true})
    imgUrl: string

    @CreateDateColumn()
    createdAt: Date;

    @Column({nullable: true})
    reopenedAt: Date;

}