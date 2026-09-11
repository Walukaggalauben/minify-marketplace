import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('health')
export class HealthController {
 constructor(private readonly db: PrismaService) {}
 @Get()
 async health(){
  let database='ok';
  try { await this.db.$queryRaw`SELECT 1`; }
  catch { database='error'; }
  return {status:database==='ok'?'ok':'degraded',database,timestamp:new Date().toISOString()};
 }
}
