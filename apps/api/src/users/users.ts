import {Controller,Get,Param,NotFoundException,Patch,Post,Body,Request,UseGuards,ForbiddenException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

@Controller('users')
export class UsersController{
 constructor(private readonly db:PrismaService){}
 @Get(':id') async one(@Param('id') id:string){
  const user=await this.db.user.findUnique({where:{id},select:{id:true,name:true,avatarUrl:true,city:true,verified:true,verificationStatus:true,createdAt:true,role:true,phone:true}});
  if(!user)throw new NotFoundException('Seller not found.');return user;
 }
 @UseGuards(JwtAuthGuard)
 @Get('me/profile') async me(@Request() req:any){return this.db.user.findUnique({where:{id:req.user.sub},select:{id:true,name:true,email:true,phone:true,city:true,avatarUrl:true,verified:true,verificationStatus:true,verificationNote:true,role:true}});}
 @UseGuards(JwtAuthGuard)
 @Get('me/metrics') async metrics(@Request() req:any){
  const id=req.user.sub;const [ads,favorites,orders,messages]=await Promise.all([
   this.db.ad.findMany({where:{sellerId:id},select:{views:true,status:true}}),
   this.db.favorite.count({where:{Ad:{sellerId:id}}}),
   this.db.order.findMany({where:{sellerId:id},select:{status:true,total:true}}),
   this.db.message.count({where:{conversation:{sellerId:id}}})
  ]);
  return {adverts:ads.length,active:ads.filter(a=>a.status==='ACTIVE').length,views:ads.reduce((n,a)=>n+a.views,0),favorites,conversations:messages,orders:orders.length,completed:orders.filter(o=>o.status==='COMPLETED').length,revenue:orders.filter(o=>o.status==='COMPLETED').reduce((n,o)=>n+Number(o.total),0)};
 }
 @UseGuards(JwtAuthGuard)
 @Patch('me/profile') async update(@Request() req:any,@Body() body:any){
  const name=String(body.name||'').trim();const city=String(body.city||'').trim();if(!name)throw new ForbiddenException('Name is required.');
  return this.db.user.update({where:{id:req.user.sub},data:{name,city:city||null},select:{id:true,name:true,email:true,phone:true,city:true,avatarUrl:true,verified:true,verificationStatus:true,verificationNote:true,role:true}});
 }
 @UseGuards(JwtAuthGuard)
 @Post('me/verification') async requestVerification(@Request() req:any){
  const user=await this.db.user.findUnique({where:{id:req.user.sub},select:{id:true,name:true,role:true,verificationStatus:true}});
  if(!user)throw new NotFoundException('User not found.');
  if(!['SELLER','ADMIN'].includes(user.role))throw new ForbiddenException('Seller verification is available after you become a seller.');
  if(user.verificationStatus==='VERIFIED')return user;
  return this.db.user.update({where:{id:req.user.sub},data:{verificationStatus:'PENDING',verificationNote:'Verification requested by seller.'},select:{id:true,name:true,verificationStatus:true,verificationNote:true}});
}
}
