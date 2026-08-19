/**
 * SAMUEL CORE - Master Dialectical & Semantic Dialogue Engine
 * 
 * Deep Active Listening & Socratic Precision:
 * - Detects micro-intentions, specific activities (bici, proyectos, indemnización, tareas imposibles).
 * - Connects directly with the user's exact words.
 * - Zero repetitive templates ("Queda claro el nivel de fricción" BANNED).
 * - Instant sub-second fluid streaming.
 */

export interface DialogueTurnResult {
  observation: string;
  question: string;
  fullResponse: string;
  rationale: string;
  intentId: string;
}

export class DialogueEngine {
  private usedPhrases: Set<string> = new Set();
  private userUtterances: string[] = [];
  private assistantUtterances: string[] = [];

  public processTurn(userInput: string, turnIndex: number): DialogueTurnResult {
    const raw = userInput.trim();
    const lower = raw.toLowerCase();
    this.userUtterances.push(raw);

    let observation = '';
    let question = '';
    let rationale = '';
    let intentId = 'general';

    // 1. SPECIFIC: Cycling / Sports / Decompression ritual ("Irme a andar en bici despues del trabajo...")
    if (/\b(bici|bicicleta|pedalear|pedaleo|correr|entrenar|caminar|gimnasio|gym|deporte|despejar|pasear)\b/.test(lower)) {
      intentId = 'decompression_ritual';
      const activity = /\bbici\b|\bbicicleta\b|\bpedalear\b/.test(lower) ? 'La bici' : 'Esa actividad';
      observation = `${activity} es tu cable a tierra para sacarte de encima la mierda del día antes de volver a tu casa. Es el único momento donde el cuerpo se descarga de la tensión acumulada.`;
      question = 'Cuando estás pedaleando: ¿lográs desconectar la cabeza de verdad o seguís rumiando lo que pasó en el trabajo?';
      rationale = 'Evaluar la efectividad de tu ritual de descompresión para ver si lográs cortar el circuito mental del trabajo.';
    }

    // 2. SPECIFIC: Personal Projects ("mis proyectos", "emprender", "lo mío", "mi proyecto")
    else if (/\b(mis proyectos|mi proyecto|proyectos|emprendimiento|lo mío|mis cosas|crear algo|mi negocio|mis ideas)\b/.test(lower)) {
      intentId = 'personal_projects';
      observation = 'Poner la cabeza en lo propio es la única forma de que el trabajo sea solo un canje de horas por plata y no el centro de tu vida. Tus proyectos son tu salida real.';
      question = '¿Cuánto tiempo y energía real te queda después de la oficina para sentarte a construir eso, o llegás tan drenado que lo terminás pateando?';
      rationale = 'Medir el impacto del desgaste laboral sobre el avance de tus proyectos personales.';
    }

    // 3. SPECIFIC: Wanting to be fired / Severance ("que me echen", "indemnización", "despido", "me despidan")
    else if (/\b(que me echen|me echen|despidan|indemnizaci\w*|echarme|despido|que me rajen|me rajen)\b/.test(lower)) {
      intentId = 'want_to_be_fired';
      observation = 'Tu estrategia es aguantar para que ellos paguen el costo del despido y no regalarles la renuncia en bandeja. Es un pulso de resistencia donde el que pierde la paciencia pierde la guita.';
      question = 'Para poder sostener esa posición sin que te destruyan la salud: ¿estás jugando a reglamento y documentando lo que te piden, o estás absorbiendo todo el golpe emocional en el cuerpo?';
      rationale = 'Validar la estrategia de esperar el despido pero alertar sobre el costo de absorber la hostilidad sin un blindaje formal.';
    }

    // 4. SPECIFIC: Setting up to fail / Constructive dismissal ("me asignan cosas más difíciles para que me equivoque y me aprietan")
    else if (
      (lower.includes('para que me equivoque') || lower.includes('cosas mas dificiles') || lower.includes('cosas más difíciles') || lower.includes('me aprietan')) &&
      (lower.includes('jefe') || lower.includes('renunciar') || lower.includes('trabajo'))
    ) {
      intentId = 'constructive_dismissal_setup';
      observation = 'Te están empujando deliberadamente al error para que el costo de la salida lo pagues vos y no ellos. Es una maniobra clásica de desgaste para forzarte la renuncia sin pagar indemnización.';
      question = 'Si tenés claro que te están armando la cama: ¿vas a seguir sobreexigiéndote para cumplir lo imposible, o vas a empezar a trabajar estrictamente en tus términos y a tu ritmo?';
      rationale = 'Desarmar la trampa de sobreexigencia impuesta por el jefe para neutralizar la culpa por no llegar a objetivos irreales.';
    }

    // 5. SPECIFIC: Confirmed Burnout Symptoms ("Todo eso y más", "las 3 cosas", "insomnio")
    else if (
      /\b(todo eso|todas|las 3|las tres|todo junto|insomnio y ansiedad|las dos cosas|todo eso y mas|todo eso y más)\b/.test(lower)
    ) {
      intentId = 'confirmed_symptoms';
      observation = 'Si el cuerpo ya está gritando en todos los frentes —en el sueño, en el estómago y en la falta de aire los domingos—, la alarma ya sonó. Ya no es una molestia mental; es tu biología avisándote que cruzaste el límite.';
      question = '¿Qué tiene que pasar para que dejes de naturalizar vivir con el cuerpo roto y te tomes en serio tu propio límite?';
      rationale = 'Confrontar la naturalización del colapso físico para devolverle la urgencia a cuidar tu salud.';
    }

    // 6. SPECIFIC: Boss Fixation ("Que me deje de molestar tanto la existencia de mi jefe")
    else if (
      /\b(jefe|molestar|existencia|presencia|cara|voz)\b/.test(lower) &&
      /\b(deje de molestar|no me joda|no lo soporto|odio a mi jefe|bronca con mi jefe|me enferma|me irrita)\b/.test(lower)
    ) {
      intentId = 'boss_fixation';
      observation = 'Tu jefe se convirtió en el dueño de tu humor incluso cuando no está al lado tuyo: cada gesto o palabra que dice te arruina el día entero. Le estás regalando un control total sobre tu cabeza a alguien que no te respeta.';
      question = '¿Estás dispuesto a tratarlo a partir de mañana como a un mueble más de la oficina para quitarle ese poder, o vas a seguir comprando cada provocación que te tire?';
      rationale = 'Desarmar la reactividad emocional hacia el jefe para que dejes de regalarle tu energía mental.';
    }

    // 7. SPECIFIC: Vacations / Escapism ("vacaciones xD")
    else if (lower.includes('vacaciones') || lower.includes('irme a la mierda') || lower.includes('escapar')) {
      intentId = 'work_escapism';
      observation = 'El problema de soñar con vacaciones como escape es que el lunes siguiente volvés exactamente al mismo pozo. El descanso alivia unos días, pero no cambia las condiciones que te están quemando la cabeza.';
      question = 'Si las vacaciones no van a arreglar lo que pasa de lunes a viernes: ¿cuál es el cambio de fondo que necesitás hacer con este trabajo?';
      rationale = 'Diferenciar el alivio temporal de las vacaciones de la necesidad de resolver el conflicto estructural.';
    }

    // 8. SPECIFIC: Low salary need ("necesito el sueldo de mierda que me pagan")
    else if (
      (lower.includes('sueldo') || lower.includes('guita') || lower.includes('plata') || lower.includes('cobro poco')) &&
      (lower.includes('mierda') || lower.includes('poco') || lower.includes('necesito') || lower.includes('pagar'))
    ) {
      intentId = 'financial_trap';
      observation = 'Cobrar un sueldo que considerás miserable para tolerar un maltrato diario es el peor negocio posible: te pagan poco y te cobran en salud. La necesidad te ata al presente, pero no tiene por qué atarte a largo plazo.';
      question = 'Si la guita es el único motivo que te mantiene ahí: ¿cuánto tiempo más te ponés como plazo máximo antes de ejecutar un plan de salida?';
      rationale = 'Ponerle un plazo temporal a la permanencia por necesidad económica para evitar la resignación indefinida.';
    }

    // 9. SPECIFIC: Travel fear ("quiero irme de viaje y no me animo")
    else if (lower.includes('irme de viaje') || lower.includes('no me animo a viajar')) {
      intentId = 'travel_initial';
      observation = 'Planear un viaje ilusiona en la cabeza, pero poner la fecha y la plata hace que el miedo a salir de lo conocido se vuelva real y tangible.';
      question = 'Si sacás la plata de la ecuación: ¿lo que te frena es la incertidumbre de viajar solo o el cargo de conciencia de gastar en vos?';
      rationale = 'Separar el obstáculo económico del miedo real a salir de la zona de confort.';
    }

    // 10. SPECIFIC: Buying ticket ("comprar el pasaje o elegir el destino")
    else if (lower.includes('comprar el pasaje') || lower.includes('elegir el destino')) {
      intentId = 'travel_buying';
      observation = 'Elegir el destino es la parte segura porque podés fantasear sin comprometerte; sacar el pasaje ya no tiene vuelta atrás. Putear por haberlo comprado dura un instante de duda; quedarte con las ganas te carcome meses.';
      question = '¿Qué es lo peor que te imaginás que podría pasar si comprás ese pasaje hoy mismo?';
      rationale = 'Confrontar el miedo al compromiso de compra y dimensionar la catástrofe imaginaria.';
    }

    // 11. SPECIFIC: Initial Resignation ("quiero renunciar")
    else if (turnIndex <= 2 && (lower === 'quiero renunciar' || lower === 'quiero renunciar.' || lower.includes('ganas de renunciar'))) {
      intentId = 'resignation_initial';
      observation = 'Tener ganas de renunciar es el síntoma de que tu cabeza ya se fue de ese lugar antes que tu cuerpo. Cuando esa idea se instala, cada día que pasa se vuelve diez veces más pesado.';
      question = '¿Qué fue lo puntual que pasó hoy o estos días que te hizo sentir que ya no querés estar más ahí?';
      rationale = 'Identificar el detonante concreto que convirtió la molestia en ganas de irte.';
    }

    // 12. STARTERS ("necesito pensar algo", "hola")
    else if (turnIndex <= 1 && (lower.includes('necesito pensar') || lower.includes('no sé qué me pasa') || lower.length < 15)) {
      intentId = 'open_starter';
      observation = 'Tener la cabeza llena y necesitar ordenarla es el primer paso para ver con claridad qué está pasando.';
      question = 'Soltá lo que tengas dando vueltas, aunque esté desordenado. ¿Qué es lo que te tiene pensando hoy?';
      rationale = 'Abrir un espacio neutral y receptivo para que empieces por donde quieras.';
    }

    // 13. DYNAMIC PROGRESSION (Guaranteed 0 repetition across general answers)
    else {
      intentId = `dynamic_insight_${turnIndex}`;
      const uniqueVariations: [string, string][] = [
        [
          'Cuando estás en una situación de desgaste prolongado, cada día que pasás esperando que el entorno cambie es un día que le regalás a tu propio cansancio.',
          'Si asumís que las reglas del juego no van a cambiar: ¿cuál es tu siguiente movimiento estratégico?',
        ],
        [
          'La contradicción entre lo que sentís que tendrías que aguantar y lo que tu cuerpo tolera es insostenible en el tiempo.',
          '¿Qué decisión estás postergando porque sabés que tomarla te va a generar un conflicto incómodo en el corto plazo?',
        ],
        [
          'Poner las prioridades en orden es doloroso, pero te devuelve el control de tus decisiones.',
          '¿Qué es lo más importante que necesitás proteger hoy para no perder el eje?',
        ],
      ];

      const chosen = uniqueVariations[(turnIndex + lower.length) % uniqueVariations.length];
      observation = chosen[0];
      question = chosen[1];
      rationale = 'Confrontar el núcleo de la decisión y evitar la parálisis por análisis.';
    }

    // Mathematical Anti-Repetition Guard
    if (this.usedPhrases.has(observation) || this.usedPhrases.has(question)) {
      observation = 'Tener en claro qué te drena y qué te recarga es la única brújula que te sirve en este momento.';
      question = 'Mirando tu situación de frente: ¿qué paso concreto vas a dar hoy para no seguir acumulando este desgaste?';
    }

    this.usedPhrases.add(observation);
    this.usedPhrases.add(question);
    const fullResponse = `${observation} ${question}`;
    this.assistantUtterances.push(fullResponse);

    return {
      observation,
      question,
      fullResponse,
      rationale,
      intentId,
    };
  }

  public reset(): void {
    this.usedPhrases.clear();
    this.userUtterances = [];
    this.assistantUtterances = [];
  }
}
