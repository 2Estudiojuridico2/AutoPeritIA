const jsonInput = document.querySelector('#json-input');
const fileInput = document.querySelector('#file-input');
const statusBox = document.querySelector('#status');
const errorsList = document.querySelector('#errors');
const preview = document.querySelector('#report-preview');
const validateButton = document.querySelector('#validate');
const downloadJsonButton = document.querySelector('#download-json');
const downloadReportButton = document.querySelector('#download-report');
const copyButton = document.querySelector('#copy-report');
let schema = null;
let reportText = '';
let currentJson = null;

const get = (obj, path) => path.split('.').reduce((value, key) => value == null ? undefined : value[key], obj);
const text = (value) => typeof value === 'string' && value.trim() ? value.trim() : '[Completar]';
const paragraph = (value) => text(value).replace(/\r?\n/g, '\n\n');
const safeFilename = (value) => String(value || 'informe').replace(/[^a-zA-Z0-9_-]+/g, '_');

function validateNode(value, rule, path, errors) {
  const type = rule.type;
  const actual = Array.isArray(value) ? 'array' : (value === null ? 'null' : typeof value);
  const matches = type === 'integer' ? Number.isInteger(value) : type === 'object' ? actual === 'object' && !Array.isArray(value) : actual === type;
  if (!matches) {
    errors.push(`${path}: se esperaba ${type} y se recibió ${actual}.`);
    return;
  }
  if (type === 'object') {
    for (const key of rule.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`${path}.${key}: campo obligatorio ausente.`);
    }
    for (const [key, childRule] of Object.entries(rule.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) validateNode(value[key], childRule, `${path}.${key}`, errors);
    }
  }
  if (type === 'array' && rule.items) {
    value.forEach((item, index) => validateNode(item, rule.items, `${path}[${index}]`, errors));
  }
}

function list(items) {
  return items.length ? items.map((item) => `- ${paragraph(item)}`).join('\n') : '- [Sin datos consignados]';
}

function buildReport(data) {
  const h = data.encabezado;
  const tasks = data.tareas_periciales;
  const call = tasks.intervencion_y_consigna;
  const officer = call.efectivo_consigna;
  const scene = tasks.inspeccion_ocular;
  const traces = tasks.relevamiento_planimetrico_y_rastros;
  const exam = tasks.examen_tecnico_vehicular;
  const vehicles = data.elementos_estudio.length
    ? data.elementos_estudio.map((vehicle) => `- **Vehículo ${vehicle.orden}:** ${paragraph(vehicle.descripcion_lista)}`).join('\n')
    : '- [Sin elementos consignados]';
  const inspections = exam.length
    ? exam.map((vehicle) => `#### Unidad ${vehicle.orden}: ${paragraph(vehicle.identificacion_corta)}\n\n- **Posición final:** ${paragraph(vehicle.posicion_final)}\n- **Daños:** ${paragraph(vehicle.descripcion_danos)}\n- **Sistemas de seguridad:** ${paragraph(vehicle.sistemas_seguridad)}`).join('\n\n')
    : '[Sin examen vehicular consignado]';
  const tracesText = traces.detalle_rastros.length ? list(traces.detalle_rastros) : `- ${paragraph(traces.observacion_sin_rastros)}`;
  const sceneStatus = scene.escena_removida ? 'Se consigna que la escena se encontraba removida posimpacto.' : 'La escena no se consigna como removida.';
  const vestigeStatus = traces.hay_vestigios ? 'Se consignan vestigios.' : 'No se consignan vestigios.';

  return [
    '# GOBIERNO DE LA CIUDAD AUTÓNOMA DE BUENOS AIRES',
    '## Ministerio de Seguridad',
    '',
    '> 2026 - Año del 30º Aniversario de la sanción de la Constitución de la Ciudad Autónoma de Buenos Aires.',
    '',
    '**AL SEÑOR JEFE DE SECCIÓN INVESTIGACIÓN CIENTÍFICA VIAL. S / D.**',
    '',
    `**${paragraph(h.fecha_texto)}**`,
    '',
    `# INFORME TÉCNICO N° ${paragraph(h.numero_informe)}.`,
    '',
    paragraph(h.parrafo_introductorio),
    '',
    '## OBJETOS DE LA INSPECCIÓN',
    '',
    'Se efectuó la inspección técnica de los elementos ofrecidos para estudio y el relevamiento del escenario y de los vestigios consignados, con fijación fotográfica según lo informado. La ubicación de los daños se describe desde la posición del conductor, de atrás hacia adelante y de izquierda a derecha, cuando los datos aportados permiten precisarla.',
    '',
    '## ELEMENTOS OFRECIDOS PARA ESTUDIO',
    '',
    `- **Sumario:** ${paragraph(h.sumario)}`,
    `- **Comisaría Vecinal:** ${paragraph(h.comisaria_vecinal)}`,
    `- **Carátula:** ${paragraph(h.caratula)}`,
    `- **Fiscalía:** ${paragraph(h.fiscalia)}`,
    ...data.elementos_estudio.map((vehicle) => `- **Vehículo ${vehicle.orden}:** ${paragraph(vehicle.descripcion_lista)}`),
    `- **Lugar del relevamiento:** ${paragraph(data.lugar_relevamiento)}`,
    '',
    '## DILIGENCIAS PRACTICADAS',
    '',
    '### Intervención y consigna',
    '',
    `Arribo: ${paragraph(call.hora_arribo)}. ${paragraph(call.relato_comision)}`,
    `Efectivo de consigna: ${paragraph(officer.jerarquia)}, ${paragraph(officer.nombre_completo)}, LP ${paragraph(officer.legajo)}.`,
    '',
    '### Inspección ocular del escenario e infraestructura vial',
    '',
    paragraph(scene.descripcion_integral),
    '',
    `- **Tipo de arteria y sentido:** ${paragraph(scene.tipo_arteria_y_sentido)}`,
    `- **Superficie y estado de calzada:** ${paragraph(scene.superficie_calzada)}; ${paragraph(scene.estado_calzada)}.`,
    `- **Iluminación y visibilidad:** ${paragraph(scene.iluminacion_y_visibilidad)}`,
    `- **Señalización vial:** ${paragraph(scene.senalizacion_vial)}`,
    `- **Preservación:** ${sceneStatus}`,
    '',
    '### Relevamiento planimétrico y de rastros',
    '',
    `${vestigeStatus} ${paragraph(traces.mediciones_y_referencias)}`,
    '',
    tracesText,
    '',
    '### Fijación fotográfica',
    '',
    paragraph(tasks.fijacion_fotografica.descripcion_diligencia),
    '',
    '### Posición final y examen técnico analítico de las unidades',
    '',
    inspections,
    '',
    '## CONCLUSIÓN',
    '',
    '### Consideraciones técnico-accidentológicas',
    '',
    paragraph(data.conclusion.consideraciones_tecnicas),
    '',
    '### Conclusión pericial',
    '',
    paragraph(data.conclusion.conclusion_pericial),
    '',
    paragraph(data.conclusion.parrafo_remision_ingenieria_vial),
    '',
    '---',
    '',
    'OFL Mayor LIONEL ZURITA LP 11500  ',
    'Técnico Superior en Criminalística - Especialista en Accidentología Vial  ',
    'POLICÍA DE LA CIUDAD DE BUENOS AIRES'
  ].join('\n');
}

function setStatus(message, kind = '') {
  statusBox.textContent = message;
  statusBox.className = `status ${kind}`.trim();
}

function clearGenerated() {
  reportText = '';
  currentJson = null;
  preview.textContent = 'La vista previa aparecerá aquí después de validar un JSON.';
  downloadJsonButton.disabled = true;
  downloadReportButton.disabled = true;
  copyButton.disabled = true;
}

function download(filename, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

validateButton.addEventListener('click', () => {
  errorsList.replaceChildren();
  clearGenerated();
  if (!schema) {
    setStatus('No se pudo cargar el esquema JSON. Ejecutá el servidor desde la carpeta raíz del proyecto.', 'error');
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonInput.value);
  } catch (error) {
    setStatus(`El contenido no es JSON válido: ${error.message}`, 'error');
    return;
  }
  const errors = [];
  validateNode(parsed, schema, '$', errors);
  if (errors.length) {
    errors.forEach((message) => {
      const li = document.createElement('li');
      li.textContent = message;
      errorsList.append(li);
    });
    setStatus(`Se encontraron ${errors.length} problema(s) de estructura. Corregí los campos indicados.`, 'error');
    return;
  }
  currentJson = parsed;
  reportText = buildReport(parsed);
  preview.textContent = reportText;
  downloadJsonButton.disabled = false;
  downloadReportButton.disabled = false;
  copyButton.disabled = false;
  setStatus('JSON válido según el esquema. Vista previa generada; revisá el contenido antes de usarlo.', 'success');
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  try {
    jsonInput.value = await file.text();
    errorsList.replaceChildren();
    clearGenerated();
    setStatus(`Archivo cargado: ${file.name}. Ahora validalo para generar la vista previa.`);
  } catch {
    setStatus('No se pudo leer el archivo seleccionado.', 'error');
  }
});

document.querySelector('#load-example').addEventListener('click', async () => {
  try {
    const response = await fetch('../data/ejemplo_pericia.json');
    if (!response.ok) throw new Error('No se pudo encontrar el archivo de ejemplo.');
    jsonInput.value = JSON.stringify(await response.json(), null, 2);
    errorsList.replaceChildren();
    clearGenerated();
    setStatus('Ejemplo cargado. Presioná “Validar y generar vista previa” para probarlo.');
  } catch (error) {
    setStatus(`${error.message} Asegurate de iniciar el servidor desde la carpeta raíz.`, 'error');
  }
});

document.querySelector('#format-json').addEventListener('click', () => {
  try {
    jsonInput.value = JSON.stringify(JSON.parse(jsonInput.value), null, 2);
    setStatus('JSON ordenado. Validalo para actualizar la vista previa.', 'success');
  } catch (error) {
    setStatus(`No se puede ordenar: ${error.message}`, 'error');
  }
});

downloadJsonButton.addEventListener('click', () => {
  if (currentJson) download(`${safeFilename(currentJson.encabezado.numero_informe)}.json`, `${JSON.stringify(currentJson, null, 2)}\n`, 'application/json');
});
downloadReportButton.addEventListener('click', () => {
  if (reportText) download(`${safeFilename(currentJson?.encabezado?.numero_informe)}.md`, `${reportText}\n`, 'text/markdown;charset=utf-8');
});
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(reportText);
    setStatus('Informe copiado al portapapeles.', 'success');
  } catch {
    setStatus('No se pudo acceder al portapapeles. Seleccioná y copiá el texto de la vista previa.', 'error');
  }
});

fetch('../data/schema_pericia.json')
  .then((response) => {
    if (!response.ok) throw new Error('No se encontró data/schema_pericia.json.');
    return response.json();
  })
  .then((loadedSchema) => {
    schema = loadedSchema;
    setStatus('Esquema cargado. Importá un archivo JSON o pegá su contenido para comenzar.');
  })
  .catch((error) => setStatus(`${error.message} Iniciá el servidor desde la carpeta raíz del proyecto.`, 'error'));
