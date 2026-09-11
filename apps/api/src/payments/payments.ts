import {Body,Controller,Get,Param,Post,Request,UseGuards,ForbiddenException,NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
 constructor(private readonly db:PrismaService){}
 @Post()
 async create(@Body() body:any,@Request() req:any){
  const order=await this.db.order.findUnique({where:{id:String(body.orderId)}});
  if(!order)throw new NotFoundException('Order not found.');
  if(order.buyerId!==req.user.sub)throw new ForbiddenException('Only the buyer can initiate payment.');
  if(order.status==='CANCELLED'||order.status==='COMPLETED')throw new ForbiddenException('This order cannot be paid.');
  const method=['MOBILE_MONEY','CASH'].includes(String(body.provider||''))?String(body.provider):order.paymentMethod;
  if(method==='CASH')return this.db.order.update({where:{id:order.id},data:{paymentMethod:'CASH'},select:{id:true,paymentStatus:true,paymentMethod:true,status:true,total:true}});
  return {orderId:order.id,amount:order.total,paymentMethod:'MOBILE_MONEY',status:'PENDING',message:'Mobile Money payment is prepared but no live gateway is connected yet.'};
 }
 @Get(':orderId')
 async one(@Param('orderId') orderId:string,@Request() req:any){
  const order=await this.db.order.findUnique({where:{id:orderId},select:{id:true,buyerId:true,sellerId:true,paymentStatus:true,paymentMethod:true,total:true}});
  if(!order)throw new NotFoundException('Order not found.');
  if(order.buyerId!==req.user.sub&&order.sellerId!==req.user.sub)throw new ForbiddenException('Payment access denied.');
  return order;
 }
}
