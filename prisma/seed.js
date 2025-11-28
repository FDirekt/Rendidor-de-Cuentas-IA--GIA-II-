/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const casesSeed = [
  {
    id: "C-101",
    name: "Rendición Desarrollo Social",
    owner: "Sofía Videla",
    status: "ACTIVO",
    summary: "Pagos y devengados vinculados al programa 641 con fondos ya girados.",
    docs: [
      {
        key: "mep-4291",
        tipo: "Pagos",
        nombre: "Planilla MEP 4291.pdf",
        hash: "hash-mep-4291",
        ocrText: "Planilla MEP 4291 - pagos devengado 2024/039748",
        extraction: {
          numeroDevengado: "2024/039748",
          tipoEp: "MEP",
          planilla: "4291",
          numeroEp: "2024/003918",
          cuentaDestino: "DIAZ, LAURA ANDREA",
          importePagado: "$ 950.000,00",
        },
        judgeStatus: "Aprobado",
        judgeReason: "Totales coinciden con devengado 2024/039748.",
      },
      {
        key: "factura-36",
        tipo: "Devengados",
        nombre: "Factura 00001-00000036.pdf",
        hash: "hash-factura-36",
        ocrText: "Factura 36 por servicios informáticos",
        extraction: {
          numero: "2024/039654",
          numeroComprobante: "00001-00000036",
          proveedor: "NORTH COMPUTERS S.R.L.",
          totalDevengado: "$ 825.000,00",
          validadoAfip: "true",
        },
        judgeStatus: "Aprobado",
        judgeReason: "Datos AFIP validados.",
      },
    ],
  },
  {
    id: "C-202",
    name: "Programa de becas innovar",
    owner: "Sofía Videla",
    status: "ACTIVO",
    summary: "Gastos corrientes en revisión de duplicados.",
    docs: [
      {
        key: "dev-970",
        tipo: "Devengados",
        nombre: "Devengado 2024/040970.pdf",
        hash: "hash-dev-970",
        ocrText: "Devengado 2024/040970",
        extraction: {
          duee: "11/35",
          numero: "2024/040970",
          proveedor: "Servicios Creativos SRL",
          totalDevengado: "$ 615.000,00",
        },
        judgeStatus: "Pendiente",
        judgeReason: "Esperando legajo de pagos.",
      },
      {
        key: "iva-1851",
        tipo: "Pagos",
        nombre: "Pago IVA 1851.pdf",
        hash: "hash-iva-1851",
        ocrText: "Pago IVA planilla 1851",
        extraction: {
          numeroDevengado: "2024/039654",
          tipoEp: "TRANSF",
          planilla: "1851",
          cuentaDestino: "AFIP - IVA",
          importePagado: "$ 62.700,00",
        },
        judgeStatus: "Observado",
        judgeReason: "Cruzar con devengado 2024/039654.",
      },
      {
        key: "mep-duplicado",
        tipo: "Pagos",
        nombre: "Planilla MEP 4291 (duplicado).pdf",
        hash: "hash-mep-4291",
        ocrText: "Planilla MEP 4291 repetida",
        extraction: {
          numeroDevengado: "2024/039748",
          tipoEp: "MEP",
          planilla: "4291",
          cuentaDestino: "DIAZ, LAURA ANDREA",
          importePagado: "$ 950.000,00",
        },
        duplicateOfKey: "mep-4291",
      },
    ],
  },
  {
    id: "C-303",
    name: "Rendición equipamiento escuelas",
    owner: "Sofía Videla",
    status: "TERMINADO",
    summary: "Caso cerrado con acta final emitida.",
    docs: [
      {
        key: "acta-final",
        tipo: "DocumentacionAdicional",
        nombre: "Acta de cierre.pdf",
        hash: "hash-acta-final-303",
        ocrText: "Acta final del caso 303",
        extraction: {
          nombreDocumento: "Acta de cierre",
          tipoDocumento: "Resolución",
          observacion: "Firmada",
        },
        judgeStatus: "Aprobado",
        judgeReason: "Caso cerrado",
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding database...");
  await prisma.document.deleteMany();
  await prisma.case.deleteMany();

  const docIndex = {};

  for (const seedCase of casesSeed) {
    const createdCase = await prisma.case.create({
      data: {
        id: seedCase.id,
        name: seedCase.name,
        owner: seedCase.owner,
        status: seedCase.status,
        summary: seedCase.summary,
      },
    });

    for (const doc of seedCase.docs) {
      const duplicateOf = doc.duplicateOfKey ? docIndex[doc.duplicateOfKey] : null;
      const createdDoc = await prisma.document.create({
        data: {
          caseId: createdCase.id,
          tipo: doc.tipo,
          nombre: doc.nombre,
          hash: duplicateOf?.hash ?? doc.hash,
          ocrText: doc.ocrText,
          extraction: JSON.stringify(doc.extraction ?? {}),
          duplicateOfId: duplicateOf?.id ?? null,
          duplicateOfCaseId: duplicateOf?.caseId ?? null,
          judgeStatus: duplicateOf ? null : doc.judgeStatus ?? null,
          judgeReason: duplicateOf ? null : doc.judgeReason ?? null,
        },
      });

      if (doc.key) {
        docIndex[doc.key] = createdDoc;
      }
    }
  }

  console.log("✅ Seed completada");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
