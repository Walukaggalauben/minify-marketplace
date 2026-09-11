import {Controller,Get,Patch,Param,Request,UseGuards} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
 constructor(private readonly db:PrismaService){}
 @Get()
 async mine(@Request() req:any){
  return this.db.notification.findMany({where:{userId:req.user.sub},orderBy:{createdAt:'desc'},take:50});
 }
 @Get('unread-count')
 async unread(@Request() req:any){
  return {count:await this.db.notification.count({where:{userId:req.user.sub,readAt:null}})};
 }
 @Patch(':id/read')
 async read(@Param('id') id:string,@Request() req:any){
  return this.db.notification.updateMany({where:{id,userId:req.user.sub,readAt:null},data:{readAt:new Date()}});
 }
 @Patch('read-all')
 async readAll(@Request() req:any){
  return this.db.notification.updateMany({where:{userId:req.user.sub,readAt:null},data:{readAt:new Date()}});
 }
}
