import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('ai')
export class AiController {
  constructor(private readonly db: PrismaService) {}

  @Post('chat')
  async chat(@Body() body: any) {
    const message = String(body?.message || '').trim();
    const history = Array.isArray(body?.history) ? body.history.slice(-12) : [];
    if (!message) return { reply: 'Tell me what you want to find, sell or understand on MINIFY MARKET.', items: [] };
    const lower = message.toLowerCase();
    const price = this.parsePrice(message);
    const city = this.parseCity(message);
    const wantsSearch = /(find|search|looking for|show|price|compare|buy|available)/i.test(message);
    let items: any[] = [];
    if (wantsSearch) items = await this.search(message, price, city);
    const reply = await this.generateReply(message, history, items, price, city);
    return { reply, items };
  }

  private async search(message: string, price?: number, city?: string) {
    const now = new Date();
    const where: any = { status: 'ACTIVE', AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }] };
    const words = message.replace(/(?:under|below|less than).*$/i, '').replace(/\bin\s+[A-Za-z ]+$/i, '').replace(/\b(find|search|show me|show|looking for|buy)\b/gi, '').trim();
    if (words) where.AND.push({ OR: [{ title: { contains: words, mode: 'insensitive' } }, { description: { contains: words, mode: 'insensitive' } }] });
    if (price) where.price = { lte: price };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    return this.db.ad.findMany({ where, include: { images: true, seller: { select: { id: true, name: true, verified: true, city: true } } }, orderBy: { createdAt: 'desc' }, take: 6 });
  }

  private parsePrice(text: string) {
    const m = text.replace(/,/g, '').match(/(?:under|below|less than|budget(?: is)?)[^0-9]*([0-9.]+)\s*(m|million|k|thousand)?/i);
    if (!m) return undefined;
    const n = Number(m[1]); if (!Number.isFinite(n)) return undefined;
    return /m|million/i.test(m[2] || '') ? n * 1_000_000 : /k|thousand/i.test(m[2] || '') ? n * 1_000 : n;
  }

  private parseCity(text: string) {
    const m = text.match(/\bin\s+([A-Za-z][A-Za-z ]{1,30}?)(?=\s+(?:under|below|for|with)\b|[?.!,]|$)/i);
    return m?.[1]?.trim();
  }
  private async generateReply(message: string, history: any[], items: any[], price?: number, city?: string) {
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      try {
        const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
        const context = items.map((x) => `${x.title} | UGX ${Number(x.price).toLocaleString()} | ${x.city || 'Uganda'}`).join('\n');
        const input = [{ role: 'system', content: `You are MINIFY MARKET AI, a friendly Ugandan marketplace assistant. Be concise and practical. Help users search listings, compare prices, create adverts and buy safely. Never invent listing facts. Live listings:\n${context || 'No matching live listings.'}` }, ...history.slice(-10), { role: 'user', content: message }];
        const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model, input, max_output_tokens: 500 }) });
        if (response.ok) { const data: any = await response.json(); const text = data.output_text || data.output?.flatMap((o: any) => o.content || []).find((c: any) => c.type === 'output_text')?.text; if (text) return text; }
        else { const error = await response.text().catch(() => ''); console.warn(`[AI] OpenAI request failed (${response.status})${error ? `: ${error.slice(0,300)}` : ''}`); }
      } catch (error: any) { console.warn(`[AI] OpenAI request error: ${error?.message || 'unknown error'}`); }
    }
    return this.fallbackReply(message, items, price, city);
  }

  private fallbackReply(message: string, items: any[], price?: number, city?: string) {
    const lower = message.toLowerCase();
    if (/^(hi|hey|hello|how are you)\b/.test(lower)) return 'Hi! I’m MINIFY MARKET AI. Tell me what you want to buy or sell, your budget or asking price, and your location. I can search live adverts, compare listings, build an advert with you, or explain safe buying.';
    if (/about minify|what is minify|who are you/.test(lower)) return 'MINIFY MARKET is the marketplace for discovering and posting adverts. I can help you search listings, understand categories and prices, prepare adverts, and use the marketplace safely.';
    if (/safe|scam|fraud|payment|meet/.test(lower)) return 'For safer transactions, inspect the exact item before paying, verify seller and listing details, avoid unusual advance-payment requests, keep communication on MINIFY MARKET where possible, and meet in a sensible public place.';
    if (/sell|advert|listing/.test(lower)) return 'Absolutely. I can build the advert with you. Start with the item, condition, asking price, location and what is included. For example: “iPhone 15 Pro 256GB, used, UGX 2.8m, Kampala.”';
    if (items.length) return `I found ${items.length} live listing${items.length === 1 ? '' : 's'}${city ? ` around ${city}` : ''}${price ? ` within UGX ${price.toLocaleString()}` : ''}. Open a listing below to inspect the seller, photos, details and contact options.`;
    return 'I can help with that. Tell me the item, budget, location and condition you want, or say “help me sell” and we’ll build the advert step by step.';
  }
}
