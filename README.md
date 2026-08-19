# SAMUEL

> **Un lugar donde podés hablar.**
>
> *En modo CONFIDENCIAL, la conversación ocurre en el dispositivo del usuario y el contenido de esa conversación no llega a nuestros servidores.*

SAMUEL es un espacio conversacional sobrio y privado donde podés contar lo que te pasa, ordenar una idea, pensar una decisión o simplemente descargar lo que tenés en la cabeza.

No necesitás saber usar IA ni escribir prompts complejos.

SAMUEL **NO** es un psicólogo, terapeuta, médico ni tratamiento. No diagnostica ni sustituye profesionales de la salud. Es una herramienta conversacional de IA para pensar, expresarse, ordenar ideas y explorar problemas.

---

## 🏛️ Las 5 Leyes del Producto

1. **Ley 1 · Privacidad**: En CONFIDENCIAL, el contenido de la conversación (mensajes, respuestas, contexto, memoria, clasificaciones) nunca sale del dispositivo. La propiedad buscada es: *"No llegó"*.
2. **Ley 2 · Sin Fallback Remoto**: Si el dispositivo no soporta WebGPU o no puede ejecutar la inferencia local, se informa la incompatibilidad técnica con honestidad. Nunca se usa un servidor remoto silenciosamente (*Privacidad > Compatibilidad*).
3. **Ley 3 · Velocidad**: Inferencia WebGPU nativa fuera del hilo principal en un Web Worker dedicado (`@mlc-ai/web-llm`), con streaming token por token y UI fluida (60 fps).
4. **Ley 4 · Simpleza**: Sin cuentas, sin contraseñas, sin base de datos en la nube, sin telemetría ni perfiles. Memoria volátil de sesión que se descarta al reiniciar (*"No todo lo que decís tiene que convertirse en un archivo"*).
5. **Ley 5 · Conversación Real**: Módulo **SAMUEL CORE** que escucha antes de solucionar, hace preguntas útiles, detecta contradicciones, distingue hechos de interpretaciones, controla la profundidad y elimina frases de falsa empatía o apego manipulativo.

---

## ⚡ Arquitectura Técnica

```text
Usuario / UI (React + Tailwind CSS)
      │
      ▼
SAMUEL CORE
├── Conversation State (Memoria volátil de sesión)
├── Question Strategy (Foco en agencia del usuario y hechos)
├── Contradiction Detector (Detección respetuosa de ambivalencias)
├── Depth Control (Control de ritmo y concisión)
├── Safety Layer (Límites no-médicos y recursos de crisis)
└── Explainability Engine ("¿Por qué preguntaste eso?")
      │
      ▼
Inference Web Worker (Dedicated background thread)
      │
      ▼
WebLLM (@mlc-ai/web-llm) + WebGPU
      │
      ▼
Modelos Locales Cuantizados (Cache API / IndexedDB)
├── Llama 3.2 1B Instruct (q4f16_1)
├── Qwen 2.5 1.5B Instruct (q4f16_1)
└── SmolLM2 360M Instruct (q4f16_1)
```

---

## 🛡️ Privacy Auditor en Vivo

El sistema incluye un auditor de red en tiempo de ejecución (`src/privacy/privacy-auditor.ts`) que intercepta `fetch`, `XMLHttpRequest`, `sendBeacon` y `WebSocket`, distinguiendo entre:
* **`APP_MODEL_DOWNLOAD`**: Descarga inicial de la app y pesos del modelo hacia la caché del navegador.
* **`CONVERSATION_DATA`**: Datos de conversación, garantizado estrictamente en **0 bytes transmitidos**.

---

## 🚀 Instalación y Uso

### Requisitos
* Node.js 18+
* Navegador con soporte para WebGPU (Chrome 113+, Edge 113+, Safari 18+ o navegadores basados en Chromium con aceleración gráfica habilitada).

### Comandos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Ejecutar suite completa de tests de privacidad, seguridad y conversación
npm test

# 4. Compilar para producción (PWA estática)
npm run build
```

---

## ⚖️ Marco Legal y Regulatorio

La configuración legal (`src/config/regulatory.ts`, `jurisdictions.ts`, `safety-resources.ts`) está desacoplada de la lógica conversacional e incluye:
* Referencia a la **Ley 25.326 de Protección de los Datos Personales** y **Ley 26.657 de Salud Mental** (República Argentina) y marcos normativos comparados (España, México, Colombia, Chile, EE.UU.).
* Recursos de crisis y líneas de asistencia directa oficiales verificadas (Línea 135 / 0800-999-0091 en Argentina, 024 en España, 988 en EE.UU., etc.).
* Deslinde expreso: Herramienta de IA conversacional no apta para diagnóstico o emergencia médica.
