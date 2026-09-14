import {Body,Controller,ForbiddenException,Get,Headers,Post,Request,UseGuards} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

const PRICES:any={BOOST:5000,FEATURED:15000};
const DAYS:any={BOOST:3,FEATURED:7};

@Controller('promotion-payments')
export class PromotionPaymentsController{
 constructor(private readonly db:PrismaService){}
 @UseGuards(JwtAuthGuard)
 @Post('initiate')
 async initiate(@Body() body:any,@Request() req:any){
  const ad=await this.db.ad.findUnique({where:{id:String(body.adId)},select:{id:true,sellerId:true,status:true}});
  if(!ad)throw new ForbiddenException('Advert not found.');
  if(ad.sellerId!==req.user.sub&&req.user.role!=='ADMIN')throw new ForbiddenException('You cannot promote this advert.');
  if(ad.status!=='ACTIVE')throw new ForbiddenException('Only active adverts can be promoted.');
  const type=String(body.type||'').toUpperCase();
  if(!PRICES[type])throw new ForbiddenException('Invalid promotion type.');
  const days=Math.max(1,Math.min(30,Number(body.days)||DAYS[type]));
  const blocks=Math.ceil(days/DAYS[type]);
  const amount=PRICES[type]*blocks;
  const network=String(body.network||'').toUpperCase();
  if(!['MTN','AIRTEL'].includes(network))throw new ForbiddenException('Select MTN or Airtel.');
  const user=await this.db.user.findUnique({where:{id:req.user.sub},select:{name:true,email:true,phone:true}});
  if(!user?.email||!user.phone)throw new ForbiddenException('A valid seller email and phone number are required.');
  const txRef=`MM-PROMO-${randomUUID()}`;
  const endsAt=new Date(Date.now()+days*86400000);
  const promotion=await this.db.promotion.create({data:{adId:ad.id,sellerId:ad.sellerId,type,amount,endsAt,status:'PENDING_PAYMENT'}});
  const payment=await this.db.promotionPayment.create({data:{promotionId:promotion.id,userId:req.user.sub,amount,currency:'UGX',provider:'FLUTTERWAVE',reference:txRef,status:'PENDING'}});
  const key=process.env.FLW_SECRET_KEY;
  if(!key)return {ok:false,paymentId:payment.id,amount,currency:'UGX',message:'Payment gateway is not configured yet. Add FLW_SECRET_KEY before taking live payments.'};
  const response=await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_uganda',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({phone_number:user.phone,network,amount,currency:'UGX',email:user.email,tx_ref:txRef,fullname:user.name,meta:{promotionId:promotion.id,paymentId:payment.id}})});
  const data:any=await response.json();
  if(!response.ok||data?.status!=='success')return {ok:false,paymentId:payment.id,amount,currency:'UGX',message:data?.message||'Could not initiate Mobile Money payment.'};
  return {ok:true,paymentId:payment.id,promotionId:promotion.id,txRef,amount,currency:'UGX',authorization:data?.meta?.authorization||null,message:'Approve the Mobile Money payment on your phone.'};
 }
 @UseGuards(JwtAuthGuard)
 @Get('mine')
 async mine(@Request() req:any){
  return this.db.promotion.findMany({where:{sellerId:req.user.sub},include:{Ad:{select:{id:true,title:true,images:{take:1,orderBy:{sortOrder:'asc'}}}},},orderBy:{createdAt:'desc'},take:50});
 }
 @UseGuards(JwtAuthGuard)
 @Post('cancel')
 async cancel(@Body() body:any,@Request() req:any){
  const p=await this.db.promotion.findUnique({where:{id:String(body.promotionId)},select:{id:true,sellerId:true,status:true,adId:true,type:true}});
  if(!p)throw new ForbiddenException('Promotion not found.');
  if(p.sellerId!==req.user.sub&&req.user.role!=='ADMIN')throw new ForbiddenException('You cannot manage this promotion.');
  if(p.status!=='ACTIVE')throw new ForbiddenException('Only active promotions can be paused.');
  await this.db.promotion.update({where:{id:p.id},data:{status:'CANCELLED'}});
  await this.db.ad.update({where:{id:p.adId},data:{[p.type==='BOOST'?'boostUntil':'featuredUntil']:new Date()}});
  return {ok:true};
 }
 @Post('webhook')
 async webhook(@Body() body:any,@Headers('verif-hash') verifHash?:string){
  const expected=process.env.FLW_SECRET_HASH;
  if(process.env.NODE_ENV==='production'&&!expected)throw new ForbiddenException('Webhook security is not configured.');if(expected&&verifHash!==expected)throw new ForbiddenException('Invalid webhook signature.');
  const data=body?.data||{};const txRef=String(data.tx_ref||data.reference||'');
  if(!txRef)return {ok:true};if(!data.id||!/^\\d+$/.test(String(data.id)))return {ok:true};
  const payment=await this.db.promotionPayment.findFirst({where:{reference:txRef}});
  if(!payment)return {ok:true};
  if(payment.status==='PAID')return {ok:true};
  const key=process.env.FLW_SECRET_KEY;
  if(!key)return {ok:true};
  const verify=await fetch(`https://api.flutterwave.com/v3/transactions/${data.id}/verify`,{headers:{Authorization:`Bearer ${key}`}});
  const result:any=await verify.json();const tx=result?.data;
  const valid=verify.ok&&result?.status==='success'&&tx?.status==='successful'&&Number(tx.amount)>=Number(payment.amount)&&tx.currency==='UGX'&&tx.tx_ref===txRef;
  if(!valid)return {ok:true};
  await this.db.promotionPayment.update({where:{id:payment.id},data:{status:'PAID'}});
  const promotion=await this.db.promotion.findUnique({where:{id:payment.promotionId}});
  if(promotion?.status==='PENDING_PAYMENT'){
   await this.db.promotion.update({where:{id:promotion.id},data:{status:'ACTIVE'}});
   const field=promotion.type==='BOOST'?'boostUntil':'featuredUntil';
   await this.db.ad.update({where:{id:promotion.adId},data:{[field]:promotion.endsAt}});
   await this.db.notification.create({data:{userId:payment.userId,type:'PROMOTION',title:'Promotion activated',body:`Your ${promotion.type.toLowerCase()} promotion is now active.`,link:`/sell/${promotion.adId}`}});
  }
  return {ok:true};
 }
}
