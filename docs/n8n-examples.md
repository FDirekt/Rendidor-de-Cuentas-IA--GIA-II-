# Ejemplos de payload para n8n

## 1) Ingesta de documento
Webhook (POST) a `http://localhost:3000/api/documents`:
```json
{
  "caseId": "C-1",
  "tipo": "Pagos",
  "nombre": "MEP_4291.pdf",
  "contentBase64": "<base64 del PDF>",
  "hash": "opcional"
}
```

## 2) OCR separado
POST a `http://localhost:3000/api/ocr`:
```json
{
  "contentBase64": "<base64 del PDF>"
}
```
Responde `{ "text": "...", "confidence": 0.9 }`.

## 3) LLM extracción
POST a `http://localhost:3000/api/llm/extract`:
```json
{
  "tipo": "Pagos"
}
```
Responde `{ "fields": { ... }, "model": "..." }`.

## 4) LLM juez
POST a `http://localhost:3000/api/llm/judge`:
```json
{
  "extraction": {
    "duee": "11/34",
    "monto": "$ 1.000.000,00"
  }
}
```
Responde `{ "status": "aprobado|observado", "reason": "...", "model": "..." }`.

## 5) Generar plantilla PDF
POST a `http://localhost:3000/api/templates/pagos` (o `devengados`, `documentacion`):
```json
{
  "caseId": "C-1",
  "items": [
    {
      "numeroDevengado": "2024/039748",
      "tipoEp": "MEP",
      "planilla": "4291",
      "numeroEp": "2024/003918",
      "cuentaDestino": "DIAZ, LAURA ANDREA",
      "numeroLiquidacion": "0",
      "tipoPago": "Proveedor",
      "importePagado": "$ 950.000,00"
    }
  ]
}
```

## 6) Flujo sugerido en n8n (alto nivel)
1. Webhook (PDF) → guardar base64.
2. Nodo OCR: `POST /api/ocr`.
3. Nodo LLM extracción: `POST /api/llm/extract` (puedes incluir `contentBase64` en prompt o adjuntar texto OCR si customizas).
4. Nodo deduplicado: calcular hash (Function) y consultar `/api/documents` o delegar a `/api/documents`.
5. Nodo juez: `POST /api/llm/judge`.
6. Persistir: `POST /api/documents` para registrar pipeline completo.
7. Generar PDF base (opcional): `POST /api/templates/:tipo`.
8. Para listar documentos de un caso específico: `GET /api/cases/{caseId}/documents`.
