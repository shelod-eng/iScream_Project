import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient, IncidentEventKind, IncidentStatus, IncidentType } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const envSchema = z.object({
  PORT: z.coerce.number().default(8787),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const env = envSchema.parse(process.env);

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin === env.CORS_ORIGIN) return cb(null, true);
    return cb(new Error('Not allowed by CORS'), false);
  },
});

app.get('/health', async () => ({ ok: true }));

const createUserBody = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).optional(),
});

app.post('/api/users', async (req, reply) => {
  const parsed = createUserBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });

  const { email, fullName } = parsed.data;
  const user = await prisma.user.upsert({
    where: { email },
    update: { fullName },
    create: { email, fullName },
  });

  return { user };
});

app.get('/api/users/:id', async (req, reply) => {
  const id = (req.params as any).id as string;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return reply.code(404).send({ error: 'NOT_FOUND' });
  return { user };
});

const contactBody = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().min(3),
  relationship: z.string().min(1).optional(),
});

app.post('/api/contacts', async (req, reply) => {
  const parsed = contactBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });

  const contact = await prisma.contact.create({ data: parsed.data });
  return { contact };
});

app.get('/api/users/:id/contacts', async (req) => {
  const userId = (req.params as any).id as string;
  const contacts = await prisma.contact.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return { contacts };
});

const incidentCreateBody = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(IncidentType),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

app.post('/api/incidents', async (req, reply) => {
  const parsed = incidentCreateBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });

  const incident = await prisma.incident.create({
    data: {
      ...parsed.data,
      status: IncidentStatus.ACTIVE,
      events: { create: [{ kind: IncidentEventKind.ALERT_SENT }] },
    },
    include: { events: true },
  });

  return { incident };
});

app.get('/api/incidents', async (req) => {
  const { status, userId } = (req.query as any) as { status?: string; userId?: string };

  const where: any = {};
  if (status && Object.values(IncidentStatus).includes(status as any)) where.status = status;
  if (userId) where.userId = userId;

  const incidents = await prisma.incident.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });

  return { incidents };
});

app.get('/api/incidents/:id', async (req, reply) => {
  const id = (req.params as any).id as string;
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });
  if (!incident) return reply.code(404).send({ error: 'NOT_FOUND' });
  return { incident };
});

const incidentStatusBody = z.object({
  status: z.nativeEnum(IncidentStatus),
  message: z.string().optional(),
});

app.patch('/api/incidents/:id/status', async (req, reply) => {
  const id = (req.params as any).id as string;

  const parsed = incidentStatusBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });

  const { status, message } = parsed.data;

  const kind = status === IncidentStatus.RESOLVED
    ? IncidentEventKind.RESOLVED
    : status === IncidentStatus.CANCELLED
      ? IncidentEventKind.CANCELLED
      : IncidentEventKind.NOTE;

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === IncidentStatus.ACTIVE ? null : new Date(),
      events: { create: [{ kind, message }] },
    },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });

  return { incident };
});

const incidentEventBody = z.object({
  kind: z.nativeEnum(IncidentEventKind),
  message: z.string().optional(),
});

app.post('/api/incidents/:id/events', async (req, reply) => {
  const incidentId = (req.params as any).id as string;
  const parsed = incidentEventBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });

  const event = await prisma.incidentEvent.create({ data: { incidentId, ...parsed.data } });
  return { event };
});

app.addHook('onClose', async () => {
  await prisma.$disconnect();
});

await app.listen({ port: env.PORT, host: '0.0.0.0' });
