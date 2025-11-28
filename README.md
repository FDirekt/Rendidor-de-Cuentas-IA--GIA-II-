# Rendición de Cuentas – MVP asistido con IA

## Contexto
Trámite de rendición de cuentas del Tribunal de Cuentas de Córdoba. El operador carga 4 tipos de documentos y arma una orden final que luego firma un director. La primera entrega es exploratoria/mock para demostrar el flujo y dejar claro el plan de mejoras.

## Objetivo del MVP (entrega 12/12)
- Simular el flujo completo de “Iniciar nuevo trámite” hasta generar el formulario de rendición y marcarlo como “enviado por Director”.
- Ingestar PDFs/escaneos con OCR y extraer datos clave con un LLM para precargar el trámite.
- Validar datos vs. una base mock (evitar duplicados y detectar faltantes) y registrar resultados.
- Dejar backlog claro para la integración real (sistemas/DB del organismo).

## Alcance y supuestos
- Roles: Operador carga y revisa; Director firma y envía. Autenticación mock (selección de rol en UI).
- Datos mockeados en una base local (sqlite/postgres dev) con seeds: ministerios, tipos de rendición, DUEE/INT, devengados, pagos.
- No se firman PDFs digitalmente; se carga un PDF “firmado” como archivo.
- Integraciones externas (notificaciones, firma digital real, sistemas legados) quedan como tareas posteriores.

## Flujo funcional (paso a paso)
1) Área de trabajo → “Iniciar nuevo trámite” → elegir clase: `Ordenado a Pagar | Sueldos | DAC | Fondo Permanente`.  
2) Seleccionar Ministerio y Tipo de rendición (`Subsidio | Obras | Otros | Gastos generales`) → Siguiente.  
3) Elegir uno o varios DUEE/INT a rendir (el header del wizard pasa al paso 2).  
4) Marcar devengados a rendir (puede ser parcial).  
5) Marcar pagos asociados a esos devengados (normalmente todos).  
6) Adjuntar documentación por devengado y por pago (PDFs).  
7) Vista de resumen → generar Formulario de Rendición (PDF).  
8) Cargar formulario firmado.  
9) Con rol Director → Enviar rendición.

## Arquitectura propuesta (mockeada)
- **UI web**: wizard de 6–7 pasos con estado persistido en DB; carga/preview de PDFs.
- **Orquestación (n8n)**: recibe PDFs, lanza OCR y llama al LLM para extracción.
- **OCR**: servicio (Tesseract/Cloud Vision). Salida pasa al LLM.
- **LLM extracción**: prompt para normalizar campos clave (ministerio, número DUEE/INT, devengado, proveedor, montos, fechas, CUIT).
- **Verificación corta (ML chico)**: búsqueda de duplicados o registros ya cargados (simulado con embeddings/heurística en la DB).
- **Ruta A**: si ya existe → marcar coincidencia y enlazar.  
  **Ruta B**: si no existe → aplicar reglas de negocio con otro LLM (“juez”) y dejar decisión sugerida + trazas.
- **DB**: tablas `tramites`, `ministerios`, `tipos_rendicion`, `duee`, `devengados`, `pagos`, `documentos`, `validaciones`, `usuarios/roles`.
- **Almacenamiento archivos**: carpeta local `storage/` con metadatos en DB.

Diagrama rápido (texto):
```
OCR (n8n) → LLM extracción → DB staging
                      ↓
               ML/embeddings check
                      ↓
        [existe] enlace | [no existe] reglas LLM juez
                      ↓
                Wizard UI + resumen
```

## Modelo de datos (borrador mínimo)
- `tramites`: id, estado, clase, ministerio_id, tipo_rendicion, resumen_json, created_at.
- `duee`: id, numero, ministerio_id, meta_json.
- `devengados`: id, duee_id, proveedor, cuit, monto, fecha, estado.
- `pagos`: id, devengado_id, monto, retenciones_json, fecha.
- `documentos`: id, owner_type (devengado/pago/tramite), owner_id, tipo, path, ocr_text, llm_extraccion_json.
- `validaciones`: id, documento_id, tipo (duplicado/faltante/regla), resultado, decision_llm, trazas.
- `usuarios`: id, nombre, rol (operador/director).

## Alcance técnico de la demo
- UI: Next.js/React o similar, wizard con guardado step-by-step en DB mock.
- Backend: API REST (Node/Express o Nest) con endpoints para tramites, adjuntos, validaciones.
- Workers: hooks simulados para n8n/OCR/LLM (por ahora funciones dummy que leen PDFs de `storage/seed/` y retornan JSON estructurado).
- Generación de PDF del Formulario: plantilla estática + datos del trámite.

## Plan corto (antes del 12/12)
- Semanas 1–2: armar esquema DB + seeds; endpoints básicos; wizard UI con carga de PDFs y resumen.
- Semana 2: stub de pipeline OCR/LLM (endpoints que devuelven extracción simulada) + verificación de duplicados mock.
- Semana 2–3: generación de formulario PDF y carga de “firmado”; flujo de envío por Director; logging/auditoría mínima.
- Demo: recorrido completo con datos de ejemplo y trazas de decisiones (qué detectó el LLM, qué se marcó como duplicado).

## Mejoras posteriores
- Integrar OCR real y proveedor LLM configurable; refinar prompts y evaluaciones automáticas.
- Conectar con base real del organismo y sistemas legados (DUEE/INT, pagos, devengados).
- Firma digital avanzada (token/hsm) y verificación de integridad de PDFs.
- Alertas y notificaciones (correo/Telegram) y SLAs de procesamiento.
- Métricas de calidad de extracción y panel de auditoría.
- Integrar control de versiones de documentos y manejo de rechazos/devoluciones.

## Estado actual y path de resolución
Problema: automatizar la rendición, ingestando PDFs (pagos, devengados, documentación adicional), extrayendo datos por OCR+LLM, validando duplicados y reglas, y generando el formulario de rendición con anexos.

Stack elegido:
- Frontend: Next.js + React + Tailwind; vista principal (`/`) y carga de documentos (`/upload`).
- Backend: API Next (route handlers) en Node, con Playwright para generar PDF de plantillas, y Prisma + SQLite para persistir documentos.
- Data/Plantillas: mock de trámite en `src/lib/mockData.ts`; plantillas HTML→PDF en `src/lib/templates.ts` y ejemplos en `src/lib/templateSamples.ts`.

Flujo actual:
- `POST /api/documents`: recibe `{ caseId, tipo, nombre, contentBase64, hash? }`, aplica OCR/LLM stub, detecta duplicados por hash, si no hay duplicado ejecuta “juez” mock, y persiste en DB.
- `GET /api/documents` y `GET /api/documents/{caseId}`: consulta documentos.
- `POST /api/templates/:tipo` (pagos|devengados|documentacion): genera PDF base (para pruebas de OCR) con Playwright.
- Endpoints dedicados para orquestación: `POST /api/ocr` (OCR stub), `POST /api/llm/extract` (LLM extracción stub), `POST /api/llm/judge` (LLM juez stub). Útiles para n8n si se quieren nodos separados.
- UI `/upload`: formulario de subida (tipo y caso) + descarga de plantillas de ejemplo. Home incluye accesos rápidos a subida por tipo.

Próximos pasos (orden sugerido):
1) Reemplazar stubs por integración real de OCR (Tesseract/Cloud Vision/Textract) y LLM de extracción (DeepSeek/Llama 3.1/Qwen) con outputs JSON.
2) Incorporar wizard multi-paso con guardado por step en DB (tramite, devengados, pagos, docs, resumen).
3) Generar PDF final (formulario + anexos) usando datos persistidos; permitir subir PDF firmado.
4) Validaciones: refinar “juez” (reglas + consulta a DB real), y deduplicado por hash/embeddings.
5) Integrar roles y autorizaciones mínimas (operador/director), y logging/auditoría.

Refactorizaciones para n8n y orden del proyecto:
- Separar rutas por responsabilidad: `/api/documents` (ingesta), `/api/ocr` (si se quiere exponer OCR), `/api/llm` (extracción/validación) para que n8n pueda orquestar pasos en nodos individuales.
- Crear un servicio de “ingesta” reusable (ej. `src/services/ingest.ts`) que reciba archivos, calcule hash, llame OCR/LLM, y persista; las rutas sólo delegan.
- Definir tipos contractuales en `/src/types` (ya existe `documents.ts` y `templates.ts`) y reutilizarlos en prompts/llamadas de n8n para mantener los mismos nombres de campos.
- Añadir colas/eventos (p. ej. bullmq) si se requiere procesar OCR/LLM async; n8n podría disparar webhooks a `/api/documents` y luego consultar `/api/documents/{caseId}`.
- Extraer config de proveedores a `.env` (OCR/LLM endpoints y credenciales) y crear adaptadores (`src/lib/ocrProvider.ts`, `src/lib/llmProvider.ts`) para intercambiar fácilmente motor.
- Convertir plantillas HTML a componentes parametrizables y aislar la generación PDF en un servicio (`src/services/pdf.ts`) para que n8n pueda llamar a un endpoint único de “render”.
- Si n8n orquesta pasos: usar `POST /api/ocr` → `POST /api/llm/extract` → deduplicado (hash) → `POST /api/llm/judge` → persistir vía `/api/documents` o servicio interno de ingesta. Para generar documentos base, `POST /api/templates/:tipo`.

## Arranque rápido del mock (webapp Next.js)
Requisitos: Node 18+.
```
cd webapp
npm install    # ya ejecutado por create-next-app
npm run dev    # http://localhost:3000
```

### Qué incluye hoy
- UI demo en `webapp/src/app/page.tsx` con datos mock (wizard resumido, devengados, pagos, documentos) y accesos a subida por tipo.
- Página de carga de documentos en `webapp/src/app/upload/page.tsx` con formulario para Pagos, Devengados y Documentación Adicional; sube PDF, llama al pipeline mock y muestra resultado (OCR/LLM stub, duplicados, juez). Incluye botones para descargar plantillas PDF de ejemplo.
- Mock data central en `webapp/src/lib/mockData.ts`.
- API: `GET /api/tramite`; `POST /api/pdf` (stub); `GET/POST /api/documents` (persiste en DB); `GET /api/documents/{caseId}`; `POST /api/templates/:tipo` (PDF de plantillas).
- Endpoints separados: `POST /api/ocr`, `POST /api/llm/extract`, `POST /api/llm/judge` para orquestación externa.
- Pipeline mock en Prisma/SQLite: schema en `prisma/schema.prisma`, DB en `prisma/dev.db`; ingesta en `src/services/ingest.ts`; OCR stub/HTTP en `src/lib/ocrProvider.ts`; LLM stubs/OpenAI-compatible en `src/lib/llmProvider.ts`; cliente en `src/lib/prisma.ts`; plantillas en `src/lib/templates.ts`, samples en `src/lib/templateSamples.ts`; render PDF en `src/lib/pdf.ts`; orquestación de PDF en `src/services/pdfService.ts`.
- Ejemplos para n8n en `webapp/docs/n8n-examples.md`; configuración de env de ejemplo en `webapp/.env.example`.

## Prisma / Base de datos
- Config: SQLite en `prisma/dev.db` (`DATABASE_URL="file:./prisma/dev.db"` en `.env`).
- Crear/actualizar schema: `cd webapp && npx prisma migrate dev --name <cambio>`.
- Sin migración nueva, sincronizar schema: `cd webapp && npx prisma db push`.
- Regenerar cliente: `cd webapp && npx prisma generate`.
- Reset opcional: borrar `prisma/dev.db` y correr `npx prisma migrate dev`.
