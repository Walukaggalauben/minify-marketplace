import {Body,Controller,Delete,Get,Param,Post,Request,UseGuards,BadRequestException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('saved-searches')
export class SavedSearchesController {
 constructor(private readonly db:PrismaService){}
 @Get()
 async list(@Request() req:any){return this.db.savedSearch.findMany({where:{userId:req.user.sub},orderBy:{createdAt:'desc'}});}
 @Post()
 async create(@Request() req:any,@Body() d:any){
  const name=String(d.name||'').trim().slice(0,80)||'Saved search';
  const min=d.minPrice!==undefined&&d.minPrice!==''?Number(d.minPrice):null;
  const max=d.maxPrice!==undefined&&d.maxPrice!==''?Number(d.maxPrice):null;
  if(min!==null&&(!Number.isFinite(min)||min<0))throw new BadRequestException('Invalid minimum price.');
  if(max!==null&&(!Number.isFinite(max)||max<0))throw new BadRequestException('Invalid maximum price.');
  if(min!==null&&max!==null&&min>max)throw new BadRequestException('Minimum price cannot exceed maximum price.');
  return this.db.savedSearch.create({data:{userId:req.user.sub,name,query:d.query?String(d.query).trim().slice(0,160):null,categoryId:d.categoryId?String(d.categoryId):null,minPrice:min,maxPrice:max,city:d.city?String(d.city).trim().slice(0,80):null}});
 }
 @Delete(':id')
 async remove(@Request() req:any,@Param('id') id:string){const r=await this.db.savedSearch.deleteMany({where:{id,userId:req.user.sub}});return {ok:r.count>0};}
}