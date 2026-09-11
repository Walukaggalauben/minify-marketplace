import {Controller,Get} from '@nestjs/common'; import {PrismaService} from '../prisma.service';
@Controller('categories') export class CategoriesController{constructor(private db:PrismaService){} @Get() all(){return this.db.category.findMany({where:{parentId:null},include:{children:true},orderBy:{name:'asc'}})}}
