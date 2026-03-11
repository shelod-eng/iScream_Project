import { PrismaClient, IncidentStatus, IncidentType, IncidentEventKind } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@iscream.app' },
    update: { fullName: 'Nomsa Khumalo' },
    create: { email: 'demo@iscream.app', fullName: 'Nomsa Khumalo' },
  });

  const contacts = [
    { name: 'Mom', phone: '+27 71 000 0001', relationship: 'Mother' },
    { name: 'Brother', phone: '+27 71 000 0002', relationship: 'Brother' },
    { name: 'Friend', phone: '+27 71 000 0003', relationship: 'Friend' },
  ];

  await prisma.contact.createMany({
    data: contacts.map((c) => ({ ...c, userId: user.id })),
    skipDuplicates: true,
  });

  const incident = await prisma.incident.create({
    data: {
      userId: user.id,
      type: IncidentType.POLICE,
      title: 'Demo SOS',
      description: 'Triggered from demo web prototype',
      status: IncidentStatus.ACTIVE,
      events: {
        create: [
          { kind: IncidentEventKind.ALERT_SENT },
          { kind: IncidentEventKind.DISPATCH_NOTIFIED },
          { kind: IncidentEventKind.RESPONDER_ASSIGNED, message: 'Unit 47 — Sandton SAPS' },
        ],
      },
    },
  });

  console.log({ userId: user.id, incidentId: incident.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
