import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: '3.4',
    topicTitle: 'Tema 3.4: Propagación y Modos',
    question: '¿Cuál es la razón física y matemática por la cual el modo TEM no puede existir dentro de una guía de onda metálica hueca de un solo conductor?',
    mathExplanation: '\\nabla_t^2 \\Phi = 0 \\quad \\text{con } \\Phi = \\text{cte en la frontera} \\implies \\vec{E}_t = -\\nabla_t \\Phi = 0',
    options: [
      'Porque el campo magnético en el modo TEM viaja más rápido que la luz dentro del metal y se anula por la ley de Lenz.',
      'Porque la ecuación de Laplace para el potencial electrostático en una frontera equipotencial cerrada única obliga a que el potencial sea uniforme en todo el interior, anulando el campo eléctrico transversal.',
      'Porque las guías de onda rectangulares no permiten reflexiones con ángulos menores a 45 grados en las paredes conductoras.',
      'Porque la permitividad del aire en el interior absorbe la componente longitudinal obligatoria del modo TEM.'
    ],
    correctIndex: 1,
    rationale: 'Para el modo TEM (Ez = Hz = 0), los campos transversales satisfacen la ecuación de Laplace ∇²Φ = 0. Al ser una pared metálica cerrada continua, todo el perímetro está al mismo potencial electrostático Φ₀. Por el teorema del valor extremo de funciones armónicas, Φ debe ser constante en toda la sección transversal, por lo que E_t = -∇Φ = 0. No puede haber campo TEM en un conductor único.'
  },
  {
    id: 2,
    topic: '3.4',
    topicTitle: 'Tema 3.4: Propagación y Modos',
    question: 'Para una guía de onda rectangular con ancho a y alto b (donde a > b), ¿cuál es el modo dominante y cuál es su frecuencia de corte?',
    mathExplanation: 'f_{c,10} = \\frac{u}{2a} = \\frac{c}{2a\\sqrt{\\mu_r \\epsilon_r}}',
    options: [
      'El modo TE₁₀, con frecuencia de corte fc = u / (2a)',
      'El modo TM₁₀, con frecuencia de corte fc = u / (2a)',
      'El modo TE₀₁, con frecuencia de corte fc = u / (2b)',
      'El modo TM₁₁, con frecuencia de corte fc = (u/2) * sqrt(1/a² + 1/b²)'
    ],
    correctIndex: 0,
    rationale: 'El modo con menor frecuencia de corte cuando a > b es el TE₁₀ (m=1, n=0), cuya frecuencia de corte depende exclusivamente del ancho mayor a. Nótese que el modo TM₁₀ no puede existir porque para modos TM tanto m como n deben ser ≥ 1.'
  },
  {
    id: 3,
    topic: '3.4',
    topicTitle: 'Tema 3.4: Propagación y Modos',
    question: 'En una guía de onda rectangular de dimensiones a y b, ¿cuál de las siguientes parejas de modos son degenerados (tienen idéntica frecuencia de corte para cualquier relación a y b)?',
    mathExplanation: 'f_{c,mn} = \\frac{u}{2} \\sqrt{\\left(\\frac{m}{a}\\right)^2 + \\left(\\frac{n}{b}\\right)^2}',
    options: [
      'TE₁₀ y TM₁₀',
      'TE₂₀ y TE₀₁ siempre, sin importar a y b',
      'TE₁₁ y TM₁₁',
      'TM₁₁ y TM₂₁'
    ],
    correctIndex: 2,
    rationale: 'Tanto para modos TE_mn como TM_mn, la frecuencia de corte fc depende de m y n mediante la misma fórmula cuadrática. Por lo tanto, para m=1 y n=1, TE₁₁ y TM₁₁ comparten exactamente la misma frecuencia de corte, siendo modos degenerados.'
  },
  {
    id: 4,
    topic: '3.4',
    topicTitle: 'Tema 3.4: Propagación y Modos',
    question: '¿Qué le ocurre a la longitud de onda guiada λg cuando la frecuencia de excitación f desciende y se aproxima a la frecuencia de corte fc (f → fc⁺)?',
    mathExplanation: '\\lambda_g = \\frac{\\lambda}{\\sqrt{1 - (f_c/f)^2}}',
    options: [
      'Tiende a cero (λg → 0), concentrando toda la energía en un solo punto.',
      'Permanece constante e igual a la longitud de onda de espacio libre λ.',
      'Se vuelve un número puramente imaginario y negativo.',
      'Tiende a infinito (λg → ∞), indicando que la onda ya no oscila longitudinalmente en fase espacial.'
    ],
    correctIndex: 3,
    rationale: 'Al tender f → fc⁺, el término del radicando 1 - (fc/f)² se acerca a 0, haciendo que el denominador se anule y λg tienda a infinito. La constante de fase β tiende a 0, lo que significa que las superficies de fase constante se vuelven paralelas al eje de la guía.'
  },
  {
    id: 5,
    topic: '3.4',
    topicTitle: 'Tema 3.4: Propagación y Modos',
    question: '¿Cuál es la relación matemática y física fundamental entre la velocidad de fase (vp) y la velocidad de grupo (vg) en una guía de onda sin pérdidas?',
    mathExplanation: 'v_p \\cdot v_g = u^2 \\quad (v_p > u, \\; v_g < u)',
    options: [
      'vp + vg = 2c, sumando siempre el doble de la velocidad en el vacío',
      'vp · vg = u², donde vp > u y vg < u (u = velocidad en el dieléctrico ilimitado)',
      'vp / vg = fc / f, donde ambas son siempre mayores que c',
      'vp = vg = u en todo el rango de frecuencias de operación'
    ],
    correctIndex: 1,
    rationale: 'La velocidad de fase es vp = u / √(1 - (fc/f)²) > u (la velocidad aparente a la que viaja una cresta de fase en la pared metálica), mientras que la velocidad de transporte de energía es vg = u √(1 - (fc/f)²) < u. El producto vp · vg = u² garantiza que la energía y la información jamás superan la velocidad límite u.'
  },
  {
    id: 6,
    topic: '3.5',
    topicTitle: 'Tema 3.5: Potencia y Atenuación',
    question: '¿Cómo se comporta la impedancia de onda transversal Z_TE para modos eléctricos transversales cuando la frecuencia de operación f varía?',
    mathExplanation: 'Z_{TE} = \\frac{\\eta}{\\sqrt{1 - (f_c/f)^2}}',
    options: [
      'Es siempre mayor que la impedancia intrínseca del medio (Z_TE > η) y tiende a infinito en la frecuencia de corte (f → fc⁺).',
      'Es siempre menor que la impedancia intrínseca del medio (Z_TE < η) y tiende a cero en la frecuencia de corte.',
      'Permanece estrictamente constante e igual a 377 Ohms en todo momento.',
      'Disminuye linealmente a medida que la frecuencia f aumenta hacia el infinito.'
    ],
    correctIndex: 0,
    rationale: 'Para modos TE, Z_TE = η / √(1 - (fc/f)²). Como el radicando es menor a 1 para frecuencias de propagación (f > fc), Z_TE siempre es mayor que η. En el corte f = fc, Z_TE diverge a infinito; a frecuencias muy altas (f >> fc), Z_TE tiende asintóticamente a η.'
  },
  {
    id: 7,
    topic: '3.5',
    topicTitle: 'Tema 3.5: Potencia y Atenuación',
    question: '¿Por qué la constante de atenuación debida a pérdidas en el conductor (αc) se dispara hacia valores infinitos cuando f se acerca a la frecuencia de corte fc?',
    mathExplanation: '\\alpha_c \\propto \\frac{R_s}{\\eta \\sqrt{1 - (f_c/f)^2}}',
    options: [
      'Porque el dieléctrico del aire entra en ruptura dieléctrica espontánea al acercarse a fc.',
      'Porque la conductividad eléctrica del cobre σ disminuye a cero en la frecuencia de corte.',
      'Porque en el corte el ángulo de rebote de las ondas planas equivalentes incide a 90° respecto al eje z, provocando corrientes longitudinales y transversales de pared sumamente intensas.',
      'Porque la resistencia térmica de la guía impide la disipación convectiva.'
    ],
    correctIndex: 2,
    rationale: 'Cerca de fc, la onda viaja prácticamente rebotando de pared a pared transversalmente sin avanzar en z (ángulo de incidencia perpendicular al eje). Esto induce corrientes superficiales muy densas en las paredes metálicas que aumentan exponencialmente las pérdidas Joule por efecto Joule superficial.'
  },
  {
    id: 8,
    topic: '3.5',
    topicTitle: 'Tema 3.5: Potencia y Atenuación',
    question: 'Si se excita una guía con una frecuencia inferior a su frecuencia de corte (f < fc), ¿cuánta potencia promedio activa se propaga a lo largo de la guía?',
    mathExplanation: '\\langle P \\rangle = \\frac{1}{2} \\text{Re} \\int (\\vec{E} \\times \\vec{H}^*) \\cdot \\hat{z} \\, dA = 0',
    options: [
      'La mitad de la potencia incidente, disipándose el resto por calor.',
      'Una potencia proporcional a E0² multiplicada por la constante de atenuación α.',
      'Una potencia infinita que daña la fuente de RF inmediatamente.',
      '0 Watts; la impedancia es puramente reactiva e imaginaria y no hay transmisión neta de energía real.'
    ],
    correctIndex: 3,
    rationale: 'En modo evanescente (f < fc), la constante de propagación γ = α + jβ es puramente real (β = 0, γ = α). El campo magnético H y el campo eléctrico E quedan desfasados 90° en el tiempo, por lo que el vector de Poynting complejo es puramente imaginario y el flujo de potencia real promedio es cero.'
  },
  {
    id: 9,
    topic: '3.5',
    topicTitle: 'Tema 3.5: Potencia y Atenuación',
    question: 'En relación con el efecto pelicular (skin effect) en las paredes de una guía, ¿cómo varía la profundidad de penetración superficial δs con la frecuencia f?',
    mathExplanation: '\\delta_s = \\sqrt{\\frac{1}{\\pi f \\mu \\sigma}}',
    options: [
      'Aumenta linealmente con la frecuencia (δs ∝ f), haciendo que el metal conduzca en todo su volumen.',
      'Disminuye con el inverso de la raíz cuadrada de la frecuencia (δs ∝ 1/√f), concentrando la corriente en una capa más fina.',
      'Permanece constante para un metal dado sin importar la frecuencia de operación.',
      'Es inversamente proporcional al cuadrado de la frecuencia (δs ∝ 1/f²).'
    ],
    correctIndex: 1,
    rationale: 'La profundidad pelicular δs = 1 / √(π f μ σ). Al elevarse la frecuencia de microondas, las corrientes de Foucault expulsan la corriente hacia la superficie exterior del conductor, reduciendo la sección efectiva de conducción y elevando la resistencia superficial Rs = 1/(σ δs).'
  },
  {
    id: 10,
    topic: '3.5',
    topicTitle: 'Tema 3.5: Potencia y Atenuación',
    question: 'Para el modo dominante TE₁₀ en una guía rectangular con dimensiones a y b, la potencia promedio transmitida en función del campo eléctrico pico E₀ es:',
    mathExplanation: 'P_{avg} = \\frac{|E_0|^2 \\cdot a \\cdot b}{4 \\cdot Z_{TE}}',
    options: [
      'P_avg = (E₀² · a · b) / (2 · η)',
      'P_avg = (E₀ · a² · b²) / (8 · Z_TE)',
      'P_avg = (E₀² · a · b) / (4 · Z_TE)',
      'P_avg = (E₀² · a) / (4 · b · Z_TE)'
    ],
    correctIndex: 2,
    rationale: 'Integrando el vector de Poynting Sz = (1/2) Ey Hx* sobre la sección transversal 0≤x≤a y 0≤y≤b, con Ey = -E₀ sin(πx/a) y Hx = -Ey/Z_TE: ∫ sin²(πx/a) dx = a/2 y ∫ dy = b. Por ende, P_avg = (1/2) (E₀²/Z_TE) (a/2) (b) = (E₀² a b) / (4 Z_TE).'
  },
  {
    id: 11,
    topic: '3.6',
    topicTitle: 'Tema 3.6: Cavidades Resonantes e Iris',
    question: 'En una cavidad resonante rectangular cerrada de dimensiones a, b y d, donde d > a > b, ¿cuál es el modo resonante fundamental de menor frecuencia?',
    mathExplanation: 'f_{r,101} = \\frac{u}{2} \\sqrt{\\frac{1}{a^2} + \\frac{1}{d^2}}',
    options: [
      'El modo TE₁₀₁',
      'El modo TE₁₁₀',
      'El modo TM₁₁₁',
      'El modo TM₀₁₀'
    ],
    correctIndex: 0,
    rationale: 'Para una cavidad cerrada donde d > a > b, el modo de menor frecuencia es el TE₁₀₁ (m=1, n=0, p=1). Utiliza la dimensión longitudinal d y la mayor dimensión transversal a para obtener la frecuencia de resonancia más baja posible.'
  },
  {
    id: 12,
    topic: '3.6',
    topicTitle: 'Tema 3.6: Cavidades Resonantes e Iris',
    question: '¿Qué efecto electromagnético tiene la inserción de un diafragma metálico (iris) con bordes verticales paralelos al campo eléctrico Ey del modo TE₁₀?',
    mathExplanation: 'B_L < 0 \\quad (\\text{Susceptancia Inductiva en Derivación})',
    options: [
      'Introduce una susceptancia capacitiva en derivación (BC > 0), almacenando energía electrostática.',
      'Introduce una susceptancia inductiva en derivación (BL < 0), almacenando predominantemente energía magnética.',
      'Actúa como una resistencia pura de 50 Ohms que disipa toda la energía.',
      'Provoca la conversión irreversible del modo TE₁₀ en un modo TM₂₁.'
    ],
    correctIndex: 1,
    rationale: 'Al colocar diafragmas verticales en x, las líneas de campo magnético transversal Hx se concentran y deforman alrededor del obstáculo sin cortar las líneas verticales de E, incrementando la energía magnética almacenada. Por ende, el circuito equivalente es un inductor en paralelo.'
  },
  {
    id: 13,
    topic: '3.6',
    topicTitle: 'Tema 3.6: Cavidades Resonantes e Iris',
    question: '¿Qué representa cuantitativamente el Factor de Calidad Q de una cavidad resonante electromagnética?',
    mathExplanation: 'Q = \\omega \\frac{W_{\\text{almacenada}}}{P_{\\text{disipada}}}',
    options: [
      'La relación entre la potencia reflejada y la potencia incidente en los acopladores.',
      'El cociente entre la velocidad de la luz y la velocidad de fase dentro de la cavidad.',
      'La capacidad de corriente máxima antes de la ruptura dieléctrica del aire interior.',
      'La relación entre la energía electromagnética total almacenada y la potencia promedio disipada por período de oscilación.'
    ],
    correctIndex: 3,
    rationale: 'Por definición energética de osciladores, Q = ω (Energía Almacenada / Pérdidas de Potencia). Un factor Q elevado (típicamente entre 5,000 y 40,000 en cavidades de microondas) representa pérdidas muy bajas y una curva de resonancia sumamente estrecha y selectiva.'
  },
  {
    id: 14,
    topic: '3.6',
    topicTitle: 'Tema 3.6: Cavidades Resonantes e Iris',
    question: 'Si se inserta un iris metálico capacitivo (diafragma horizontal con abertura en el centro perpendicular a Ey), ¿cómo se modela circuitalmente?',
    mathExplanation: 'B_C > 0 \\quad (\\text{Susceptancia Capacitiva en Derivación})',
    options: [
      'Como una reactancia inductiva en serie pura.',
      'Como un transformador de impedancias ideal con relación 1:N.',
      'Como un aislador no recíproco de ferrita.',
      'Como una susceptancia capacitiva en paralelo (BC > 0), debido a la fuerte concentración de cargas y campo eléctrico en los bordes horizontales.'
    ],
    correctIndex: 3,
    rationale: 'Los diafragmas horizontales reducen la distancia efectiva entre los potenciales del campo Ey, concentrando un intenso campo eléctrico en el borde del entrehierro y acumulando carga eléctrica superficial. Esto incrementa la energía eléctrica almacenada, actuando como un capacitor en paralelo.'
  },
  {
    id: 15,
    topic: '3.6',
    topicTitle: 'Tema 3.6: Cavidades Resonantes e Iris',
    question: 'Si se rellena por completo una cavidad resonante de microondas con un dieléctrico homogéneo sin pérdidas de permitividad relativa εr = 4.0, ¿qué ocurre con su frecuencia de resonancia fr?',
    mathExplanation: 'f_r\' = \\frac{c}{2\\sqrt{\\epsilon_r}} \\sqrt{\\dots} = \\frac{f_r}{\\sqrt{4}} = \\frac{f_r}{2}',
    options: [
      'La frecuencia de resonancia se duplica (se multiplica por 2).',
      'La frecuencia de resonancia se cuadruplica (se multiplica por 4).',
      'La frecuencia de resonancia se reduce exactamente a la mitad (se divide entre 2).',
      'La frecuencia de resonancia permanece inalterada porque solo depende de las dimensiones a, b y d.'
    ],
    correctIndex: 2,
    rationale: 'La velocidad de la onda en el medio es u = c / √(εr). Al ser εr = 4.0, u disminuye a c / 2. Como la frecuencia de resonancia fr es directamente proporcional a u para una geometría dada, fr se reduce exactamente al 50% de su valor en vacío.'
  }
];

export interface SocraticTopic {
  id: string;
  title: string;
  buttonLabel: string;
  initialQuestion: string;
  dialogueStages: {
    userIntentPatterns: string[];
    guidingResponse: string;
    guidingMath?: string;
    nextPrompt: string;
  }[];
  conclusion: string;
}

export const SOCRATIC_KNOWLEDGE_BASE = [
  {
    keywords: ['tem', 'un solo conductor', 'hueca', 'modo tem'],
    topic: 'Modo TEM en Guías Metálicas',
    initialHint: '¡Excelente pregunta de fundamentos! Para responderla, recordemos qué define a un modo TEM: tanto Ez = 0 como Hz = 0. En ese caso, ¿qué ecuación diferencial gobierna el potencial electrostático transversal Φ(x,y)?',
    math: '\\nabla_t^2 \\Phi(x, y) = 0 \\quad (\\text{Ecuación de Laplace})',
    followUpQuestion: 'Piensa en esto: si las paredes de la guía son de cobre continuo, ¿qué valor tiene el potencial electrostático Φ en todo el contorno metálico?',
    progressiveHints: [
      'Pista 1: Un conductor ideal en equilibrio forma una superficie equipotencial continua (Φ = Φ₀ constante en toda la frontera).',
      'Pista 2: El teorema del valor extremo de Laplace estipula que una función armónica dentro de una región cerrada sin cargas no puede tener máximos ni mínimos locales en su interior, debiendo ser estrictamente constante.',
      'Conclusión Socrática: Si Φ es constante en toda la sección, entonces su gradiente es idénticamente nulo: E_t = -∇Φ = 0. Por tanto, ¡el campo eléctrico no puede existir! Para que haya modo TEM, se necesitan al menos dos conductores aislados con diferente potencial (como en un cable coaxial).'
    ]
  },
  {
    keywords: ['epsilon', 'permitividad', 'dielectrico', 'epsr'],
    topic: 'Efecto de la Permitividad Dieléctrica',
    initialHint: 'Examinemos cómo viaja la luz y la radiación en la materia. Cuando una onda electromagnética penetra en un dieléctrico con εr > 1, ¿qué le sucede a la velocidad de la onda u?',
    math: 'u = \\frac{c}{\\sqrt{\\mu_r \\epsilon_r}}',
    followUpQuestion: 'Si la velocidad de fase u se reduce al aumentar εr, ¿qué predicción harías sobre la frecuencia de corte fc = (u/2) * sqrt((m/a)² + (n/b)²)? ¿Aumentará o disminuirá?',
    progressiveHints: [
      'Pista 1: Observa que fc es directamente proporcional a u. Si u disminuye, fc debe reducirse en la misma proporción (1/√εr).',
      'Pista 2: Esto significa que una guía con dieléctrico puede propagar señales de frecuencias más bajas manteniendo las mismas dimensiones físicas.',
      'Conclusión Socrática: ¡Brillante! Rellenar la guía con dieléctrico reduce la longitud de onda física y la frecuencia de corte, permitiendo miniaturizar los componentes de microondas a expensas de introducir pérdidas dieléctricas (tan δ).'
    ]
  },
  {
    keywords: ['atenuacion', 'corte', 'fc', 'dispara', 'alpha'],
    topic: 'Disparo de la Atenuación cerca del Corte',
    initialHint: 'Imagina la onda dentro de la guía como dos ondas planas uniformes que rebotan contra las paredes laterales con un ángulo θ respecto al eje longitudinal z.',
    math: '\\cos\\theta = \\sqrt{1 - (f_c/f)^2}',
    followUpQuestion: 'A medida que la frecuencia de excitación f desciende y se iguala a fc, ¿hacia qué valor tiende cos θ? ¿Qué trayectoria física siguen las ondas?',
    progressiveHints: [
      'Pista 1: Si f = fc, entonces cos θ = 0, lo que significa θ = 90°. La onda incide perpendicularmente de pared a pared.',
      'Pista 2: Al rebotar perpendicularmente sin avanzar en z, la onda efectúa infinitos rebotes por unidad de longitud longitudinal.',
      'Conclusión Socrática: Exactamente. Al rebotar transversalmente, las corrientes de conducción superficial inducidas en el metal crecen enormemente para cancelar el campo magnético tangencial. La disipación óhmica (Joule) por metro longitudinal se vuelve infinita en el corte teórico.'
    ]
  },
  {
    keywords: ['vp', 'vg', 'fase', 'grupo', 'velocidad'],
    topic: 'Velocidad de Fase vs. Velocidad de Grupo',
    initialHint: 'A menudo causa sorpresa ver que la velocidad de fase vp = u / √(1 - (fc/f)²) es mayor que la velocidad de la luz c. ¿Por qué esto no viola la teoría de la relatividad de Einstein?',
    math: 'v_p \\cdot v_g = u^2 \\implies v_p > u \\quad \\text{y} \\quad v_g < u',
    followUpQuestion: 'Piensa en una ola rompiendo en la playa con un ángulo respecto a la costa. ¿Qué viaja más rápido: el agua de la ola hacia la orilla o el punto de contacto donde la espuma avanza a lo largo de la playa?',
    progressiveHints: [
      'Pista 1: El punto geométrico de intersección de la fase no transporta materia ni energía, es solo una coincidencia geométrica de crestas.',
      'Pista 2: La energía, la modulación y la información viajan con la velocidad de grupo vg = dω/dβ, que siempre es estrictamente menor a c.',
      'Conclusión Socrática: ¡Excelente deducción! vp es una velocidad puramente geométrica de una portadora armónica infinita sin información. Tan pronto como modulas una señal, la energía viaja a vg < c, respetando la causalidad relativista.'
    ]
  },
  {
    keywords: ['cavidad', 'q', 'factor q', 'resonancia'],
    topic: 'Factor Q y Resonancia en Cavidades',
    initialHint: 'Una cavidad resonante es el equivalente electromagnético en microondas a un circuito RLC de muy alta calidad. ¿Cuál es la definición fundamental del Factor de Calidad Q en términos de energía?',
    math: 'Q = \\omega \\frac{W_{\\text{almacenada}}}{P_{\\text{disipada}}}',
    followUpQuestion: 'Si construimos la cavidad con cobre de altísima conductividad σ en lugar de hierro o acero, ¿qué parámetro de las paredes se minimiza para elevar el Q?',
    progressiveHints: [
      'Pista 1: Las pérdidas ocurren en la capa pelicular de espesor δs = 1/√(π f μ σ) en la superficie interna.',
      'Pista 2: La resistencia superficial es Rs = 1/(σ δs). Mayor conductividad σ reduce Rs y por ende disminuye la potencia disipada por pérdidas Joule.',
      'Conclusión Socrática: ¡Correcto! Al minimizar Rs y optimizar la relación volumen/área de la cavidad, se maximiza la energía almacenada en el campo frente a la disipada en las paredes, logrando factores Q de 10,000 a 40,000 en microondas.'
    ]
  }
];
