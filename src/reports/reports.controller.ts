import { Body, Controller, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors, UsePipes, Get, Query, Delete, ParseIntPipe, Sse } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UpdateReportDto } from './dto/update-report.dto';
import { ParseJsonPipe } from './pipes/parse-json-pipe.pipe';
import { FindReportDto } from './dto/find-report.dto';
import { Observable } from 'rxjs';
import { User } from 'src/users/type/user.type';
import { UserRoles } from 'src/users/entity/user.entity';


@Controller('reports')
export class ReportsController {

    constructor(
        private reportsService: ReportsService,
        private authService: AuthService
    ){}

    //sse
    @Sse('stream')
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    stream(): Observable<MessageEvent>{
        return this.reportsService.getReportsStream()
    }


    // Bikin report
    @Post('create')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async crateReport(
        @UploadedFile() file: Express.Multer.File,
        @Body() createReportDto: CreateReportDto,
        @CurrentUser() currentUser: User
    ){
        console.log(`request masuk dari: ${JSON.stringify(currentUser)}`)
        return await this.reportsService.createReport(createReportDto, file, currentUser)
    }

    //update versi baru 
    @Patch()
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async updateReportV2(
        @UploadedFile() file: Express.Multer.File,
        @Body() updateReportV2: UpdateReportDto,
        @CurrentUser() currentUser: User
    ){
        return await this.reportsService.updateReport(file, updateReportV2, currentUser)
    }

    // Find report
    @Get()
    @UseGuards(AuthGuard)
    async findReport(
        @Query() dto: FindReportDto, 
        @CurrentUser() currentUser: User){
        return await this.reportsService.findMany(dto, currentUser)
    }

    // Get statistic
    @Get('statistics')
    @UseGuards(AuthGuard)
    async findStatistic(
        @CurrentUser() currentUser: User
    ){
        return await this.reportsService.findStatistic(currentUser)
    }

    // Delete report
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteReport(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: User
    ){
        return await this.reportsService.deleteReport(id, currentUser)
    }


}
