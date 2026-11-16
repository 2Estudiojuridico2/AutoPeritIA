# AutoPeritIA — prototipo de informe pericial

AutoPeritIA reúne recursos para preparar borradores de informes técnicos periciales de siniestros viales. La herramienta interactiva disponible en `frontend/` permite cargar un JSON, validarlo contra `data/schema_pericia.json`, generar una vista previa en Markdown y descargar los archivos.

## Prueba rápida

Desde la raíz del proyecto ejecutá `python -m http.server 8000` (o `py -m http.server 8000` en Windows) y visitá <http://localhost:8000/frontend/>. Cargá el ejemplo de `data/ejemplo_pericia.json` o tu propio archivo JSON. La guía completa está en [`docs/uso_local.md`](docs/uso_local.md).

## Alcance de esta versión

Es un prototipo local de **JSON a Markdown**; no incluye todavía integración con IA, transcripción de voz, generación de archivos Word/PDF ni un backend. La validación es estructural, no una certificación de la exactitud de los hechos ni de conclusiones técnico-periciales. Todo resultado debe ser revisado por el profesional actuante.

**Privacidad:** el navegador procesa localmente los datos. No publiques información identificable de casos en este repositorio público.
