import { Stop } from './scavenger-hunt.types';

/**
 * PLACEHOLDER CONTENT. Replace lat/lng, narrative, and answers with the real
 * memories before the real day — everything here is a stand-in so the app
 * can be built and tested end-to-end. Coordinates below are obviously-fake
 * placeholders clustered near 40.0000, -3.0000.
 */
export const HUNT_STOPS: Stop[] = [
  {
    id: 'stop-1-coffee-shop',
    order: 1,
    chapterIcon: '☕',
    isFinale: false,
    title: { en: 'Where It (Sort Of) Started', es: 'Donde (Casi) Empezó Todo' },
    narrative: {
      en: 'Before either of us called it a date, we sat here for three hours over one cup of coffee that went cold.',
      es: 'Antes de que ninguno de los dos lo llamara una cita, nos sentamos aquí tres horas con un café que se enfrió.',
    },
    location: {
      lat: 40.0001, // PLACEHOLDER — replace before the real day
      lng: -3.0001, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'The coffee shop', es: 'La cafetería' },
    },
    minigame: {
      kind: 'riddle-mc',
      prompt: {
        en: "I'm warm, I'm brown, and I kept you talking for hours before you even knew you liked me. What am I?",
        es: 'Soy cálido, soy marrón, y te mantuve hablando por horas antes de que supieras que te gustaba. ¿Qué soy?',
      },
      options: [
        { en: 'A blanket', es: 'Una manta' },
        { en: 'A cup of coffee', es: 'Una taza de café' },
        { en: 'A campfire', es: 'Una fogata' },
        { en: 'A sweater', es: 'Un suéter' },
      ],
      correctIndex: 1,
      hints: [
        {
          en: 'Think about what was on the table between us.',
          es: 'Piensa en lo que había en la mesa entre nosotros.',
        },
        {
          en: 'It was in a cup, and it went cold because we forgot about it.',
          es: 'Estaba en una taza, y se enfrió porque lo olvidamos.',
        },
        { en: "It's the coffee.", es: 'Es el café.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'multiple-choice',
      question: { en: 'What did I order that day?', es: '¿Qué pedí ese día?' },
      options: [
        { en: 'A cappuccino', es: 'Un capuchino' },
        { en: 'A plain black coffee', es: 'Un café negro' },
        { en: 'Hot chocolate', es: 'Chocolate caliente' },
        { en: 'Tea', es: 'Té' },
      ],
      correctIndex: 1,
      hints: [
        { en: 'I always keep it simple.', es: 'Siempre lo mantengo sencillo.' },
        { en: 'No milk, no sugar.', es: 'Sin leche, sin azúcar.' },
        { en: 'A plain black coffee.', es: 'Un café negro.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter Y in your notebook — you'll need it later.",
      es: 'Escribe la letra Y en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-2-park-bench',
    order: 2,
    chapterIcon: '🌇',
    isFinale: false,
    title: { en: 'The Bench We Kept Coming Back To', es: 'La Banca a la que Siempre Volvimos' },
    narrative: {
      en: 'We came back to this same bench more times than either of us admitted, always right as the sky did something worth watching.',
      es: 'Volvimos a esta misma banca más veces de las que ninguno admitió, siempre justo cuando el cielo hacía algo digno de ver.',
    },
    location: {
      lat: 40.0002, // PLACEHOLDER — replace before the real day
      lng: -3.0002, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'The park bench', es: 'La banca del parque' },
    },
    minigame: {
      kind: 'word-scramble',
      prompt: {
        en: 'Unscramble the word that describes the sky that evening.',
        es: 'Desordena las letras para encontrar la palabra que describe el cielo esa noche.',
      },
      answer: { en: 'SUNSET', es: 'ATARDECER' },
      hints: [
        {
          en: 'It happens once a day, right before the sky goes dark.',
          es: 'Sucede una vez al día, justo antes de que oscurezca.',
        },
        {
          en: 'Orange, pink, and a little bit of gold.',
          es: 'Naranja, rosa, y un poco de dorado.',
        },
        { en: 'Sunset.', es: 'Atardecer.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'free-text',
      question: {
        en: 'What did we always say we should do here, but never did?',
        es: '¿Qué siempre dijimos que haríamos aquí, pero nunca hicimos?',
      },
      acceptedAnswers: [{ en: 'watch the stars', es: 'ver las estrellas' }],
      hints: [
        {
          en: 'It involves looking up, much later at night.',
          es: 'Implica mirar hacia arriba, mucho más tarde en la noche.',
        },
        {
          en: "We'd need a blanket and a lot of patience.",
          es: 'Necesitaríamos una manta y mucha paciencia.',
        },
        { en: 'Watch the stars.', es: 'Ver las estrellas.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter E in your notebook — you'll need it later.",
      es: 'Escribe la letra E en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-3-bookstore',
    order: 3,
    chapterIcon: '📚',
    isFinale: false,
    title: {
      en: 'The Bookstore Neither of Us Left Empty-Handed',
      es: 'La Librería de la que Ninguno Salió con las Manos Vacías',
    },
    narrative: {
      en: 'You disappeared into the aisles and I lost you for twenty minutes, and it was somehow one of my favorite twenty minutes.',
      es: 'Desapareciste entre los pasillos y te perdí de vista por veinte minutos, y de alguna forma fueron de mis veinte minutos favoritos.',
    },
    location: {
      lat: 40.0003, // PLACEHOLDER — replace before the real day
      lng: -3.0003, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'The bookstore', es: 'La librería' },
    },
    minigame: {
      kind: 'wordle-guess',
      prompt: {
        en: 'Guess the word: what did you spend twenty minutes browsing?',
        es: 'Adivina la palabra: ¿qué estuviste hojeando por veinte minutos?',
      },
      targetWord: { en: 'NOVEL', es: 'NOVELA' },
      maxGuesses: 6,
      hints: [
        {
          en: "It's a type of book, usually a long story.",
          es: 'Es un tipo de libro, generalmente una historia larga.',
        },
        { en: 'Five letters in English.', es: 'Seis letras en español.' },
        { en: 'Novel.', es: 'Novela.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'multiple-choice',
      question: {
        en: 'What section did you disappear into?',
        es: '¿En qué sección desapareciste?',
      },
      options: [
        { en: 'Poetry', es: 'Poesía' },
        { en: 'Mystery', es: 'Misterio' },
        { en: 'Fantasy', es: 'Fantasía' },
        { en: 'History', es: 'Historia' },
      ],
      correctIndex: 2,
      hints: [
        { en: 'Dragons might be involved.', es: 'Podrían estar involucrados los dragones.' },
        { en: "It's a genre with made-up worlds.", es: 'Es un género con mundos inventados.' },
        { en: 'Fantasy.', es: 'Fantasía.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter S in your notebook — you'll need it later.",
      es: 'Escribe la letra S en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-4-road-trip',
    order: 4,
    chapterIcon: '🚗',
    isFinale: false,
    title: {
      en: 'The Trip We Definitely Under-Planned',
      es: 'El Viaje que Definitivamente No Planeamos Bien',
    },
    narrative: {
      en: 'We got lost twice, argued about the radio, and found the best diner of our lives by complete accident.',
      es: 'Nos perdimos dos veces, discutimos por la radio, y encontramos el mejor restaurante de nuestras vidas por pura casualidad.',
    },
    location: {
      lat: 40.0004, // PLACEHOLDER — replace before the real day
      lng: -3.0004, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'Where the road trip stopped', es: 'Donde paró el viaje' },
    },
    minigame: {
      kind: 'sequence-reorder',
      prompt: {
        en: 'Put the road trip back in order.',
        es: 'Ordena el viaje correctamente.',
      },
      itemsInCorrectOrder: [
        { en: 'We got in the car', es: 'Nos subimos al auto' },
        { en: 'We got lost', es: 'Nos perdimos' },
        { en: 'We found the best diner ever', es: 'Encontramos el mejor restaurante' },
        {
          en: 'We watched the sunset from the hood of the car',
          es: 'Vimos el atardecer desde el capó del auto',
        },
      ],
      hints: [
        { en: 'It starts before we even left.', es: 'Empieza antes de que saliéramos.' },
        { en: 'Food came before the view.', es: 'La comida vino antes de la vista.' },
        { en: 'Car, lost, diner, sunset.', es: 'Auto, perdidos, restaurante, atardecer.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'notebook-code',
      question: {
        en: 'Combine the letters from your notebook so far into one word.',
        es: 'Combina las letras de tu cuaderno hasta ahora en una sola palabra.',
      },
      referencedStopOrders: [1, 2, 3],
      acceptedAnswers: [{ en: 'YES', es: 'YES' }],
      hints: [
        {
          en: 'Look back at what you wrote at the first three stops.',
          es: 'Revisa lo que escribiste en las primeras tres paradas.',
        },
        { en: "It's a three-letter word.", es: 'Es una palabra de tres letras.' },
        { en: 'YES.', es: 'YES.' },
      ],
    },
  },
  {
    id: 'stop-5-concert',
    order: 5,
    chapterIcon: '🎵',
    isFinale: false,
    title: {
      en: 'The Concert With the Terrible Seats',
      es: 'El Concierto de los Asientos Terribles',
    },
    narrative: {
      en: "We could barely see the stage, and it didn't matter one bit.",
      es: 'Apenas podíamos ver el escenario, y no importó en lo absoluto.',
    },
    location: {
      lat: 40.0005, // PLACEHOLDER — replace before the real day
      lng: -3.0005, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'The concert venue', es: 'El lugar del concierto' },
    },
    minigame: {
      kind: 'sliding-tile-puzzle',
      prompt: {
        en: 'Slide the tiles to piece the memory back together.',
        es: 'Desliza las piezas para reconstruir el recuerdo.',
      },
      imageAsset: 'scavenger-hunt/tiles/placeholder.jpg',
      gridSize: 3,
      hints: [
        { en: 'Start with the corners.', es: 'Empieza por las esquinas.' },
        { en: 'Work one row at a time.', es: 'Trabaja una fila a la vez.' },
        {
          en: "Move any tile next to the empty space — it'll come together.",
          es: 'Mueve cualquier pieza junto al espacio vacío — se armará solo.',
        },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'free-text',
      question: {
        en: 'Whose idea was it to go, even with such bad seats?',
        es: '¿De quién fue la idea de ir, incluso con esos asientos tan malos?',
      },
      acceptedAnswers: [
        { en: 'yours', es: 'tuya' },
        { en: 'you', es: 'tu' },
      ],
      hints: [
        { en: "It wasn't mine.", es: 'No fue mía.' },
        { en: 'Think about who bought the tickets.', es: 'Piensa en quién compró los boletos.' },
        { en: 'It was yours.', es: 'Fue tuya.' },
      ],
    },
  },
  {
    id: 'stop-6-beach',
    order: 6,
    chapterIcon: '🏖️',
    isFinale: false,
    title: { en: 'The Beach Day That Ran Too Long', es: 'El Día de Playa que se Alargó Demasiado' },
    narrative: {
      en: "We stayed until well past sunburn o'clock and neither of us wanted to leave.",
      es: 'Nos quedamos hasta bien pasada la hora de quemarnos con el sol y ninguno quería irse.',
    },
    location: {
      lat: 40.0006, // PLACEHOLDER — replace before the real day
      lng: -3.0006, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'The beach', es: 'La playa' },
    },
    minigame: {
      kind: 'shake-to-reveal',
      prompt: {
        en: 'Shake the sand off to see what we found that day.',
        es: 'Sacude la arena para ver qué encontramos ese día.',
      },
      revealedWord: { en: 'STARFISH', es: 'ESTRELLA DE MAR' },
      hints: [
        {
          en: 'It lives in the ocean and has five arms.',
          es: 'Vive en el océano y tiene cinco brazos.',
        },
        {
          en: "It's shaped like the night sky's most famous shape.",
          es: 'Tiene la forma más famosa del cielo nocturno.',
        },
        { en: 'A starfish.', es: 'Una estrella de mar.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'multiple-choice',
      question: { en: 'What did we bury in the sand?', es: '¿Qué enterramos en la arena?' },
      options: [
        { en: 'My phone (by accident)', es: 'Mi teléfono (por accidente)' },
        { en: 'A time capsule note', es: 'Una nota de cápsula del tiempo' },
        { en: 'Our shoes', es: 'Nuestros zapatos' },
        { en: 'Snacks', es: 'Snacks' },
      ],
      correctIndex: 1,
      hints: [
        { en: 'We wrote something down first.', es: 'Primero escribimos algo.' },
        {
          en: 'We meant to come back for it someday.',
          es: 'Teníamos la intención de volver por ello algún día.',
        },
        { en: 'A time capsule note.', es: 'Una nota de cápsula del tiempo.' },
      ],
    },
  },
  {
    id: 'stop-7-family-dinner',
    order: 7,
    chapterIcon: '🍽️',
    isFinale: false,
    title: {
      en: 'The Dinner Where You Met Everyone at Once',
      es: 'La Cena Donde Conociste a Todos a la Vez',
    },
    narrative: {
      en: 'You were more nervous than I was, and by the end of the night everyone already loved you.',
      es: 'Estabas más nervioso de lo que yo estaba, y para el final de la noche todos ya te querían.',
    },
    location: {
      lat: 40.0007, // PLACEHOLDER — replace before the real day
      lng: -3.0007, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'Where dinner happened', es: 'Donde fue la cena' },
    },
    minigame: {
      kind: 'jigsaw-puzzle',
      prompt: {
        en: 'Piece together a photo from that night.',
        es: 'Arma una foto de esa noche.',
      },
      imageAsset: 'scavenger-hunt/jigsaw/placeholder.jpg',
      pieceCount: 9,
      hints: [
        { en: 'Start with the edge pieces.', es: 'Empieza por las piezas de borde.' },
        {
          en: 'Look for matching colors between pieces.',
          es: 'Busca colores que coincidan entre las piezas.',
        },
        {
          en: "Drag any remaining piece to its obvious empty spot — you're close.",
          es: 'Arrastra cualquier pieza restante a su espacio obvio — ya casi.',
        },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'free-text',
      question: {
        en: 'What did you bring that night to make a good impression?',
        es: '¿Qué llevaste esa noche para causar buena impresión?',
      },
      acceptedAnswers: [
        { en: 'flowers', es: 'flores' },
        { en: 'wine', es: 'vino' },
      ],
      hints: [
        { en: 'It was a classic move.', es: 'Fue un movimiento clásico.' },
        {
          en: 'Something you hand to the host at the door.',
          es: 'Algo que le das al anfitrión en la puerta.',
        },
        { en: 'Flowers (or wine).', es: 'Flores (o vino).' },
      ],
    },
  },
  {
    id: 'stop-8-finale',
    order: 8,
    chapterIcon: '✨',
    isFinale: true,
    title: { en: 'The First Page', es: 'La Primera Página' },
    narrative: {
      en: 'This is where the whole story actually began. Every other chapter came after this one.',
      es: 'Aquí es donde realmente comenzó toda la historia. Cada otro capítulo vino después de este.',
    },
    location: {
      lat: 40.0008, // PLACEHOLDER — replace before the real day
      lng: -3.0008, // PLACEHOLDER — replace before the real day
      radiusMeters: 40,
      label: { en: 'Where we first met', es: 'Donde nos conocimos' },
    },
  },
];
