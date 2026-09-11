import {Body,Controller,Get,Param,Post,Request,UnauthorizedException,UseGuards} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
 constructor(private readonly db:PrismaService) {}
 @Get('unread-count')
 async unread(@Request() req:any){return {count:await this.db.message.count({where:{readAt:null,senderId:{not:req.user.sub},conversation:{OR:[{buyerId:req.user.sub},{sellerId:req.user.sub}]}}})};}
 @Post('conversation')
 async conv(@Body() d:any,@Request() req:any){
  const buyerId=req.user.sub;if(buyerId===d.sellerId)throw new UnauthorizedException('You cannot start a chat with yourself.');
  return this.db.conversation.upsert({where:{adId_buyerId:{adId:d.adId,buyerId}},update:{},create:{adId:d.adId,buyerId,sellerId:d.sellerId}});
 }
 @Get(':userId')
 async list(@Request() req:any){const userId=req.user.sub;return this.db.conversation.findMany({where:{OR:[{buyerId:userId},{sellerId:userId}]},include:{ad:{include:{images:true}},buyer:{select:{id:true,name:true}},seller:{select:{id:true,name:true}},messages:{orderBy:{createdAt:'desc'},take:1}},orderBy:{updatedAt:'desc'}});}
 @Get('conversation/:id')
 async messages(@Param('id') id:string,@Request() req:any){const c=await this.db.conversation.findUnique({where:{id}});if(!c||!([c.buyerId,c.sellerId] as string[]).includes(req.user.sub))throw new UnauthorizedException('Conversation access denied.');return this.db.message.findMany({where:{conversationId:id},include:{User:{select:{id:true,name:true}}},orderBy:{createdAt:'asc'}});}
 @Post('conversation/:id/read')
 async read(@Param('id') id:string,@Request() req:any){const c=await this.db.conversation.findUnique({where:{id}});if(!c||!([c.buyerId,c.sellerId] as string[]).includes(req.user.sub))throw new UnauthorizedException('Conversation access denied.');await this.db.message.updateMany({where:{conversationId:id,senderId:{not:req.user.sub},readAt:null},data:{readAt:new Date()}});return {ok:true};}
 @Post('message')
 async message(@Body() d:any,@Request() req:any){const c=await this.db.conversation.findUnique({where:{id:d.conversationId}});if(!c||!([c.buyerId,c.sellerId] as string[]).includes(req.user.sub))throw new UnauthorizedException('Conversation access denied.');const body=String(d.body||'').trim();if(!body)throw new UnauthorizedException('Message cannot be empty.');const msg=await this.db.message.create({data:{conversationId:c.id,senderId:req.user.sub,body}});const recipientId=c.buyerId===req.user.sub?c.sellerId:c.buyerId;await this.db.notification.create({data:{userId:recipientId,type:'MESSAGE',title:'New message',body:body.length>90?body.slice(0,87)+'...':body,link:'/messages?conversation='+c.id}});return msg;}
}
