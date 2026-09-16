import {Body,Controller,Get,Param,Patch,Post,Request,UseGuards,ForbiddenException,NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
 constructor(private readonly db:PrismaService){}
 @Post()
 async create(@Body() body:any,@Request() req:any){
  const ad=await this.db.ad.findUnique({where:{id:String(body.adId)},select:{id:true,sellerId:true,price:true,status:true}});
  if(!ad)throw new NotFoundException('Advert not found.');
  if(ad.status!=='ACTIVE')throw new ForbiddenException('This advert is not available.');
  if(ad.sellerId===req.user.sub)throw new ForbiddenException('You cannot order your own advert.');
  const rawQuantity=Number(body.quantity);
  if(!Number.isInteger(rawQuantity)||rawQuantity<1||rawQuantity>99)throw new ForbiddenException('Quantity must be a whole number between 1 and 99.');
  const quantity=rawQuantity;
  if(!Number.isInteger(quantity))throw new ForbiddenException('Quantity must be a whole number.');
  const method=['MEETUP','DELIVERY'].includes(String(body.deliveryMethod))?String(body.deliveryMethod):'MEETUP';
  const payment=['CASH','MOBILE_MONEY'].includes(String(body.paymentMethod))?String(body.paymentMethod):'CASH';
  if(method==='DELIVERY'&&!String(body.deliveryAddress??'').trim())throw new ForbiddenException('Delivery address is required for delivery orders.');
  const order=await this.db.order.create({data:{adId:ad.id,buyerId:req.user.sub,sellerId:ad.sellerId,quantity,total:Number(ad.price)*quantity,deliveryMethod:method,paymentMethod:payment,deliveryAddress:method=== 'DELIVERY' && String(body.deliveryAddress??'').trim()?String(body.deliveryAddress).trim():null,buyerNote:String(body.buyerNote??'').trim()?String(body.buyerNote).trim():null},include:{ad:{include:{images:true}},seller:{select:{id:true,name:true,phone:true}}}});
  await this.db.notification.create({data:{userId:ad.sellerId,type:'ORDER_CREATED',title:'New purchase request',body:`A buyer requested ${quantity} Ã— ${order.ad.title}.`,link:'/orders'}});
  return order;
 }
 @Get('mine')
 async mine(@Request() req:any){return this.db.order.findMany({where:{OR:[{buyerId:req.user.sub},{sellerId:req.user.sub}]},include:{ad:{include:{images:true}},buyer:{select:{id:true,name:true,phone:true}},seller:{select:{id:true,name:true,phone:true}}},orderBy:{createdAt:'desc'}})}
 @Get(':id')
 async one(@Param('id') id:string,@Request() req:any){const o=await this.db.order.findUnique({where:{id},include:{ad:{include:{images:true}},buyer:{select:{id:true,name:true,phone:true}},seller:{select:{id:true,name:true,phone:true}}}});if(!o)throw new NotFoundException('Order not found.');if(o.buyerId!==req.user.sub&&o.sellerId!==req.user.sub)throw new ForbiddenException('Order access denied.');return o;}
 @Patch(':id/status')
 async status(@Param('id') id:string,@Body() body:any,@Request() req:any){
  const o=await this.db.order.findUnique({where:{id}});if(!o)throw new NotFoundException('Order not found.');
  if(o.buyerId!==req.user.sub&&o.sellerId!==req.user.sub)throw new ForbiddenException('Order access denied.');
  const next=String(body.status);const allowed=['REQUESTED','ACCEPTED','READY','OUT_FOR_DELIVERY','COMPLETED','CANCELLED'];
  if(!allowed.includes(next))throw new ForbiddenException('Invalid order status.');
  if(['ACCEPTED','READY','OUT_FOR_DELIVERY'].includes(next)&&o.sellerId!==req.user.sub)throw new ForbiddenException('Seller action required.');
  if(next==='COMPLETED'&&o.buyerId!==req.user.sub)throw new ForbiddenException('Buyer confirmation required.');
  const transitions:any={REQUESTED:['ACCEPTED','CANCELLED'],ACCEPTED:['READY','CANCELLED'],READY:['OUT_FOR_DELIVERY','COMPLETED','CANCELLED'],OUT_FOR_DELIVERY:['COMPLETED','CANCELLED']};
  if(!transitions[o.status]?.includes(next))throw new ForbiddenException(`Cannot change order from ${o.status.replaceAll('_',' ').toLowerCase()} to ${next.replaceAll('_',' ').toLowerCase()}.`);
  if(next==='CANCELLED'&&o.status==='COMPLETED')throw new ForbiddenException('Completed orders cannot be cancelled.');
  if(next==='CANCELLED'&&o.status==='REQUESTED'&&o.buyerId!==req.user.sub&&o.sellerId!==req.user.sub)throw new ForbiddenException('Order access denied.');
  if(next==='OUT_FOR_DELIVERY'&&o.deliveryMethod!=='DELIVERY')throw new ForbiddenException('Delivery status is only valid for delivery orders.');
  if(next==='COMPLETED'&&o.deliveryMethod==='DELIVERY'&&o.status!=='OUT_FOR_DELIVERY')throw new ForbiddenException('Delivery orders must be out for delivery before completion.');
  if(next==='COMPLETED'&&o.paymentStatus!=='PAID')throw new ForbiddenException('Payment must be confirmed before completing this order.');
  if(next==='COMPLETED'&&o.deliveryMethod==='MEETUP'&&o.status!=='READY')throw new ForbiddenException('Meetup orders can only be completed after the seller marks them ready.');
  const updated=await this.db.order.update({where:{id},data:{status:next},include:{ad:true,buyer:{select:{id:true,name:true,phone:true}},seller:{select:{id:true,name:true,phone:true}}}});
  const recipient=o.sellerId===req.user.sub?o.buyerId:o.sellerId;
  await this.db.notification.create({data:{userId:recipient,type:'ORDER_STATUS',title:'Order updated',body:`Order for ${updated.ad.title} is now ${next.replaceAll('_',' ').toLowerCase()}.`,link:'/orders'}});
  return updated;
 }
 @Post(':id/cash-confirmation')
 async cashConfirmation(@Param('id') id:string,@Request() req:any){
  const o=await this.db.order.findUnique({where:{id}});
  if(!o)throw new NotFoundException('Order not found.');
  if(o.sellerId!==req.user.sub)throw new ForbiddenException('Only the seller can confirm cash received.');
  if(o.paymentMethod!=='CASH')throw new ForbiddenException('This order is not a cash transaction.');
  if(!['READY','OUT_FOR_DELIVERY'].includes(o.status))throw new ForbiddenException('Cash can only be confirmed at handover or after dispatch.');
  if(['CANCELLED','COMPLETED'].includes(o.status))throw new ForbiddenException('This order cannot change payment.');
  if(o.paymentStatus==='PAID')return o;
  const updated=await this.db.order.update({where:{id},data:{paymentStatus:'PAID'},include:{ad:true,buyer:{select:{id:true,name:true,phone:true}},seller:{select:{id:true,name:true,phone:true}}}});
  await this.db.notification.create({data:{userId:o.buyerId,type:'PAYMENT_CONFIRMED',title:'Cash payment confirmed',body:`The seller confirmed receipt of cash for ${updated.ad.title}.`,link:'/orders'}});
  return updated;
 }
 @Patch(':id/payment')
 async payment(@Param('id') id:string,@Body() body:any,@Request() req:any){
  const o=await this.db.order.findUnique({where:{id}});if(!o)throw new NotFoundException('Order not found.');
  if(o.buyerId!==req.user.sub)throw new ForbiddenException('Only the buyer can update payment.');
  if(o.status==='CANCELLED'||o.status==='COMPLETED')throw new ForbiddenException('This order cannot change payment.');
  const status=String(body.status);if(status!=='PENDING')throw new ForbiddenException('Payment status is controlled by the payment service.');
  return this.db.order.update({where:{id},data:{paymentStatus:'PENDING'},select:{id:true,paymentStatus:true,paymentMethod:true,total:true,status:true}});
 }
}

