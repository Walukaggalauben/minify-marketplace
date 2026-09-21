import {Body,Controller,ForbiddenException,Get,Headers,Post,Request,UseGuards} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

const TRIAL_MONTHS=6;
const PLANS:any={BASIC:50000,PREMIUM:150000,VIP:250000,VIP_GOLD:450000,DIAMOND:950000};
const addMonths=(date:Date,months:number)=>{const d=new Date(date);d.setMonth(d.getMonth()+months);return d;};

@Controller('subscriptions')
export class SubscriptionsController{
 constructor(private readonly db:PrismaService){}
 @UseGuards(JwtAuthGuard)
 @Get('me')
 async me(@Request() req:any){
  const user=await this.db.user.findUnique({where:{id:req.user.sub},select:{id:true,role:true,sellerTrialStartedAt:true,subscriptionPlan:true,subscriptionStatus:true,subscriptionStartedAt:true,subscriptionEndsAt:true}});
  if(!user)return {active:false};
  if(user.role!=='SELLER'&&user.role!=='ADMIN')return {active:false,role:user.role};
  if(user.role==='ADMIN')return {active:true,role:user.role,trial:false,paidRequired:false};
  const started=user.sellerTrialStartedAt;
  const trialEnds=started?addMonths(started,TRIAL_MONTHS):null;
  const trialDaysRemaining=trialEnds?Math.ceil((trialEnds.getTime()-Date.now())/86400000):0;
  const paid=user.subscriptionStatus==='ACTIVE'&&!!user.subscriptionEndsAt&&user.subscriptionEndsAt.getTime()>Date.now();
  return {active:paid||trialDaysRemaining>0,role:user.role,trial:!!started,trialEndsAt:trialEnds?.toISOString()||null,trialDaysRemaining:Math.max(0,trialDaysRemaining),trialExpired:!!started&&trialDaysRemaining<=0,paidRequired:!paid&&trialDaysRemaining<=0,subscriptionPlan:user.subscriptionPlan,subscriptionStatus:user.subscriptionStatus,subscriptionStartedAt:user.subscriptionStartedAt?.toISOString()||null,subscriptionEndsAt:user.subscriptionEndsAt?.toISOString()||null};
 }
 @UseGuards(JwtAuthGuard)
 @Get('plans')
 plans(){return Object.entries(PLANS).map(([id,price])=>({id,name:id.replace('_',' '),price,currency:'UGX',period:'MONTHLY'}));}
 @UseGuards(JwtAuthGuard)
 @Post('initiate')
 async initiate(@Body() body:any,@Request() req:any){
  const plan=String(body.plan||'').toUpperCase();if(!PLANS[plan])throw new ForbiddenException('Select a valid seller package.');
  const network=String(body.network||'').toUpperCase();if(!['MTN','AIRTEL'].includes(network))throw new ForbiddenException('Select MTN or Airtel.');
  const user=await this.db.user.findUnique({where:{id:req.user.sub},select:{role:true,name:true,email:true,phone:true}});
  if(!user||!['SELLER','ADMIN'].includes(user.role))throw new ForbiddenException('Seller account required.');
  if(!user.email||!user.phone)throw new ForbiddenException('A valid seller email and phone number are required.');
  const reference=`MM-SUB-${randomUUID()}`;const amount=PLANS[plan];
  const payment=await this.db.subscriptionPayment.create({data:{userId:req.user.sub,plan,amount,currency:'UGX',provider:'FLUTTERWAVE',reference,status:'PENDING'}});
  const key=process.env.FLW_SECRET_KEY;if(!key)return {ok:false,paymentId:payment.id,amount,currency:'UGX',message:'Payment gateway is not configured. Add FLW_SECRET_KEY before taking live payments.'};
  const response=await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_uganda',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({phone_number:user.phone,network,amount,currency:'UGX',email:user.email,tx_ref:reference,fullname:user.name,meta:{subscriptionPaymentId:payment.id,plan,marketplaceCommissionPercent:Number(process.env.MARKETPLACE_COMMISSION_PERCENT||20)}})});
  const data:any=await response.json();if(!response.ok||data?.status!=='success')return {ok:false,paymentId:payment.id,amount,currency:'UGX',message:data?.message||'Could not initiate Mobile Money payment.'};
  return {ok:true,paymentId:payment.id,reference,amount,currency:'UGX',authorization:data?.meta?.authorization||null,message:'Approve the Mobile Money payment on your phone.'};
 }
 @Post('webhook')
 async webhook(@Body() body:any,@Headers('verif-hash') verifHash?:string){
  const expected=process.env.FLW_SECRET_HASH;if(process.env.NODE_ENV==='production'&&!expected)throw new ForbiddenException('Webhook security is not configured.');if(expected&&verifHash!==expected)throw new ForbiddenException('Invalid webhook signature.');
  const data=body?.data||{};const reference=String(data.tx_ref||data.reference||'');if(!reference)return {ok:true};if(!data.id||!/^\\d+$/.test(String(data.id)))return {ok:true};
  const payment=await this.db.subscriptionPayment.findFirst({where:{reference}});if(!payment)return {ok:true};
  if(payment.status==='PAID')return {ok:true};
  const key=process.env.FLW_SECRET_KEY;if(!key)return {ok:true};
  const verify=await fetch(`https://api.flutterwave.com/v3/transactions/${data.id}/verify`,{headers:{Authorization:`Bearer ${key}`}});const result:any=await verify.json();const tx=result?.data;
  const valid=verify.ok&&result?.status==='success'&&tx?.status==='successful'&&Number(tx.amount)>=Number(payment.amount)&&tx.currency==='UGX'&&tx.tx_ref===reference;if(!valid)return {ok:true};
  const started=new Date();const ends=new Date(started.getTime()+30*86400000);
  await this.db.subscriptionPayment.update({where:{id:payment.id},data:{status:'PAID',startedAt:started,endsAt:ends}});
  await this.db.user.update({where:{id:payment.userId},data:{subscriptionPlan:payment.plan,subscriptionStatus:'ACTIVE',subscriptionStartedAt:started,subscriptionEndsAt:ends}});
  await this.db.notification.create({data:{userId:payment.userId,type:'SUBSCRIPTION',title:'Seller package activated',body:`Your ${payment.plan.replace('_',' ')} package is active for 30 days.`,link:'/dashboard'}});
  return {ok:true};
 }
}