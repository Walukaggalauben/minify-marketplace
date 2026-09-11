import {Body,Controller,Get,Param,Patch,Request,ForbiddenException,UseGuards} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {AdStatus} from '@prisma/client';
import {JwtAuthGuard} from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController{
 constructor(private readonly db:PrismaService){}
 private guard(r:any){if(!['ADMIN','MODERATOR'].includes(r.user?.role))throw new ForbiddenException('Admin access required.');}
 @Get('pending-ads') async pending(@Request() req:any){this.guard(req);return this.db.ad.findMany({where:{status:'PENDING_REVIEW'},include:{images:true,seller:{select:{id:true,name:true,email:true,phone:true,verified:true}},category:true},orderBy:{createdAt:'asc'}})}
 @Get('reports') async reports(@Request() req:any){this.guard(req);return this.db.report.findMany({where:{resolved:false},include:{Ad:{select:{id:true,title:true,seller:{select:{id:true,name:true}}}},User:{select:{id:true,name:true,email:true}}},orderBy:{createdAt:'asc'}})}
 @Patch('reports/:id/resolve') async resolve(@Param('id') id:string,@Request() req:any){this.guard(req);return this.db.report.update({where:{id},data:{resolved:true}})}
 @Get('promotions') async promotions(@Request() req:any){this.guard(req);return this.db.promotion.findMany({include:{Ad:{select:{id:true,title:true}},user:{select:{id:true,name:true,email:true}}},orderBy:{createdAt:'desc'},take:200})}
 @Get('verification-requests') async verificationRequests(@Request() req:any){this.guard(req);return this.db.user.findMany({where:{verificationStatus:'PENDING'},select:{id:true,name:true,email:true,phone:true,city:true,verified:true,verificationStatus:true,verificationNote:true},orderBy:{updatedAt:'asc'}})}
 @Patch('users/:id/verification') async verification(@Param('id') id:string,@Body() body:any,@Request() req:any){this.guard(req);const status=String(body.status);if(!['VERIFIED','REJECTED','UNVERIFIED'].includes(status))throw new ForbiddenException('Invalid verification status.');const user=await this.db.user.findUnique({where:{id},select:{id:true,name:true}});if(!user)throw new ForbiddenException('User not found.');const updated=await this.db.user.update({where:{id},data:{verificationStatus:status,verified:status==='VERIFIED',verificationNote:body.note?String(body.note):null},select:{id:true,name:true,verified:true,verificationStatus:true,verificationNote:true}});await this.db.notification.create({data:{userId:id,type:'VERIFICATION',title:status==='VERIFIED'?'Seller verified':'Verification update',body:status==='VERIFIED'?'Your seller profile is now verified.':`Your seller verification status is ${status.toLowerCase()}.`,link:'/verification'}});return updated}
 @Patch('ads/:id/status') async status(@Param('id') id:string,@Body() body:any,@Request() req:any){
  this.guard(req);const next=String(body.status);const note=body.note?String(body.note).trim().slice(0,1000):null;const allowed=['DRAFT','PENDING_REVIEW','ACTIVE','SOLD','REJECTED','EXPIRED'];
  if(!allowed.includes(next))throw new ForbiddenException('Invalid advert status.');
  const ad=await this.db.ad.findUnique({where:{id}});if(!ad)throw new ForbiddenException('Advert not found.');
  const updated=await this.db.ad.update({where:{id},data:{status:next as AdStatus,moderationNote:next==='REJECTED'?note:null,publishedAt:next==='ACTIVE'?new Date():null,expiresAt:next==='ACTIVE'?new Date(Date.now()+30*86400000):next==='EXPIRED'?new Date():undefined}});
  if(['ACTIVE','REJECTED'].includes(next))await this.db.notification.create({data:{userId:ad.sellerId,type:'AD_MODERATION',title:next==='ACTIVE'?'Advert approved':'Advert rejected',body:next==='ACTIVE'?`Your advert "${ad.title}" is now live.`:`Your advert "${ad.title}" was rejected. ${note||'Please review the advert and make the requested changes.'}`,link:`/sell/${id}`}});
  if(next==='ACTIVE'){
   const searches=await this.db.savedSearch.findMany();
   const text=`${ad.title} ${ad.description}`.toLowerCase();
   const matches=searches.filter((s:any)=>s.userId!==ad.sellerId&&(!s.query||text.includes(String(s.query).toLowerCase()))&&(!s.categoryId||s.categoryId===ad.categoryId)&&(!s.minPrice||Number(ad.price)>=Number(s.minPrice))&&(!s.maxPrice||Number(ad.price)<=Number(s.maxPrice))&&(!s.city||ad.city.toLowerCase().includes(String(s.city).toLowerCase())));
   if(matches.length)await this.db.notification.createMany({data:matches.map((s:any)=>({userId:s.userId,type:'SAVED_SEARCH',title:'New advert matches your search',body:`${ad.title} is now available for ${Number(ad.price).toLocaleString()} UGX.`,link:`/ad/${id}`}))});
  }
  return updated;
 }
 @Get('orders') async orders(@Request() req:any){this.guard(req);return this.db.order.findMany({include:{ad:{select:{id:true,title:true,price:true}},buyer:{select:{id:true,name:true,email:true,phone:true}},seller:{select:{id:true,name:true,email:true,phone:true}}},orderBy:{createdAt:'desc'},take:200})}
 @Patch('orders/:id/status') async orderStatus(@Param('id') id:string,@Body() body:any,@Request() req:any){
  this.guard(req);const next=String(body.status);const allowed=['REQUESTED','ACCEPTED','READY','OUT_FOR_DELIVERY','COMPLETED','CANCELLED'];
  if(!allowed.includes(next))throw new ForbiddenException('Invalid order status.');
  const o=await this.db.order.findUnique({where:{id}});if(!o)throw new ForbiddenException('Order not found.');
  const transitions:any={REQUESTED:['ACCEPTED','CANCELLED'],ACCEPTED:['READY','CANCELLED'],READY:['OUT_FOR_DELIVERY','COMPLETED','CANCELLED'],OUT_FOR_DELIVERY:['COMPLETED','CANCELLED']};
  if(!transitions[o.status]?.includes(next))throw new ForbiddenException(`Cannot change order from ${o.status.replaceAll('_',' ').toLowerCase()} to ${next.replaceAll('_',' ').toLowerCase()}.`);
  if(next==='OUT_FOR_DELIVERY'&&o.deliveryMethod!=='DELIVERY')throw new ForbiddenException('Delivery status is only valid for delivery orders.');
  if(next==='COMPLETED'&&o.deliveryMethod==='DELIVERY'&&o.status!=='OUT_FOR_DELIVERY')throw new ForbiddenException('Delivery orders must be out for delivery before completion.');
  if(next==='COMPLETED'&&o.paymentStatus!=='PAID')throw new ForbiddenException('Payment must be confirmed before completing this order.');
  const updated=await this.db.order.update({where:{id},data:{status:next}});
  await this.db.notification.create({data:{userId:o.buyerId,type:'ORDER_STATUS',title:'Order updated',body:`Order is now ${next.replaceAll('_',' ').toLowerCase()}.`,link:'/orders'}});
  return updated;
 }
}
