import {Body,Controller,ForbiddenException,Get,Headers,NotFoundException,Param,Post,Request,UseGuards} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

const FLW_URL='https://api.flutterwave.com/v3/payments';

@Controller('payments')
export class PaymentsController {
 constructor(private readonly db:PrismaService){}

 @UseGuards(JwtAuthGuard)
 @Post()
 async create(@Body() body:any,@Request() req:any){
  const order=await this.db.order.findUnique({where:{id:String(body.orderId)},include:{buyer:true,seller:true,ad:{select:{title:true}}}});
  if(!order)throw new NotFoundException('Order not found.');
  if(order.buyerId!==req.user.sub)throw new ForbiddenException('Only the buyer can initiate payment.');
  if(['CANCELLED','COMPLETED'].includes(order.status))throw new ForbiddenException('This order cannot be paid.');
  if(order.paymentStatus==='PAID')return {orderId:order.id,amount:Number(order.total),paymentMethod:order.paymentMethod,status:'PAID',message:'Payment is already confirmed.'};
  const requested=String(body.provider||order.paymentMethod).toUpperCase();
  if(requested!==order.paymentMethod)throw new ForbiddenException('Payment method must match the order.');
  if(requested==='CASH')return {orderId:order.id,amount:Number(order.total),paymentMethod:'CASH',status:order.paymentStatus,message:'Cash payment is confirmed by the seller at handover.'};
  if(requested!=='MOBILE_MONEY')throw new ForbiddenException('Unsupported payment method.');
  if(order.seller.flutterwaveSubaccountStatus!=='ACTIVE'||!order.seller.flutterwaveSubaccountId)throw new ForbiddenException('This seller has not completed secure payout setup yet. Please use cash or contact the seller.');
  const key=process.env.FLW_SECRET_KEY;
  if(!key)throw new ForbiddenException('Online payment is temporarily unavailable. The payment gateway has not been configured.');
  if(!order.buyer.email||!order.buyer.phone)throw new ForbiddenException('A valid buyer email and phone number are required for online payment.');
  const reference=`MM-ORDER-${randomUUID()}`;
  const amount=Number(order.total);
  const redirectUrl=process.env.FLW_REDIRECT_URL||'http://localhost:3000/payments/callback';
  const paymentOptions=process.env.FLW_PAYMENT_OPTIONS||'card,mobilemoneyuganda';
  const commissionPercent=Math.max(0,Math.min(100,Number(process.env.MARKETPLACE_COMMISSION_PERCENT||0)));
  const split:any={id:order.seller.flutterwaveSubaccountId};
  if(commissionPercent>0){split.transaction_charge_type='percentage';split.transaction_charge=commissionPercent/100;}
  const payload={tx_ref:reference,amount,currency:'UGX',redirect_url:redirectUrl,payment_options:paymentOptions,customer:{email:order.buyer.email,phonenumber:order.buyer.phone,name:order.buyer.name},customizations:{title:'MINIFY MARKET',description:`Payment for ${order.ad.title}`},meta:{orderId:order.id,reference},subaccounts:[split]};
  const response=await fetch(FLW_URL,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data:any=await response.json().catch(()=>({}));
  if(!response.ok||data?.status!=='success'||!data?.data?.link)throw new ForbiddenException(data?.message||'Could not start the Flutterwave payment.');
  await this.db.order.update({where:{id:order.id},data:{paymentReference:reference,paymentProvider:'FLUTTERWAVE',paymentStatus:'PENDING'}});
  return {ok:true,orderId:order.id,amount,currency:'UGX',status:'PENDING',paymentMethod:'MOBILE_MONEY',reference,authorizationUrl:data.data.link,message:'Continue to secure Flutterwave checkout to complete your payment.'};
 }

 @Post('webhook')
 async webhook(@Body() body:any,@Headers('verif-hash') verifHash?:string){
  const expected=process.env.FLW_SECRET_HASH;
  if(process.env.NODE_ENV==='production'&&!expected)throw new ForbiddenException('Webhook security is not configured.');
  if(expected&&verifHash!==expected)throw new ForbiddenException('Invalid webhook signature.');
  const data=body?.data||{};const reference=String(data.tx_ref||data.reference||'');
  if(!reference||!data.id||!/^\d+$/.test(String(data.id)))return {ok:true};
  const order=await this.db.order.findFirst({where:{paymentReference:reference}});
  if(!order||order.paymentStatus==='PAID')return {ok:true};
  const key=process.env.FLW_SECRET_KEY;if(!key)return {ok:true};
  const verify=await fetch(`https://api.flutterwave.com/v3/transactions/${data.id}/verify`,{headers:{Authorization:`Bearer ${key}`}});
  const result:any=await verify.json().catch(()=>({}));const tx=result?.data;
  const valid=verify.ok&&result?.status==='success'&&tx?.status==='successful'&&Number(tx.amount)===Number(order.total)&&tx.currency==='UGX'&&String(tx.tx_ref)===reference;
  if(!valid)return {ok:true};
  await this.db.order.update({where:{id:order.id},data:{paymentStatus:'PAID',paymentProvider:'FLUTTERWAVE'}});
  await this.db.notification.createMany({data:[
   {userId:order.buyerId,type:'PAYMENT',title:'Payment confirmed',body:`Your payment of UGX ${Number(order.total).toLocaleString()} was confirmed.`,link:'/orders'},
   {userId:order.sellerId,type:'PAYMENT',title:'Buyer payment confirmed',body:`Payment for your order was confirmed.`,link:'/orders'}
  ]});
  return {ok:true};
 }

 @UseGuards(JwtAuthGuard)
 @Get('reference/:reference')
 async byReference(@Param('reference') reference:string,@Request() req:any){
  const order=await this.db.order.findFirst({where:{paymentReference:reference},select:{id:true,buyerId:true,sellerId:true,paymentStatus:true,paymentMethod:true,total:true,paymentProvider:true,paymentReference:true}});
  if(!order)throw new NotFoundException('Payment reference not found.');
  if(order.buyerId!==req.user.sub&&order.sellerId!==req.user.sub)throw new ForbiddenException('Payment access denied.');
  return order;
 }

 @UseGuards(JwtAuthGuard)
 @Get(':orderId')
 async one(@Param('orderId') orderId:string,@Request() req:any){
  const order=await this.db.order.findUnique({where:{id:orderId},select:{id:true,buyerId:true,sellerId:true,paymentStatus:true,paymentMethod:true,total:true,paymentProvider:true,paymentReference:true}});
  if(!order)throw new NotFoundException('Order not found.');
  if(order.buyerId!==req.user.sub&&order.sellerId!==req.user.sub)throw new ForbiddenException('Payment access denied.');
  return order;
 }
}
