import { ValidationPipe,RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap(){
 const app=await NestFactory.create<NestExpressApplication>(AppModule);
 const isProduction=process.env.NODE_ENV==='production';
 if(isProduction&&!process.env.CORS_ORIGINS) throw new Error('CORS_ORIGINS must be configured in production.');
 const origins=(process.env.CORS_ORIGINS||'http://localhost:3000').split(',').map(x=>x.trim()).filter(Boolean);
 app.enableCors({origin:(origin,callback)=>{
   if(!origin||origins.includes(origin)) return callback(null,true);
   return callback(new Error('Origin not allowed by CORS'),false);
 },credentials:true});
 app.use((req:any,res:any,next:any)=>{
   res.setHeader('X-Content-Type-Options','nosniff');
   res.setHeader('X-Frame-Options','DENY');
   res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
   res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
   res.setHeader('Cross-Origin-Resource-Policy','same-site');
   if(isProduction) res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
   next();
 });
 app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true,forbidNonWhitelisted:true}));
 app.setGlobalPrefix('api', { exclude: [{ path: 'health', method: RequestMethod.GET }] });
 app.useStaticAssets(join(process.cwd(),'uploads'),{prefix:'/uploads/'});
 await app.listen(process.env.API_PORT||4000,'127.0.0.1');
}
bootstrap();
