/**
 * CONFIGURACIÓN DE ANIVERSARIO 7 MESES - ESTILO LEAGUE OF LEGENDS
 * ==============================================================
 * Todos los textos son editables aquí o mediante el botón "Editar" en pantalla.
 */

const ANNIVERSARY_CONFIG = {
  // Datos de la pareja
  pareja: {
    ella: {
      nombre: "LYRA",
      rol: "Support Eterna",
      campeonFavorito: "Ahri / Yuumi de mi corazón",
      hechizos: ["Flash", "Heal"]
    },
    el: {
      nombre: "CAMUS",
      rol: "ADC Invencible",
      campeonFavorito: "El dueño de mi corazón",
      hechizos: ["Flash", "Ignite"]
    },
    mesesJuntos: 7,
    tituloAniversario: "7 MESES JUNTOS"
  },

  // Consejos románticos para la pantalla de carga
  tipsCarga: [
    "Sabías que: Jugar a tu lado otorga un bufo permanente de +999 de felicidad.",
    "Consejo de la Grieta: No importa la dificultad de la partida si estás con tu dúo favorito.",
    "Efecto pasivo: Tu sonrisa cura cualquier herida y anula todo el daño del mundo.",
    "Dato curioso: El 100% de las partidas de la vida son mejores cuando las jugamos juntos.",
    "Recordatorio: Eres mi victoria favorita todos los días.",
    "Hechizo legendario: Nuestro amor no tiene enfriamiento (Cooldown: 0s)."
  ],

  // LOS 7 COFRES HEXTECH DISTRIBUIDOS EN EL MAPA (NIVEL 1 AL NIVEL 7)
  cofres: [
    {
      nivel: 1,
      mes: "Mes 1",
      titulo: "El Inicio de la Partida",
      subtitulo: "Cuando todo comenzó",
      icono: "🌟",
      mensaje: "Hace 7 meses inició la mejor aventura de mi vida. Recordar cómo empezamos a hablar, las primeras sonrisas y el clic instantáneo entre los dos me llena el corazón. Desde el minuto uno supe que serías alguien muy especial para mí.",
      recompensa: "Insignia de Primer Encuentro (+100 Amor)"
    },
    {
      nivel: 2,
      mes: "Mes 2",
      titulo: "Sincronía en el Carril",
      subtitulo: "Nuestras primeras risas y confidencias",
      icono: "🛡️",
      mensaje: "En nuestro segundo mes las charlas se hicieron infinitas. Descubrí lo divertido, tierno y único que eres. Nos dimos cuenta de que hacemos un equipo increíble y que cada día a tu lado es una aventura que nunca quiero que termine.",
      recompensa: "Vínculo de Dúo Imparable (+200 Ternura)"
    },
    {
      nivel: 3,
      mes: "Mes 3",
      titulo: "Sinergia Perfecta",
      subtitulo: "El combo definitivo",
      icono: "⚔️",
      mensaje: "Tres meses juntos y la conexión ya era total. Empezamos a entendernos con solo una mirada. Aprendimos a apoyarnos en los días buenos y en los no tan buenos, demostrando que juntos no hay obstáculo que no podamos superar.",
      recompensa: "Pacto de Apoyo Mutuo (+300 Fuerza)"
    },
    {
      nivel: 4,
      mes: "Mes 4",
      titulo: "Conquistando Objetivos",
      subtitulo: "Momentos inolvidables juntos",
      icono: "🐉",
      mensaje: "Cuatro meses construyendo recuerdos preciosos. Cada salida, cada llamada de madrugada y cada abrazo se convirtieron en mi refugio seguro. Gracias por hacerme sentir tan amada y valorada en todo momento.",
      recompensa: "Esencia de Confianza Eterna (+400 Alegría)"
    },
    {
      nivel: 5,
      mes: "Mes 5",
      titulo: "Forjando Promesas",
      subtitulo: "Creciendo y soñando juntos",
      icono: "💎",
      mensaje: "Cinco meses demostrando que lo nuestro es real y hermoso. No solo eres mi novio, eres mi mejor amigo, mi confidente y la persona con la que quiero compartir cada logro y cada sueño por cumplir.",
      recompensa: "Cristal Hextech del Destino (+500 Ilusión)"
    },
    {
      nivel: 6,
      mes: "Mes 6",
      titulo: "Alma de Dragón",
      subtitulo: "Un amor indestructible",
      icono: "🔥",
      mensaje: "Seis meses a tu lado y mi amor por ti sigue creciendo a pasos agigantados. Hemos superado retos y cada día me enamoro más de tus detalles, de tu mirada y de cómo me haces sentir tan afortunada de tenerte.",
      recompensa: "Alma de Dragón de la Pasión (+600 Lealtad)"
    },
    {
      nivel: 7,
      mes: "Mes 7",
      titulo: "La Gran Victoria Hextech",
      subtitulo: "7 Meses de Amor Inquebrantable",
      icono: "👑",
      mensaje: "¡Llegamos a los 7 meses, mi amor! Siete meses siendo el mejor equipo del mundo. Eres mi campeón favorito, mi dúo de vida y la persona que elijo hoy y siempre. ¡Nuestra victoria es para toda la vida!",
      recompensa: "Cofre Mítico de la Gran Victoria (Desbloquea Carta y Celebración)"
    }
  ],

  // Carta de Amor Final
  cartaAmor: {
    encabezado: "CARTA DE AMOR - 7 MESES DE VICTORIA",
    titulo: "A Mi Dúo Eterno en la Grieta y en la Vida",
    fecha: "7 Meses Inolvidables",
    contenido: `Mi amor hermoso:

Llegar a estos 7 meses contigo se siente como la victoria más dulce y épica de todas. 

Dicen que en League of Legends lo más difícil de encontrar es un dúo en quien confiar ciegamente, alguien que te cubra la espalda cuando las cosas se ponen difíciles, que celebre cada triunfo a tu lado y que no te abandone nunca. Pero en la vida real, encontrarte a ti ha sido el mayor regalo que el universo me pudo dar.

Amo cada detalle tuyo: tu sonrisa que me reinicia la vida, tu manera de hacerme reír, tu forma de abrazarme que me hace sentir en casa y ese lunar en el centro de tu frente que te hace único y perfecto para mí.

Gracias por estos 7 meses llenos de paciencia, risas, complicidad y amor sincero. Eres mi campeón favorito, mi soporte en los días grises y mi mayor inspiración todos los días. No cambiaría ni un solo segundo de los momentos que hemos vivido juntos.

Esta es solo una de las miles de victorias que nos quedan por celebrar. Te amo con todo mi corazón.`,
    despedida: "Con todo mi amor, por siempre y para siempre:",
    firma: "Tu Novia y Dúo Favorita ❤️"
  },

  // Modal final al aceptar la partida
  confirmacionPartida: {
    titulo: "¡PARTIDA ACEPTADA PARA SIEMPRE!",
    mensaje: "Has bloqueado a tu dúo eterno para todas las temporadas de la vida. ¡Nuestra historia apenas comienza! ❤️✨"
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ANNIVERSARY_CONFIG;
}
