# Uso local de AutoPeritIA

Esta versión inicial implementa un flujo local de **JSON → validación de estructura → borrador de informe Markdown**. No requiere instalar paquetes ni configurar credenciales.

## Ejecutar

Desde la carpeta raíz del repositorio, iniciá un servidor estático:

```bash
python -m http.server 8000
```

En Windows también podés usar `py -m http.server 8000`. Abrí <http://localhost:8000/frontend/>.

No abras `frontend/index.html` directamente como archivo: la aplicación carga el esquema y el ejemplo mediante `fetch`, por lo que necesita servirse por HTTP.

## Pasos para probar

1. Elegí **Cargar ejemplo** o **Cargar archivo JSON**. También podés pegar JSON en el editor.
2. El esquema requerido está en `data/schema_pericia.json`; el JSON de prueba, en `data/ejemplo_pericia.json`.
3. Presioná **Validar y generar vista previa**. Si faltan campos requeridos o hay tipos incorrectos, se mostrarán los errores.
4. Revisá el borrador generado y descargá el `.md` o el `.json` si lo necesitás.

La aplicación procesa el contenido en el navegador; no lo envía a un servidor. Los valores booleanos del ejemplo son ilustrativos y deben confirmarse o editarse para cada caso. Un campo ausente se informa como error; un campo de texto vacío se presenta como `[Completar]` en el informe.

## Alcance y cautelas

- Esta entrega **no incorpora un modelo de IA**: no convierte relatos libres ni audios en hechos periciales. El JSON debe estar previamente completado y revisado.
- La validación comprueba sintaxis, campos requeridos y tipos definidos en el esquema; no verifica la exactitud de los datos, direcciones, dominios, daños o conclusiones.
- La vista previa es un borrador documental, no una pericia oficial. Requiere revisión y aprobación del profesional actuante antes de cualquier uso judicial.
- El renderizador no deduce responsabilidades ni completa hechos no aportados. Confirmá que toda afirmación del informe esté respaldada por las diligencias realizadas.
- Para preservar información sensible, probá con datos ficticios y no subas datos identificables de causas a un repositorio público.
