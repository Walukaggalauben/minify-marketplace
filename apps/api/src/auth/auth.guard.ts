import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
 constructor(private readonly jwt: JwtService) {}
 canActivate(context: ExecutionContext){
  const req=context.switchToHttp().getRequest();
  const header=String(req.headers.authorization||'');
  const token=header.startsWith('Bearer ')?header.slice(7):'';
  if(!token)throw new UnauthorizedException('Authentication required.');
  try{req.user=this.jwt.verify(token,{secret:process.env.JWT_SECRET || (process.env.NODE_ENV==='production' ? (()=>{throw new Error('JWT_SECRET is required in production')})() : 'dev-secret')});return true}
  catch{throw new UnauthorizedException('Invalid or expired session.')}
 }
}