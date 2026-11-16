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

const defaultSchema = {
  type: 'object',
  properties: {
    encabezado: {
      type: 'object',
      properties: {
        numero_informe: { type: 'string' },
        fecha_texto: { type: 'string' },
        sumario: { type: 'string' },
        comisaria_vecinal: { type: 'string' },
        caratula: { type: 'string' },
        fiscalia: { type: 'string' },
        parrafo_introductorio: { type: 'string' }
      },
      required: ['numero_informe', 'fecha_texto', 'sumario', 'comisaria_vecinal', 'caratula', 'fiscalia', 'parrafo_introductorio']
    },
    lugar_relevamiento: { type: 'string' },
    elementos_estudio: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          orden: { type: 'integer' },
          tipo_rodado: { type: 'string' },
          marca: { type: 'string' },
          modelo: { type: 'string' },
          dominio: { type: 'string' },
          descripcion_lista: { type: 'string' }
        },
        required: ['orden', 'tipo_rodado', 'marca', 'modelo', 'dominio', 'descripcion_lista']
      }
    },
    tareas_periciales: {
      type: 'object',
      properties: {
        intervencion_y_consigna: {
          type: 'object',
          properties: {
            hora_arribo: { type: 'string' },
            efectivo_consigna: {
              type: 'object',
              properties: {
                jerarquia: { type: 'string' },
                nombre_completo: { type: 'string' },
                legajo: { type: 'string' }
              },
              required: ['jerarquia', 'nombre_completo', 'legajo']
            },
            relato_comision: { type: 'string' }
          },
          required: ['hora_arribo', 'efectivo_consigna', 'relato_comision']
        },
        inspeccion_ocular: {
          type: 'object',
          properties: {
            tipo_arteria_y_sentido: { type: 'string' },
            superficie_calzada: { type: 'string' },
            estado_calzada: { type: 'string' },
            iluminacion_y_visibilidad: { type: 'string' },
            senalizacion_vial: { type: 'string' },
            escena_removida: { type: 'boolean' },
            descripcion_integral: { type: 'string' }
          },
          required: ['tipo_arteria_y_sentido', 'superficie_calzada', 'estado_calzada', 'iluminacion_y_visibilidad', 'senalizacion_vial', 'escena_removida', 'descripcion_integral']
        },
        relevamiento_planimetrico_y_rastros: {
          type: 'object',
          properties: {
            hay_vestigios: { type: 'boolean' },
            mediciones_y_referencias: { type: 'string' },
            detalle_rastros: { type: 'array', items: { type: 'string' } },
            observacion_sin_rastros: { type: 'string' }
          },
          required: ['hay_vestigios', 'mediciones_y_referencias', 'detalle_rastros', 'observacion_sin_rastros']
        },
        fijacion_fotografica: {
          type: 'object',
          properties: {
            descripcion_diligencia: { type: 'string' }
          },
          required: ['descripcion_diligencia']
        },
        examen_tecnico_vehicular: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              orden: { type: 'integer' },
              identificacion_corta: { type: 'string' },
              posicion_final: { type: 'string' },
              descripcion_danos: { type: 'string' },
              sistemas_seguridad: { type: 'string' }
            },
            required: ['orden', 'identificacion_corta', 'posicion_final', 'descripcion_danos', 'sistemas_seguridad']
          }
        }
      },
      required: ['intervencion_y_consigna', 'inspeccion_ocular', 'relevamiento_planimetrico_y_rastros', 'fijacion_fotografica', 'examen_tecnico_vehicular']
    },
    conclusion: {
      type: 'object',
      properties: {
        consideraciones_tecnicas: { type: 'string' },
        conclusion_pericial: { type: 'string' },
        parrafo_remision_ingenieria_vial: { type: 'string' }
      },
      required: ['consideraciones_tecnicas', 'conclusion_pericial', 'parrafo_remision_ingenieria_vial']
    }
  },
  required: ['encabezado', 'lugar_relevamiento', 'elementos_estudio', 'tareas_periciales', 'conclusion']
};

const defaultExample = {
  encabezado: {
    numero_informe: '7961/2026',
    fecha_texto: 'Ciudad Autónoma de Buenos Aires, 15 de Noviembre del 2026.',
    sumario: '720491/2026',
    comisaria_vecinal: 'Comisaría Vecinal 12A',
    caratula: 'LESIONES CULPOSAS ART. 94 C.P.N.',
    fiscalia: 'UFLA NORTE',
    parrafo_introductorio: 'En la ciudad de Buenos Aires, se realizó la inspección técnica de los elementos involucrados en el hecho, bajo intervención del perito actuante, en el marco del sumario 720491/2026, carátula lesiones culposas art. 94 C.P.N., correspondiente a la fiscalía UFLA Norte. Se inspeccionaron dos rodados: un automotor marca Renault, modelo Logan, dominio ABC123, y un motociclo marca Honda, modelo Wave, dominio XYZ456.'
  },
  lugar_relevamiento: 'Av. Medrano y Guardia Vieja, Ciudad Autónoma de Buenos Aires',
  elementos_estudio: [
    {
      orden: 1,
      tipo_rodado: 'Automóvil',
      marca: 'Renault',
      modelo: 'Logan',
      dominio: 'ABC123',
      descripcion_lista: 'Vehículo 1: automotor Renault Logan, dominio ABC123, involucrado en el hecho.'
    },
    {
      orden: 2,
      tipo_rodado: 'Motovehículo',
      marca: 'Honda',
      modelo: 'Wave',
      dominio: 'XYZ456',
      descripcion_lista: 'Vehículo 2: motocicleta Honda Wave, dominio XYZ456, involucrada en el hecho.'
    }
  ],
  tareas_periciales: {
    intervencion_y_consigna: {
      hora_arribo: '07:03',
      efectivo_consigna: {
        jerarquia: 'Oficial',
        nombre_completo: 'María del Carmen Gómez',
        legajo: 'LP 54213'
      },
      relato_comision: 'Se recibió la comisión de Sala de Situación a las 06:50 y se arribó al lugar del hecho a las 07:03 hs. Se tomó contacto con el efectivo de consigna, quien informó la presencia de dos unidades y la escena aún sin alteración significativa.'
    },
    inspeccion_ocular: {
      tipo_arteria_y_sentido: 'Avenida de doble sentido con separador central.',
      superficie_calzada: 'Asfáltica',
      estado_calzada: 'Seca',
      iluminacion_y_visibilidad: 'Natural diurna y visibilidad óptima.',
      senalizacion_vial: 'Señalización horizontal y vertical vigente.',
      escena_removida: false,
      descripcion_integral: 'Se constató una arteria de circulación de doble sentido con calzada asfáltica seca y en buen estado. La visibilidad era adecuada y la señalización era visible. La escena se encontraba en condiciones aptas para la observación de huellas y daños.'
    },
    relevamiento_planimetrico_y_rastros: {
      hay_vestigios: true,
      mediciones_y_referencias: 'Se registraron marcas de frenado y roce hacia el costado derecho del automotor, con referencia a la línea de edificación del sobreancho de la avenida.',
      detalle_rastros: [
        'Se observaron huellas de frenado del automóvil con desprendimiento de material de fricción sobre la calzada.',
        'Se documentó roce abrasivo sobre el costado derecho del vehículo y marcado de transferencia de materia en la estructura.'
      ],
      observacion_sin_rastros: 'No se observaron vestigios incompatibles con la maniobra documentada.'
    },
    fijacion_fotografica: {
      descripcion_diligencia: 'Se realizaron fotografías generales del lugar, detalle de marcas y daños, y tomas métricas de referencia con presencia del efectivo de consigna.'
    },
    examen_tecnico_vehicular: [
      {
        orden: 1,
        identificacion_corta: 'Renault Logan - ABC123',
        posicion_final: 'Vehículo estacionado sobre el costado derecho de la calzada, con orientación hacia el sur.',
        descripcion_danos: 'Daño de compresión en la zona del paragolpes delantero y costado derecho; deformación plástica por impacto desde la zona delantera hacia el costado.',
        sistemas_seguridad: 'Frenos, dirección, luces y neumáticos sin observaciones relevantes. No se verificaron airbags por ausencia de clave de encendido.'
      },
      {
        orden: 2,
        identificacion_corta: 'Honda Wave - XYZ456',
        posicion_final: 'Motocicleta con apoyos sobre la calzada, con orientación y derrape hacia el costado izquierdo.',
        descripcion_danos: 'Daño estructural y abrasivo sobre el frente, con deformación localizada en el manubrio y guardabarros delantero.',
        sistemas_seguridad: 'Sin evidencia de incendio ni bloqueo. Estado de luces y frenos verificable en inspección estática, sin signos de deficiencia.'
      }
    ]
  },
  conclusion: {
    consideraciones_tecnicas: 'Los daños y los rastros observados son compatibles con una colisión de alcance secuencial y roce lateral, sin que los datos relevados permitan atribuir responsabilidades legales ni definir embestidor o embestido.',
    conclusion_pericial: 'La secuencia de daños, marcas, posición final y rastros es compatible con un impacto de baja energía en el sector delantero y lateral derecho del automotor y frontal del motociclista, configurando una dinámica de colisión con alcance sucesivo.',
    parrafo_remision_ingenieria_vial: 'Si se requiriera determinar velocidades, reconstrucción cinemática o análisis más preciso de la secuencia de colisión, se sugiere la remisión a la División Ingeniería Vial, ingenieriavialcaba@gmail.com, Av. Ramón Castillo 1720, 9° piso, CABA.'
  }
};

const text = (value) => typeof value === 'string' && value.trim() ? value.trim() : '[Completar]';
const paragraph = (value) => text(value).replace(/\r?\n/g, '\n\n');
const safeFilename = (value) => String(value || 'informe').replace(/[^a-zA-Z0-9_-]+/g, '_');

function validateNode(value, rule, path, errors) {
  if (!rule || typeof rule !== 'object') return;

  if (rule.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of rule.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(`${path}.${key}: campo obligatorio ausente.`);
      }
    }
    for (const [key, childRule] of Object.entries(rule.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateNode(value[key], childRule, `${path}.${key}`, errors);
      }
    }
    return;
  }

  if (rule.type === 'array' && Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      if (rule.items) validateNode(item, rule.items, `${path}[${index}]`, errors);
    }
    return;
  }

  const actual = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  const valid =
    rule.type === 'integer'
      ? Number.isInteger(value)
      : rule.type === 'object'
        ? actual === 'object' && !Array.isArray(value)
        : rule.type === 'array'
          ? Array.isArray(value)
          : rule.type === 'boolean'
            ? actual === 'boolean'
            : rule.type === 'string'
              ? actual === 'string'
              : actual === rule.type;

  if (!valid) {
    errors.push(`${path}: se esperaba ${rule.type} y se recibió ${actual}.`);
  }
}

function list(items) {
  return items.length ? items.map((item) => `- ${paragraph(item)}`).join('\n') : '- [Sin datos consignados]';
}

function buildReport(data) {
  const h = data.encabezado || {};
  const tasks = data.tareas_periciales || {};
  const call = tasks.intervencion_y_consigna || {};
  const officer = call.efectivo_consigna || {};
  const scene = tasks.inspeccion_ocular || {};
  const traces = tasks.relevamiento_planimetrico_y_rastros || {};
  const exam = Array.isArray(tasks.examen_tecnico_vehicular) ? tasks.examen_tecnico_vehicular : [];
  const vehicles = Array.isArray(data.elementos_estudio) && data.elementos_estudio.length
    ? data.elementos_estudio.map((vehicle) => `- **Vehículo ${vehicle.orden}:** ${paragraph(vehicle.descripcion_lista)}`).join('\n')
    : '- [Sin elementos consignados]';

  const inspections = exam.length
    ? exam.map((vehicle) => `#### Unidad ${vehicle.orden}: ${paragraph(vehicle.identificacion_corta)}\n\n- **Posición final:** ${paragraph(vehicle.posicion_final)}\n- **Daños:** ${paragraph(vehicle.descripcion_danos)}\n- **Sistemas de seguridad:** ${paragraph(vehicle.sistemas_seguridad)}`).join('\n\n')
    : '[Sin examen vehicular consignado]';

  const tracesText = Array.isArray(traces.detalle_rastros) && traces.detalle_rastros.length
    ? list(traces.detalle_rastros)
    : `- ${paragraph(traces.observacion_sin_rastros || 'Sin observación de rastros consignada.')}`;

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
    `**${paragraph(h.fecha_texto || '[Completar]')}**`,
    '',
    `# INFORME TÉCNICO N° ${paragraph(h.numero_informe || '[Completar]')}.`,
    '',
    paragraph(h.parrafo_introductorio || '[Completar]'),
    '',
    '## OBJETOS DE LA INSPECCIÓN',
    '',
    'Se efectuó la inspección técnica de los elementos ofrecidos para estudio y el relevamiento del escenario y de los vestigios consignados, con fijación fotográfica según lo informado. La ubicación de los daños se describe desde la posición del conductor, de atrás hacia adelante y de izquierda a derecha, cuando los datos aportados permiten precisarla.',
    '',
    '## ELEMENTOS OFRECIDOS PARA ESTUDIO',
    '',
    `- **Sumario:** ${paragraph(h.sumario || '[Completar]')}`,
    `- **Comisaría Vecinal:** ${paragraph(h.comisaria_vecinal || '[Completar]')}`,
    `- **Carátula:** ${paragraph(h.caratula || '[Completar]')}`,
    `- **Fiscalía:** ${paragraph(h.fiscalia || '[Completar]')}`,
    vehicles,
    `- **Lugar del relevamiento:** ${paragraph(data.lugar_relevamiento || '[Completar]')}`,
    '',
    '## DILIGENCIAS PRACTICADAS',
    '',
    '### Intervención y consigna',
    '',
    `Arribo: ${paragraph(call.hora_arribo || '[Completar]')}. ${paragraph(call.relato_comision || '[Completar]')}`,
    `Efectivo de consigna: ${paragraph(officer.jerarquia || '[Completar]')}, ${paragraph(officer.nombre_completo || '[Completar]')}, LP ${paragraph(officer.legajo || '[Completar]')}.`,
    '',
    '### Inspección ocular del escenario e infraestructura vial',
    '',
    paragraph(scene.descripcion_integral || '[Completar]'),
    '',
    `- **Tipo de arteria y sentido:** ${paragraph(scene.tipo_arteria_y_sentido || '[Completar]')}`,
    `- **Superficie y estado de calzada:** ${paragraph(scene.superficie_calzada || '[Completar]')}; ${paragraph(scene.estado_calzada || '[Completar]')}.`,
    `- **Iluminación y visibilidad:** ${paragraph(scene.iluminacion_y_visibilidad || '[Completar]')}`,
    `- **Señalización vial:** ${paragraph(scene.senalizacion_vial || '[Completar]')}`,
    `- **Preservación:** ${sceneStatus}`,
    '',
    '### Relevamiento planimétrico y de rastros',
    '',
    `${vestigeStatus} ${paragraph(traces.mediciones_y_referencias || '[Completar]')}`,
    '',
    tracesText,
    '',
    '### Fijación fotográfica',
    '',
    paragraph(tasks.fijacion_fotografica?.descripcion_diligencia || '[Completar]'),
    '',
    '### Posición final y examen técnico analítico de las unidades',
    '',
    inspections,
    '',
    '## CONCLUSIÓN',
    '',
    '### Consideraciones técnico-accidentológicas',
    '',
    paragraph(data.conclusion?.consideraciones_tecnicas || '[Completar]'),
    '',
    '### Conclusión pericial',
    '',
    paragraph(data.conclusion?.conclusion_pericial || '[Completar]'),
    '',
    paragraph(data.conclusion?.parrafo_remision_ingenieria_vial || 'Si se requiriera determinar velocidades o reconstrucción cinemática, debe remitirse a la División Ingeniería Vial.'),
    '',
    '---',
    '',
    'OFL Mayor LIONEL ZURITA LP 11500',
    'Técnico Superior en Criminalística - Especialista en Accidentología Vial',
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

function bootstrap() {
  schema = defaultSchema;
  jsonInput.value = JSON.stringify(defaultExample, null, 2);
  setStatus('Esquema listo. Podés validar el ejemplo o cargar tu JSON.');
}

validateButton.addEventListener('click', () => {
  errorsList.replaceChildren();
  clearGenerated();

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

document.querySelector('#load-example').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(defaultExample, null, 2);
  errorsList.replaceChildren();
  clearGenerated();
  setStatus('Ejemplo cargado en el editor. Presioná “Validar y generar vista previa”.');
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
  if (currentJson) {
    download(`${safeFilename(currentJson.encabezado?.numero_informe || 'informe')}.json`, `${JSON.stringify(currentJson, null, 2)}\n`, 'application/json');
  }
});

downloadReportButton.addEventListener('click', () => {
  if (reportText) {
    download(`${safeFilename(currentJson?.encabezado?.numero_informe || 'informe')}.md`, `${reportText}\n`, 'text/markdown;charset=utf-8');
  }
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(reportText);
    setStatus('Informe copiado al portapapeles.', 'success');
  } catch {
    setStatus('No se pudo acceder al portapapeles. Seleccioná y copiá el texto de la vista previa.', 'error');
  }
});

bootstrap();
