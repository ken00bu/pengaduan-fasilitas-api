import { ReportStatus } from "../entity/enum/report-status.enum"
import { UpdateReportV2Dto } from "../dto/update-report-v2.dto"
import { UserRoles } from "src/users/entity/user.entity"

const FIELD_PERMISSIONS = {
            categoryId: [UserRoles.USER, UserRoles.ADMIN],
            buildingId: [UserRoles.USER, UserRoles.ADMIN],
            room: [UserRoles.USER, UserRoles.ADMIN],
            floor: [UserRoles.USER, UserRoles.ADMIN],
            detail: [UserRoles.USER, UserRoles.ADMIN],
            title: [UserRoles.USER, UserRoles.ADMIN],
            description: [UserRoles.USER, UserRoles.ADMIN],
            status: [UserRoles.ADMIN, UserRoles.TECHNICIAN],
            slaStatus: [UserRoles.ADMIN, UserRoles.TECHNICIAN],
            assignedTechnicianId: [UserRoles.ADMIN],
            slaDate: [UserRoles.ADMIN],
            adminNote: [UserRoles.ADMIN],
            reopenedAt: [UserRoles.ADMIN],
            priority: [UserRoles.ADMIN],
            technicianNote: [UserRoles.TECHNICIAN],
        }

const TECHNICIAN_ALLOWED_STATUS = [ReportStatus.REJECTED_BY_TECHNICIAN, ReportStatus.DONE]
const LOCATION = ['buildingId', 'room', 'floor', 'detail']

export type FilteredReportDto = {
    categoryId?: number
    buildingId?: number
    room?: string
    reopenedAt?: string
    floor?: string
    detail?: string
    title?: string
    description?: string
    slaDate?: number
    status?: string
    slaStatus?: string
    assignedTechnicianId?: string
    adminNote?: string
    priority?: string
    technicianNote?: string
    location?: {
        buildingId?: number
        room?: string
        floor?: string
        detail?: string
    }
}

export const getFilteredDto = (dto: UpdateReportV2Dto, role: UserRoles) => {

    const errors: any = []
    const filteredDto: FilteredReportDto = {}
    const { id, file, ...rest } = dto

    for (const [field, value] of Object.entries(rest)){
        if (value === undefined || value === null || value === '') continue;
        const allowedRoles = FIELD_PERMISSIONS[field]
        if(!allowedRoles || !allowedRoles.includes(role)){
            errors.push(`Role ${role} tidak boleh update field ${field}`);
            continue
        }

        if(field === 'status' && role === UserRoles.TECHNICIAN){
            if(!TECHNICIAN_ALLOWED_STATUS.includes(value as ReportStatus)){
                errors.push(`Teknisi tidak boleh set status ke '${value}'`);
                continue
            }
        }
        
        if (!LOCATION.includes(field)) {
            filteredDto[field] = value
            continue
        }
        
        filteredDto['location'] = {
            ...filteredDto['location'],
            [field]: value
        }
    }
    return {errors, filteredDto}
}