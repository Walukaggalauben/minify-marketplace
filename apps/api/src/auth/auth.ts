import { Body, Controller, Injectable, Post, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "./auth.guard";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { createHash, randomBytes } from "crypto";

const passwordPolicy = (password: string) => password.length >= 8 && password.length <= 128;
const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");

@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService, private readonly jwt: JwtService) {}
  private issueToken(user: any) { return this.jwt.sign({ sub: user.id, email: user.email, role: user.role }); }

  async register(data: any) {
    const email = String(data?.email ?? "").trim().toLowerCase(), password = String(data?.password ?? ""), name = String(data?.name ?? "").trim(), phone = String(data?.phone ?? "").trim();
    if (!email || !password || !name || !phone) throw new UnauthorizedException("Name, email, phone and password are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UnauthorizedException("Enter a valid email address.");
    if (!passwordPolicy(password)) throw new UnauthorizedException("Password must be 8–128 characters.");
    if (name.length < 2 || name.length > 100) throw new UnauthorizedException("Enter a valid name.");
    if (!/^[+0-9][0-9\s-]{6,29}$/.test(phone)) throw new UnauthorizedException("Enter a valid phone number.");
    const existing = await this.db.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { email: true, phone: true } });
    if (existing?.email === email) throw new UnauthorizedException("An account with this email already exists.");
    if (existing?.phone === phone) throw new UnauthorizedException("An account with this phone number already exists.");
    const user = await this.db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10), phone } });
    return { token: this.issueToken(user), user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
  }

  async login(data: any) {
    const email = String(data?.email ?? "").trim().toLowerCase(), password = String(data?.password ?? "");
    if (!email || !password) throw new UnauthorizedException("Email and password are required.");
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException("Invalid email or password.");
    return { token: this.issueToken(user), user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
  }

  async becomeSeller(id: string) {
    const current = await this.db.user.findUnique({ where: { id }, select: { sellerTrialStartedAt: true } });
    const user = await this.db.user.update({ where: { id }, data: { role: "SELLER", sellerTrialStartedAt: current?.sellerTrialStartedAt ?? new Date() }, select: { id: true, name: true, email: true, phone: true, role: true } });
    return { token: this.issueToken(user), user };
  }

  async forgotPassword(data: any) {
    const email = String(data?.email ?? "").trim().toLowerCase();
    const message = "If an account exists for that email, a password reset link has been prepared.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message };
    const user = await this.db.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return { message };
    const token = randomBytes(32).toString("hex"), expires = new Date(Date.now() + 30 * 60 * 1000);
    await this.db.$executeRaw(Prisma.sql`UPDATE "User" SET "passwordResetTokenHash"=${hashResetToken(token)}, "passwordResetExpiresAt"=${expires} WHERE id=${user.id}`);
    const base = process.env.NEXT_PUBLIC_WEB_URL || process.env.WEB_URL || "http://localhost:3000";
    const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
    return process.env.NODE_ENV !== "production" ? { message, resetUrl } : { message };
  }

  async resetPassword(data: any) {
    const token = String(data?.token ?? ""), password = String(data?.password ?? "");
    if (!token || !passwordPolicy(password)) throw new UnauthorizedException("Invalid reset request.");
    const rows = await this.db.$queryRaw<any[]>(Prisma.sql`SELECT id FROM "User" WHERE "passwordResetTokenHash"=${hashResetToken(token)} AND "passwordResetExpiresAt" > NOW() LIMIT 1`);
    const user = rows[0];
    if (!user) throw new UnauthorizedException("This reset link is invalid or expired.");
    const passwordHash = await bcrypt.hash(password, 10);
    await this.db.$executeRaw(Prisma.sql`UPDATE "User" SET "passwordHash"=${passwordHash}, "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL, "updatedAt"=NOW() WHERE id=${user.id}`);
    return { message: "Password changed successfully." };
  }

  async changePassword(id: string, data: any) {
    const current = String(data?.currentPassword ?? ""), next = String(data?.newPassword ?? "");
    if (!passwordPolicy(next)) throw new UnauthorizedException("New password must be 8–128 characters.");
    if (current === next) throw new UnauthorizedException("New password must be different from your current password.");
    const user = await this.db.user.findUnique({ where: { id }, select: { passwordHash: true } });
    if (!user || !(await bcrypt.compare(current, user.passwordHash))) throw new UnauthorizedException("Current password is incorrect.");
    const passwordHash = await bcrypt.hash(next, 10);
    await this.db.$executeRaw(Prisma.sql`UPDATE "User" SET "passwordHash"=${passwordHash}, "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL, "updatedAt"=NOW() WHERE id=${id}`);
    return { message: "Password updated successfully." };
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post("register") register(@Body() data: any) { return this.authService.register(data); }
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("login") login(@Body() data: any) { return this.authService.login(data); }
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("forgot-password") forgotPassword(@Body() data: any) { return this.authService.forgotPassword(data); }
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("reset-password") resetPassword(@Body() data: any) { return this.authService.resetPassword(data); }
  @UseGuards(JwtAuthGuard)
  @Post("change-password") changePassword(@Request() req: any, @Body() data: any) { return this.authService.changePassword(req.user.sub, data); }
  @UseGuards(JwtAuthGuard)
  @Post("become-seller") becomeSeller(@Request() req: any) { return this.authService.becomeSeller(req.user.sub); }
}
