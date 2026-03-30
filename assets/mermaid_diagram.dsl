
classDiagram


class AppController{
            -appService: AppService
            +getHello() string
        }
class AppModule{
            
            
        }
class AppService{
            
            +getHello() string
        }
class AspirationsModule{
            
            
        }
class AspirationsService{
            
            
        }
class AuthController{
            -authService: AuthService
            +register() Promise~Record~string, string~~
+verifyEmail() Promise~#123; message: string; #125;~
+login() Promise~Record~string, string~~
+logout() #123; message: string; #125;
        }
class AuthModule{
            
            
        }
class AuthService{
            -usersService: UsersService
-transporter: Transporter
-jwtService: JwtService
            +register() Promise~#123; message: string; #125;~
+verifyEmail() Promise~#123; message: string; #125;~
+sendEmailVerificationLink() Promise~any~
+createTokenLink() Promise~string~
+validateUser() boolean
+login() Promise~Record~string, string~~
        }
class CategoriesController{
            -categoriesService: CategoriesService
            +createCategory() Promise~Record~string, any~~
+deleteCategory() Promise~#123; message: string; #125;~
+updateCategory() Promise~#123; messsage: string; category: UpdateResult; #125;~
+getAllCategories() Promise~Category[]~
        }
class CategoriesModule{
            
            
        }
class CategoriesService{
            -categoryRepository: Repository~Category~
-priorityService: PriorityService
            +createCategory() Promise~#123; message: string; category: Category; #125;~
+deleteCategory() Promise~#123; message: string; #125;~
+updateCategory() Promise~#123; messsage: string; category: UpdateResult; #125;~
+findCategoryById() Promise~Category~
+getAllCategories() Promise~Category[]~
        }
class LocationsController{
            
            
        }
class LocationsModule{
            
            
        }
class LocationsService{
            -locationRepository: Repository~Location~
            +createLocation() Promise~#123; message: string; location: { building: { id: number; #125;; detail: string; room: string; floor: number; } & Location; }~
        }
class PriorityController{
            -priorityService: PriorityService
            +createPriority() Promise~#123; message: string; priority: Priority; #125;~
        }
class PriorityModule{
            
            
        }
class PriorityService{
            -priorityRepository: Repository~Priority~
            +createPriority() Promise~#123; message: string; priority: Priority; #125;~
+findPriorityById() Promise~Priority~
        }
class R2Module{
            
            
        }
class ReportsController{
            -reportsService: ReportsService
-authService: AuthService
            +crateReport() Promise~#123; message: string; report: Report; #125;~
+updateReport() Promise~#123; message: string; report: Report; #125;~
+findReport() Promise~Report[]~
+findStatistic() Promise~#123; total: number; count: { pending: number; progress: number; done: number; rejected: number; #125;; }~
+deleteReport() Promise~#123; message: string; report: Report; #125;~
        }
class ReportsModule{
            
            
        }
class ReportsService{
            -reportRepository: Repository~Report~
-locationService: LocationsService
-categoriesService: CategoriesService
-buildingService: BuildingsService
-usersService: UsersService
-r2: S3Client
-priorityService: PriorityService
            +createReport() Promise~#123; message: string; report: Report; #125;~
+updateReport() Promise~#123; message: string; report: Report; #125;~
+findReport() Promise~Report~
+findMany() Promise~Report[]~
+findStatistic() Promise~#123; total: number; count: { pending: number; progress: number; done: number; rejected: number; #125;; }~
+deleteReport() Promise~#123; message: string; report: Report; #125;~
        }
class UsersModule{
            
            
        }
class UsersService{
            -userRepository: Repository~User~
            +createUnverifiedUser() Promise~User~
+isEmailExist() Promise~boolean~
+isEmailExistAndVerified() Promise~Boolean~
+findUserByEmail() Promise~User~
+completeUserVerification() Promise~UpdateResult~
+findOneTechnicianById() Promise~User~
        }
class Aspiration{
            +id: number
+user: User
+title: string
+category: Category
+img_url: string
+created_at: Date
            
        }
class LoginDto{
            +email: string
+password: string
            
        }
class RegisterDto{
            +username: string
+email: string
+password: string
+passwordConfirm: string
            
        }
class RegisterResponseDto{
            +message: string
            
        }
class AuthGuard{
            -authService: AuthService
            +canActivate() boolean | Promise~boolean~
        }
CanActivate<|..AuthGuard
class RolesGuard{
            -reflector: Reflector
            +canActivate() boolean
        }
CanActivate<|..RolesGuard
class CreateCategoryDto{
            +name: string
+priority: number
            
        }
class UpdateDto{
            +id: number
+name: string
+priorityId: number
            
        }
class Category{
            +id: number
+name: string
+isSystem: boolean
+priority: Priority
+report: Report[]
+aspiration: Aspiration
+createdAt: Date
            
        }
class BuildingsController{
            -buildingService: BuildingsService
            +createBuilding() Promise~#123; message: string; building: Building; #125;~
+getAllBuildings() Promise~Building[]~
        }
class BuildingsService{
            -buildingRepository: Repository~Building~
-facultiesService: FacultiesService
            +createBuilding() Promise~#123; message: string; building: Building; #125;~
+findMany() Promise~Building[]~
+findOneById() Promise~Building~
        }
class BuildingsFilterDto{
            +name: string
+floors: number
+isGeneral: string
+faculty: number
            
        }
class CreateBuildingDto{
            +name: string
+floors: number
+facultyId: number
            
        }
class createFacultyDto{
            +name: string
+code: string
            
        }
class CreateLocationDto{
            +buildingId: number
+floor: number
+detail: string
+room: string
            
        }
class Building{
            +id: number
+name: string
+floors: number
+faculty: Faculty
+location: Location[]
+isSystem: boolean
+isGeneral: boolean
+created_at: Date
            
        }
class Faculty{
            +id: number
+name: string
+code: string
+building: Building[]
+isSystem: boolean
+createdAt: Date
            
        }
class Location{
            +id: number
+building: Building
+floor: number
+room: string
+detail: string
+report: Report
+isSystem: boolean
+createdAt: Date
            
        }
class FacultiesController{
            -facultiesService: FacultiesService
            +createFaculty() Promise~#123; message: string; #125;~
+getAllFaculties() Promise~Faculty[]~
        }
class FacultiesService{
            -facultyRepository: Repository~Faculty~
            +createFaculty() Promise~#123; message: string; #125;~
+findFacultyById() Promise~Faculty~
+getAllFaculties() Promise~Faculty[]~
        }
class CreatePriorityDto{
            +name: string
+slaHours: number
+weight: number
            
        }
class Priority{
            +id: number
+name: string
+slaHours: number
+weight: number
+category: Category[]
+report: Report[]
            
        }
class CreateReportDto{
            +categoryId: number
+buildingId: number
+room: string
+floor: string
+detail: string
+description: string
            
        }
class FindReportDto{
            +id: string
+building: string
+category: string
+faculty: string
+from: string
+page: number
+limit: number
+status: ReportStatusWithAll
            
        }
class Location{
            +buildingId: number
+room: string
+detail: string
+floor: string
            
        }
class UpdateReportDto{
            +reportId: number
+categoryId: number
+location: Location
+status: string
+description: string
+adminNote: string
+technicianNote: string
+priority: number
+assignedTechnicianId: number
            
        }
class Report{
            +id: number
+user: User
+assignedTechnician: User
+category: Category
+slaDate: Date
+location: Location
+description: string
+adminNote: string
+status: ReportStatus
+slaStatus: SlaStatus
+priority: Priority
+technicianNote: string
+imgUrl: string
+createdAt: Date
            
        }
class ParseJsonPipe{
            
            +transform() any
        }
PipeTransform~T,R~<|..ParseJsonPipe
class MatchConstraint{
            
            +validate() boolean
        }
ValidatorConstraintInterface<|..MatchConstraint
class CreateUnverifiedUserDto{
            +email: string
+userType: any
            
        }
class User{
            +id: number
+username: string
+email: string
+email_is_verified: boolean
+hashed_password: string
+user_type: UserType
+report: Report[]
+assigned_report: Report[]
+role: UserRoles
+skills: Category[]
+created_at: Date
            
        }
class UserRoles {
        <<enumeration>>
        USER
ADMIN
TECHNICIAN
      }
class UserType {
        <<enumeration>>
        MAHASISWA
STAFF
      }
class User{
            +id: number
+email: string
+role: UserRoles
            
        }
class ReportStatus {
        <<enumeration>>
        PENDING
PROGRESS
DONE
REJECTED
REJECTED_BY_TECHNICIAN
WITHDRAWN
      }
class SlaStatus {
        <<enumeration>>
        ON_TIME
POSSIBLY_LATE
LATE
      }