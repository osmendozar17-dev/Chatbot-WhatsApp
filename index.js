// index.js
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const token = process.env.TOKEN;
const verifyToken = process.env.VERIFY_TOKEN; // TOKEN TEMPORAL DE 60 DÍAS
const port = process.env.PORT || 3000;

// --- Estado de sesión de usuario (para saber en qué menú está)
const userState = {};

// --- Menú principal
const mainMenu = `
👋 ¡Hola! ¡Bienvenido a la IE 3038 P.C.Guzmán! Soy ClassMind, por favor elige una opción:
1️⃣ Matrículas y Admisiones
2️⃣ Horarios y Calendario Académico
3️⃣ Pago y Gestión Administrativa
4️⃣ Eventos y Comunicados

Escribe el número de la opción que deseas.
`;

// --- Submenús y respuestas
const menus = {
  1: {
    title: "📘 Matrículas y Admisiones",
    options: {
      1: "¿Cuándo inicia las inscripciones/matrículas?",
      2: "¿Qué documentos necesito para matricular a mi hijo/a?",
      3: "¿Cuánto es el costo de la matrícula?"
    },
    responses: {
      1: "Inicia desde el mes de diciembre hasta febrero, claro está que está sujeta a cambios. Aquí le adjuntamos el FUT de nuestra institución para que pueda llenarlo y solicitarlo como es de manera correcta:\n📎 https://drive.google.com/file/d/1LLvUslWn6w5tqhW5zkdxIPwKyUqNCnmQ/view?usp=sharing",
      2: "Necesita: El FUT de nuestra IE, copia de DNI del menor, copia de DNI del padre, madre o apoderado. También, en caso sea de otra institución educativa necesita su boleta de notas de la IE de procedencia. Al igual que en la opción 1, le adjuntamos el link del FUT:\n📎 https://drive.google.com/file/d/1LLvUslWn6w5tqhW5zkdxIPwKyUqNCnmQ/view?usp=sharing",
      3: "La matrícula no tiene costo alguno, es GRATUITO."
    }
  },
  2: {
    title: "📅 Horarios y Calendario Escolar",
    options: {
      1: "Horario de Ingreso y Salida de los estudiantes",
      2: "Fecha de vacaciones y feriado calendario"
    },
    responses: {
      1: "El ingreso es desde las 7:20 am hasta las 7:40 am y el horario de salida es a la 1:00 pm.",
      2: "Las vacaciones son en el mes de Julio desde el 21 de Julio hasta el 03 de Agosto. Y respecto a los feriados, lo puede encontrar en el siguiente link: https://www.gob.pe/feriados"
    }
  },
  3: {
    title: "💼 Pago y Gestión Administrativa",
    options: {
      1: "¿Cómo solicito el Certificado de Estudios?",
      2: "¿Cuándo apersonarse al área administrativa?"
    },
    responses: {
      1: "Puede solicitarlo por medio de este link: https://certificado.minedu.gob.pe/ Luego de ingresar al enlace elegir la opción 1 y llenar lo solicitado.",
      2: "El mejor momento para acercarse de manera presencial a la IE, es cuando vaya a dejar un documento o justificación. Por ejemplo: Inscripción o Ratificación de Matrícula, también cuando vaya a justificar la inasistencia de su menor hijo/a pasado los 04 días."
    }
  },
  4: {
    title: "🎉 Eventos y Comunicados",
    options: {
      1: "¿Cuándo será la próxima reunión de Padres de Familia?",
      2: "¿A qué número o correo electrónico puedo comunicarme con la Institución Educativa?"
    },
    responses: {
      1: "Toda información de manera detallada lo puede encontrar en nuestra página oficial de Facebook: https://web.facebook.com/institucioneducativa3038",
      2: "Se puede comunicar con el siguiente número: 01 777-7777 y al siguiente correo electrónico: institucioneducativa3038@gmail.com"
    }
  }
};

// --- Envío de mensajes por WhatsApp
async function sendMessage(phone, text) {
  await axios.post(
    `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: text },
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

// --- Webhook de verificación
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token && mode === "subscribe" && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// --- Webhook de mensajes entrantes
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message) {
    const phone = message.from;
    const text = message.text?.body?.trim();

    if (!userState[phone]) {
      userState[phone] = { step: "main" };
      await sendMessage(phone, mainMenu);
      return res.sendStatus(200);
    }

    const state = userState[phone];

    // Menú principal
    if (state.step === "main") {
      if (menus[text]) {
        userState[phone] = { step: "submenu", menu: text };
        const submenu = menus[text];
        let msg = `${submenu.title}\nElige una pregunta:\n`;
        for (const [key, opt] of Object.entries(submenu.options)) {
          msg += `${key}. ${opt}\n`;
        }
        msg += `\nEscribe el número de tu pregunta o 0 para volver al inicio.`;
        await sendMessage(phone, msg);
      } else {
        await sendMessage(phone, "Por favor elige una opción válida (1-4).");
      }
    }

    // Submenús
    else if (state.step === "submenu") {
      if (text === "0") {
        userState[phone] = { step: "main" };
        await sendMessage(phone, mainMenu);
      } else {
        const menu = menus[state.menu];
        const response = menu.responses[text];
        if (response) {
          const finalResponse = `${response}\n\n🔙 Para regresar al menú principal escriba 0.`;
          await sendMessage(phone, finalResponse);
        } else {
          await sendMessage(phone, "Por favor elige una pregunta válida o escribe 0 para volver al inicio.");
        }
      }
    }
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`✅ Bot WhatsApp activo en puerto ${port}`);
});
