import {Controller,Get} from '@nestjs/common'; import {PrismaService} from '../prisma.service';
@Controller('categories') export class CategoriesController{
 constructor(private db:PrismaService){}
 @Get() async all(){
  const rows=await this.db.category.findMany({orderBy:{name:'asc'}});
  const roots=rows.filter(c=>!c.parentId);
  const byParent=new Map<string,any[]>(); for(const c of rows)if(c.parentId)byParent.set(c.parentId,[...(byParent.get(c.parentId)||[]),c]);
  const build=(parent:any):any=>({...parent,children:(byParent.get(parent.id)||[]).map(build)});
  return roots.map(build);
 }
}
