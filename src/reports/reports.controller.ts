import { Body, Controller, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors, UsePipes, Get, Query, Delete, ParseIntPipe } from '@nestjs/common';
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
import { User } from 'src/users/type/user.type';

@Controller('reports')
export class ReportsController {

    constructor(
        private reportsService: ReportsService,
        private authService: AuthService
    ){}


    // Bikin report
    @Post()
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

    // Update report
    @Patch()
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async updateReport(
        @UploadedFile() file: Express.Multer.File,
        @Body('data', ParseJsonPipe) updateReport: any,
        @CurrentUser() currentUser: User
    ){
        return await this.reportsService.updateReport(updateReport, currentUser, file)
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
    @Get('statistic')
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
