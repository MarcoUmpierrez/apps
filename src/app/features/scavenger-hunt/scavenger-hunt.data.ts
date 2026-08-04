import { Stop } from './scavenger-hunt.types';

/**
 * PLACEHOLDER CONTENT. Replace lat/lng, narrative, and answers with the real
 * memories before the real day — everything here is a stand-in so the app
 * can be built and tested end-to-end. Coordinates below are obviously-fake
 * placeholders clustered near 40.0000, -3.0000.
 */
export const HUNT_STOPS: Stop[] = [
  {
    id: 'stop-1-rubi-shop',
    order: 1,
    chapterIcon: '♦️',
    chapterImage: 'scavenger-hunt/photos/rubi.png',
    pageNumber: 237,
    isFinale: false,
    title: { en: 'Where It (Sort Of) Started', es: 'Donde (Casi) Empezó Todo' },
    narrative: {
      en: "That day we had woken up late. We'd had a night of passion and were exhausted. Still, we couldn't relax because we had to deal with the dreaded taxes. We decided to work outside, hoping to clear our heads a little before facing such a task. We stepped out into a stifling heat, typical of summer, unusual for this time of year, with all the rain and cold weather we'd had. We were looking for somewhere to sit down, eat, and work on the taxes but we felt too lazy, we didn't feel like going far, so we decided to sit down at one of the restaurants nearby. What stood out most about this restaurant was the symbol decorating it, I could describe it certainly with some unique features, that reminded me of this riddle.",
      es: 'Aquél día nos habíamos levantado tarde. Habíamos tenido una noche de pasión y estábamos muy cansados. Sin embargo, no nos podíamos relajar porque teníamos que rellenar los dichosos impuestos. Decidimos trabajar al aire libre, intentando refrescar un poco nuestras ideas antes de enfrentarnos a semejante tarea. Salimos y nos topamos con un calor sofocante, propio del verano inusual este año, con tantas lluvias y tiempo frío. Buscábamos un lugar donde sentarnos a comer y trabajar en los impuestos pero no nos apetecía ir muy lejos, así que decidimos sentarnos en uno de los restaurantes de la zona. Lo más que identificaba este restaurante era el símbolo que lo decoraba, ciertamente con unas características únicas, que me hicieron recordar este acertijo.',
    },
    narrativeRich: [
      [
        { text: { en: 'That day', es: 'Aquél día' }, style: 'empty' },
        {
          text: {
            en: " we had woken up late. We'd had a ",
            es: ' nos habíamos levantado tarde. Habíamos tenido una ',
          },
        },
        { text: { en: 'night of passion', es: 'noche de pasión' }, style: 'crossed' },
        {
          text: {
            en: ' and were exhausted. Still, we couldn’t relax because we had to deal with the dreaded ',
            es: 'y estábamos muy cansados. Sin embargo, no nos podíamos relajar porque teníamos que rellenar los dichosos ',
          },
        },
        { text: { en: 'taxes', es: 'impuestos' }, style: 'empty' },
        {
          text: {
            en: '. We decided to work outside, hoping to clear our heads a little before facing such a task. We stepped out into a stifling heat, ',
            es: '. Decidimos trabajar al aire libre, intentando refrescar un poco nuestras ideas antes de enfrentarnos a semejante tarea. Salimos y nos topamos con un calor sofocante, ',
          },
        },
        { text: { en: 'typical of summer', es: 'propio del verano' }, style: 'crossed' },
        {
          text: {
            en: " unusual for this time of year, with all the rain and cold weather we'd had.",
            es: ' inusual este año, con tantas lluvias y tiempo frío.',
          },
        },
      ],
      [
        {
          text: {
            en: 'We were looking for somewhere to sit down, eat, and ',
            es: 'Buscábamos un lugar donde sentarnos a comer y ',
          },
        },
        { text: { en: 'work on the taxes', es: 'trabajar en los impuestos' }, style: 'empty' },
        { text: { en: ' but ', es: ' pero ' } },
        { text: { en: 'we felt too lazy', es: 'nos daba pereza' }, style: 'crossed' },
        {
          text: {
            en: " we didn't feel like going far, so we decided to sit down at one of the ",
            es: ' no nos apetecía ir muy lejos, así que decidimos sentarnos en uno de los ',
          },
        },
        { text: { en: 'restaurants nearby', es: 'restaurantes de la zona' }, style: 'empty' },
        { text: { en: '.', es: '.' } },
      ],
      [
        {
          text: {
            en: 'What stood out most about this ',
            es: 'Lo más que identificaba este ',
          },
        },
        { text: { en: 'restaurant', es: 'restaurante' }, style: 'empty' },
        {
          text: {
            en: ' was the symbol decorating it, ',
            es: ' era el símbolo que lo decoraba, ',
          },
        },
        { text: { en: 'I could describe it', es: 'podría describirlo' }, style: 'crossed' },
        {
          text: {
            en: ' certainly with some unique features, that reminded me of this riddle:',
            es: ' ciertamente con unas características únicas, que me hicieron recordar este acertijo:',
          },
        },
      ],
    ],
    narrativeRiddle: {
      poem: {
        en: "I hold fire trapped within my heart,\nthough cold to the touch I tend to be.\nI am the red lip of passion's art,\nand on kings’ crowns I gleam for all to see.\nI'm not a rose, yet I share its hue,\nand after diamonds, few outvalue.\nWhat am I?",
        es: 'Tengo fuego atrapado en el corazón,\naunque frío al tacto suelo estar.\nSoy el labio rojo de la pasión,\ny en coronas de reyes me verás deslumbrar.\nNo soy una rosa, pero comparto su color,\ny tras el diamante, pocos superan mi valor.\n¿Qué soy?',
      },
      acceptedAnswers: [{ en: 'ruby', es: 'rubí' }],
      hints: [
        {
          en: 'Think of something small, red, and valuable.',
          es: 'Piensa en algo pequeño, rojo y valioso.',
        },
        {
          en: "It's a gemstone, the same color as a rose.",
          es: 'Es una piedra preciosa, del mismo color que una rosa.',
        },
        { en: "It's a ruby.", es: 'Es un rubí.' },
      ],
    },
    location: {
      lat: 28.1296718,
      lng: -15.4454363,
      radiusMeters: 40,
      label: { en: 'Ruby restaurant', es: 'Restaurante Rubí' },
    },
    minigame: {
      kind: 'riddle-mc',
      prompt: {
        en: 'What did we eat that day?',
        es: '¿Qué comimos ese día?',
      },
      options: [
        { en: 'fried eggs over potatoes', es: 'Huevos rotos' },
        { en: 'Fried marinated pork', es: 'Cerdo frito en adobo' },
        { en: 'Canarian wrinkly potatoes', es: 'Papas arrugadas' },
        { en: 'Russian potato salad', es: 'Ensaladilla rusa' },
      ],
      correctIndex: 0,
      hints: [
        {
          en: "It's a classic Spanish comfort dish with something breakfast-y in the name.",
          es: 'Es un plato español clásico con algo típico del desayuno en el nombre.',
        },
        {
          en: 'Fried potatoes topped with eggs, the yolks broken right over them.',
          es: 'Patatas fritas cubiertas de huevos, con la yema rota encima.',
        },
        { en: 'Huevos rotos.', es: 'Huevos rotos.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'multiple-choice',
      question: {
        en: 'What were we going to do at the restaurant?',
        es: '¿Qué íbamos a hacer en el restaurante?',
      },
      options: [
        { en: 'Watch the football game', es: 'Ver el fútbol' },
        { en: 'Drink until nightfall', es: 'Beber hasta la noche' },
        { en: 'Fill out the taxes', es: 'Cumplimentar los impuestos' },
        { en: 'Talk about the weather', es: 'Hablar sobre el tiempo' },
      ],
      correctIndex: 2,
      hints: [
        {
          en: "It wasn't fun, but it needed to get done before a deadline.",
          es: 'No era divertido, pero había que hacerlo antes de una fecha límite.',
        },
        {
          en: "It involved paperwork we'd been putting off all week.",
          es: 'Implicaba papeleo que llevábamos toda la semana posponiendo.',
        },
        { en: 'Fill out the taxes.', es: 'Cumplimentar los impuestos.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter R in your notebook — you'll need it later.",
      es: 'Escribe la letra R en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-2-park-bench',
    order: 2,
    chapterIcon: '🌇',
    chapterImage: 'scavenger-hunt/photos/hippo.png',
    pageNumber: 158,
    isFinale: false,
    title: { en: 'The Bench We Kept Coming Back To', es: 'La Banca a la que Siempre Volvimos' },
    narrative: {
      en: "We were hungry again, as usual, and wanted to try somewhere new. We remembered that Roberth had recommended a rather peculiar place. The entrance felt like a sauna, the heat was overwhelming. We ordered some chicken wings and a four-cheese pizza. That's when she told me about her friends from the lawyers' gossip group, and each one's family problems. The food was so good that we went back for seconds three more times, the last one ordering a tasty pizza because we realized we were turning into pigs, we needed to focus on eating well and not overdoing it. This other restaurant has a very distinctive name, maybe because of how you end up after eating, because it's something the owners really like; every time I see it, I think of that riddle.",
      es: 'Volvíamos a tener hambre como de costumbre y queríamos probar un sitio nuevo. Recordamos que Roberth nos recomendó un lugar un tanto particular. La entrada parecía una sauna, el calor era agobiante. Nos pedimos unas alitas de pollo y una pizza 4 quesos. Ahí me contó sobre sus amigas del grupo de los chismes de abogadas, los problemas familiares de cada una. La comida estuvo muy buena, tanto que repetimos hasta tres veces más, la última pidiendo una pizza sabrosa porque vimos que nos estábamos poniendo como cochinos, debíamos centrarnos en cuidar nuestra alimentación y no abusar. Este otro restaurante tiene un nombre muy característico, quizás por como acabas después de comer, porque es algo que le gusta mucho a los dueños; cada vez que lo veo, pienso en aquél acertijo.',
    },
    narrativeRich: [
      [
        { text: { en: 'We were hungry again, ', es: 'Volvíamos a tener hambre ' } },
        { text: { en: 'as usual', es: 'como de costumbre' }, style: 'crossed' },
        {
          text: {
            en: ' and wanted to try somewhere new. We remembered that ',
            es: ' y queríamos probar un sitio nuevo. Recordamos que ',
          },
        },
        { text: { en: 'Roberth', es: 'Roberth' }, style: 'empty' },
        {
          text: {
            en: ' had recommended a rather peculiar place. The entrance felt like a sauna, the ',
            es: ' nos recomendó un lugar un tanto particular. La entrada parecía una sauna, el ',
          },
        },
        { text: { en: 'heat', es: 'calor' }, style: 'empty' },
        {
          text: {
            en: ' was overwhelming. We ordered some ',
            es: ' era agobiante. Nos pedimos unas ',
          },
        },
        { text: { en: 'chicken wings', es: 'alitas de pollo' }, style: 'empty' },
        { text: { en: ' and a ', es: ' y una ' } },
        { text: { en: 'four-cheese pizza', es: 'pizza 4 quesos' }, style: 'empty' },
        {
          text: {
            en: ". That's when she told me about her friends from the lawyers' ",
            es: '. Ahí me contó sobre sus amigas del grupo de los ',
          },
        },
        { text: { en: 'gossip', es: 'chismes' }, style: 'crossed' },
        {
          text: {
            en: ' group, and each one’s family problems.',
            es: ' de abogadas, los problemas familiares de cada una.',
          },
        },
      ],
      [
        {
          text: {
            en: 'The food was so good that we went back for seconds three more times, the last one ordering ',
            es: 'La comida estuvo muy buena, tanto que repetimos hasta tres veces más, la última pidiendo ',
          },
        },
        { text: { en: 'a tasty pizza', es: 'una pizza sabrosa' }, style: 'empty' },
        { text: { en: ' because we realized ', es: ' porque vimos que ' } },
        {
          text: {
            en: 'we were turning into pigs',
            es: 'nos estábamos poniendo como cochinos',
          },
          style: 'crossed',
        },
        {
          text: {
            en: ' we needed to focus on eating well and not overdoing it.',
            es: ' debíamos centrarnos en cuidar nuestra alimentación y no abusar.',
          },
        },
      ],
      [
        { text: { en: 'This other ', es: 'Este otro ' } },
        { text: { en: 'restaurant', es: 'restaurante' }, style: 'empty' },
        {
          text: {
            en: ' has a very distinctive name, maybe ',
            es: ' tiene un nombre muy característico, quizás ',
          },
        },
        {
          text: {
            en: 'because of how you end up after eating',
            es: 'por como acabas después de comer',
          },
          style: 'crossed',
        },
        {
          text: {
            en: " because it's something the owners really like; every time I see it, I think of that riddle:",
            es: ' porque es algo que le gusta mucho a los dueños; cada vez que lo veo, pienso en aquél acertijo:',
          },
        },
      ],
    ],
    narrativeRiddle: {
      poem: {
        en: 'In the water I float calm though I weigh more than a ton,\nmy skin is very thick and my mouth a giant span.\nI\'m named "river horse" by the ancient Greek tongue,\nand though I seem clumsy, in water I\'m a giant among.\nWho am I?',
        es: 'En el agua floto tranquilo aunque peso más de una tonelada,\nmi piel es muy gruesa y mi boca una enorme enramada.\nTengo nombre de "caballo de río" según el griego antiguo,\ny aunque parezca torpe, en el agua soy un gigante contiguo.\n¿Quién soy?',
      },
      acceptedAnswers: [
        { en: 'hippopotamus', es: 'hipopótamo' },
        { en: 'hippo', es: 'hipopótamo' },
      ],
      hints: [
        {
          en: "It's a huge animal that spends most of its time in rivers and lakes.",
          es: 'Es un animal enorme que pasa la mayor parte del tiempo en ríos y lagos.',
        },
        {
          en: "Its name literally means 'river horse' in Greek.",
          es: "Su nombre significa literalmente 'caballo de río' en griego.",
        },
        { en: "It's a hippopotamus.", es: 'Es un hipopótamo.' },
      ],
    },
    location: {
      lat: 28.130502,
      lng: -15.4470371,
      radiusMeters: 40,
      label: { en: 'Hippo pizzeria', es: 'Pizzería Hipopótamo' },
    },
    minigame: {
      kind: 'word-scramble',
      prompt: {
        en: 'Unscramble the drink you had with our chicken wings.',
        es: 'Desordena las letras de la bebida que tomaste con las alitas de pollo.',
      },
      answer: { en: 'SANGRIA', es: 'SANGRÍA' },
      hints: [
        {
          en: "It's a fruity Spanish drink, usually red.",
          es: 'Es una bebida española afrutada, normalmente roja.',
        },
        {
          en: 'Made with wine, chopped fruit, and a splash of something sweet.',
          es: 'Se hace con vino, fruta troceada y un toque de algo dulce.',
        },
        { en: 'Sangria.', es: 'Sangría.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'free-text',
      question: {
        en: 'What did he eat with two eggs that looked like a mountain of food?',
        es: '¿Qué comió él con dos huevos que parecía un montón de comida?',
      },
      acceptedAnswers: [{ en: 'milanesa', es: 'milanesa' }],
      hints: [
        {
          en: "It's a big breaded cutlet, crispy on the outside.",
          es: 'Es una gran carne empanada, crujiente por fuera.',
        },
        {
          en: 'Usually beef or chicken, fried until golden, topped with two fried eggs.',
          es: 'Normalmente de carne o pollo, frita hasta dorar, con dos huevos fritos encima.',
        },
        { en: 'Milanesa.', es: 'Milanesa.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter O in your notebook — you'll need it later.",
      es: 'Escribe la letra O en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-3-bookstore',
    order: 3,
    chapterIcon: '📚',
    chapterImage: 'scavenger-hunt/photos/krauss.png',
    pageNumber: 23,
    isFinale: false,
    title: {
      en: 'The Bookstore Neither of Us Left Empty-Handed',
      es: 'La Librería de la que Ninguno Salió con las Manos Vacías',
    },
    narrative: {
      en: "I was waiting for her, she had told me she'd made plans with some friends and would be back soon, so I sat down to wait for her in the shade of the statue. She wanted to surprise me, and when she got close she gave a little jump trying to scare me. Instead, what it got out of me was a big smile, from how adorable it was. That day, like many others, we decided to walk along the beach. We walked side by side, while I listened to her tell her incredible stories. She told me about her experiences, what she'd learned from them, how much she's grown since then... I listened patiently, unknowingly being pulled into that huge world hidden inside that small creature. Walking along the beach had become a habit, since it let us hear the murmur of the waves and watch the sunset. One day, we even kept walking, further than our usual stopping point, until we reached a hidden lookout point where very few people go. The statue where I waited for her belongs to a famous person with a particular surname, one that could be expressed as a riddle.",
      es: 'Estaba esperando por ella, me había dicho que había quedado con unas amigas y que volvería pronto, así que me senté a esperarla a la sombra de la estatua. Ella quiso sorprenderme y cuando estuvo cerca de mí dio un pequeño salto intentando asustarme. En vez de eso, lo que me sacó fue una gran sonrisa, por ese acto adorable. Ese día, como muchos otros decidimos caminar por la playa. Caminábamos uno al lado del otro, mientras la escuchaba narrar sus increíbles historias. Me contaba sobre sus vivencias, lo que había aprendido de ellas, cuánto ha crecido desde entonces... Yo la escuchaba pacientemente, siendo absorbido sin saberlo por ese gran mundo que esconde esa pequeña criatura. Pasear por la playa se había convertido en un hábito, ya que nos permitía oír el murmullo de las olas y ver la puesta de sol. Un día, incluso seguimos caminando, más allá de nuestro tope habitual, hasta llegar a un recóndito mirador donde muy pocas personas van. La estatua donde la esperé pertenece a una persona famosa con un apellido particular, que podría expresarse en forma de acertijo.',
    },
    narrativeRich: [
      [
        {
          text: {
            en: "I was waiting for her, she had told me she'd made plans with some friends and would be back soon, so I sat down to wait for her ",
            es: 'Estaba esperando por ella, me había dicho que había quedado con unas amigas y que volvería pronto, así que me senté a esperarla ',
          },
        },
        {
          text: { en: 'in the shade of the statue', es: 'a la sombra de la estatua' },
          style: 'empty',
        },
        {
          text: {
            en: '. She wanted to surprise me, and when she got close she gave a little jump trying to scare me. Instead, what it got out of me was a big smile, from how adorable it was. ',
            es: '. Ella quiso sorprenderme y cuando estuvo cerca de mí dio un pequeño salto intentando asustarme. En vez de eso, lo que me sacó fue una gran sonrisa, por ese acto adorable. ',
          },
        },
        {
          text: {
            en: "Of course it didn't scare me, because I'm a very strong man",
            es: 'Por supuesto no me asustó porque soy un hombre muy fuerte',
          },
          style: 'crossed',
        },
        {
          text: {
            en: ' That day, like many others, we decided to walk along the ',
            es: ' Ese día, como muchos otros decidimos caminar por la ',
          },
        },
        { text: { en: 'beach', es: 'playa' }, style: 'empty' },
        {
          text: {
            en: '. We walked side by side, while I listened to her tell her incredible stories. ',
            es: '. Caminábamos uno al lado del otro, mientras la escuchaba narrar sus increíbles historias. ',
          },
        },
        {
          text: {
            en: 'Sometimes she mentioned her exes a lot',
            es: 'Algunas veces mencionaba mucho a sus ex parejas',
          },
          style: 'crossed',
        },
        {
          text: {
            en: " She told me about her experiences, what she'd learned from them, how much she's grown since then... I listened patiently, unknowingly being pulled into that huge world hidden inside that small creature.",
            es: ' Me contaba sobre sus vivencias, lo que había aprendido de ellas, cuánto ha crecido desde entonces... Yo la escuchaba pacientemente, siendo absorbido sin saberlo por ese gran mundo que esconde esa pequeña criatura.',
          },
        },
      ],
      [
        { text: { en: 'Walking along the ', es: 'Pasear por la ' } },
        { text: { en: 'beach', es: 'playa' }, style: 'empty' },
        { text: { en: ' had become a habit, ', es: ' se había convertido en un hábito, ' } },
        {
          text: {
            en: 'mostly for lack of transport',
            es: 'principalmente por falta de transporte',
          },
          style: 'crossed',
        },
        {
          text: {
            en: ' since it let us hear the murmur of the ',
            es: ' ya que nos permitía oír el murmullo de las ',
          },
        },
        { text: { en: 'waves', es: 'olas' }, style: 'empty' },
        {
          text: {
            en: ' and watch the sunset. One day, we even kept walking, further than our usual stopping point, until we reached a hidden ',
            es: ' y ver la puesta de sol. Un día, incluso seguimos caminando, más allá de nuestro tope habitual, hasta llegar a un recóndito ',
          },
        },
        { text: { en: 'lookout point', es: 'mirador' }, style: 'empty' },
        { text: { en: ' where very few people go.', es: ' donde muy pocas personas van.' } },
      ],
      [
        {
          text: {
            en: 'The statue where I waited for her belongs to a famous person with a particular surname, one that could be expressed as a riddle:',
            es: 'La estatua donde la esperé pertenece a una persona famosa con un apellido particular, que podría expresarse en forma de acertijo:',
          },
        },
      ],
    ],
    narrativeRiddle: {
      poem: {
        en: "On an island where the sun burns bright,\na tenor was born with a stellar voice,\nyet his surname comes from another home:\nfrom northern winds, far from the sea's noise.\nIt starts like the first letter of a ship in port,\nfollowed by the call of a singing bird,\nand ends resounding with a bronze report,\nlike the music of a great German master's word.\nWhat surname is it?",
        es: 'En una isla donde el sol vibra,\nnació un tenor de voz estelar,\npero su nombre es de otra cuna:\nde vientos del norte, lejanos del mar.\nEmpieza como la primera letra de un barco en el puerto,\nsigue la voz de un ave al cantar,\ny al final resuena con fuerza de bronce,\ncomo la música de un gran compositor alemán.\n¿Qué apellido es?',
      },
      acceptedAnswers: [
        { en: 'Krauss', es: 'Krauss' },
        { en: 'Kraus', es: 'Kraus' },
      ],
      hints: [
        {
          en: 'He was a world-famous tenor born right here in the Canary Islands.',
          es: 'Fue un tenor de fama mundial nacido aquí mismo, en Canarias.',
        },
        {
          en: 'His surname sounds German, though he was born in Las Palmas de Gran Canaria.',
          es: 'Su apellido suena alemán, aunque nació en Las Palmas de Gran Canaria.',
        },
        { en: 'Kraus.', es: 'Kraus.' },
      ],
    },
    location: {
      lat: 28.1301049,
      lng: -15.4491612,
      radiusMeters: 40,
      label: { en: "Alfredo Kraus's statue", es: 'Estatua Alfredo Kraus' },
    },
    minigame: {
      kind: 'wordle-guess',
      prompt: {
        en: 'Our new favorite place to eat burgers is called...',
        es: 'Nuestro nuevo lugar favorito para comer hamburguesas se llama...',
      },
      targetWord: { en: 'CHEDDAR', es: 'CHEDDAR' },
      maxGuesses: 6,
      hints: [
        {
          en: "It's a type of cheese, often orange.",
          es: 'Es un tipo de queso, a menudo de color naranja.',
        },
        {
          en: 'A classic burger topping, sharp and melty.',
          es: 'Un topping clásico de hamburguesa, fuerte y derretible.',
        },
        { en: 'Cheddar.', es: 'Cheddar.' },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'multiple-choice',
      question: {
        en: 'On our fourth date, she took a photo with...:',
        es: 'En nuestra cuarta cita, ella se sacó una foto con...:',
      },
      options: [
        { en: 'A horse', es: 'Un caballo' },
        { en: 'A flower in her hair', es: 'Una flor en el cabello' },
        { en: 'A sports car', es: 'Un coche deportivo' },
        { en: 'A frog holding a phone', es: 'Una rana con un teléfono' },
      ],
      correctIndex: 3,
      hints: [
        {
          en: "It wasn't a person, or even a mammal.",
          es: 'No era una persona, ni siquiera un mamífero.',
        },
        {
          en: 'It was small, green, and holding something surprisingly modern.',
          es: 'Era pequeño, verde, y sostenía algo sorprendentemente moderno.',
        },
        { en: 'A frog holding a phone.', es: 'Una rana con un teléfono.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter M in your notebook — you'll need it later.",
      es: 'Escribe la letra M en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-4-road-trip',
    order: 4,
    chapterIcon: '🚗',
    chapterImage: 'scavenger-hunt/photos/girl.png',
    pageNumber: 56,
    isFinale: false,
    title: {
      en: 'The Trip We Definitely Under-Planned',
      es: 'El Viaje que Definitivamente No Planeamos Bien',
    },
    narrative: {
      en: "We had argued and things weren't looking good. That day I got a message from her, asking me to come see her. She gave me her location with just a photo, expecting me to guess where she was. I found her lying on the towel, asleep, with her fisherman hat covering her face. I knelt down on the sand and leaned over her to kiss her. She woke up immediately, half surprised and half smiling. We sat together enjoying the evening by the sea, until night fell. Other things happened that I'll leave to the reader's imagination. What I do remember is that a few meters further on, there was a gym where a lot of people go every day, some without wanting to but forced to. If I had to describe it, I'd use the following riddle.",
      es: 'Habíamos discutido y la cosa no pintaba bien. Ese día recibí un mensaje de ella, pidiéndome que fuese a verla. Me dio su ubicación solo con una foto, esperando que yo adivinara dónde estaba. Me la encontré tumbada sobre la toalla, dormida, con su sombrero de pescador cubriéndole la cara. Apoyé una rodilla sobre la arena y me incliné sobre ella para besarla. Ella despertó inmediatamente, entre sorprendida y sonriendo. Nos sentamos juntos a disfrutar de la tarde frente al mar, hasta que se hizo de noche. Ocurrieron otras cosas que dejaré a la imaginación del lector. Lo que si recuerdo, es que a unos pocos metros más adelante, había un gimnasio donde mucha gente va todos los días, algunos sin ganas pero obligados. Si tuviera que describirlo, usaría el siguiente acertijo.',
    },
    narrativeRich: [
      [
        {
          text: {
            en: 'We had argued and things weren’t looking good. That day I got a message from her, asking me to come see her ',
            es: 'Habíamos discutido y la cosa no pintaba bien. Ese día recibí un mensaje de ella, pidiéndome que fuese a verla ',
          },
        },
        {
          text: { en: 'in a very convincing way', es: 'de una manera muy convincente' },
          style: 'crossed',
        },
        {
          text: {
            en: '. She gave me her location with just a photo, expecting me to guess where she was. I found her lying on the towel, asleep, with her ',
            es: '. Me dio su ubicación solo con una foto, esperando que yo adivinara dónde estaba. Me la encontré tumbada sobre la toalla, dormida, con su ',
          },
        },
        { text: { en: 'fisherman hat', es: 'sombrero de pescador' }, style: 'empty' },
        { text: { en: ' covering her face.', es: ' cubriéndole la cara.' } },
      ],
      [
        {
          text: {
            en: 'I knelt down on the sand and leaned over her ',
            es: 'Apoyé una rodilla sobre la arena y me incliné sobre ella ',
          },
        },
        { text: { en: 'to kiss her', es: 'para besarla' }, style: 'empty' },
        {
          text: {
            en: '. She woke up immediately, half surprised and half smiling. We sat together enjoying the evening by the sea, until night fell. ',
            es: '. Ella despertó inmediatamente, entre sorprendida y sonriendo. Nos sentamos juntos a disfrutar de la tarde frente al mar, hasta que se hizo de noche. ',
          },
        },
        {
          text: { en: 'What happened that night', es: 'Lo que ocurrió esa noche' },
          style: 'crossed',
        },
        {
          text: {
            en: " Other things happened that I'll leave to the reader's imagination. What I do remember is that a few meters further on, there was a ",
            es: ' Ocurrieron otras cosas que dejaré a la imaginación del lector. Lo que si recuerdo, es que a unos pocos metros más adelante, había un ',
          },
        },
        { text: { en: 'gym', es: 'gimnasio' }, style: 'empty' },
        {
          text: {
            en: " where a lot of people go every day, some without wanting to but forced to. If I had to describe it, I'd use the following riddle:",
            es: ' donde mucha gente va todos los días, algunos sin ganas pero obligados. Si tuviera que describirlo, usaría el siguiente acertijo:',
          },
        },
      ],
    ],
    narrativeRiddle: {
      poem: {
        en: 'House of iron and sweat, where time stands still\nwhile distance advances without leaving the ground.\nHere weight is sought out, and load brings no chill,\nit lifts the warrior who comes to challenge iron\'s sound.\nThey count here in repetitions, not in words or lore,\nand though you enter to break down, you leave stronger than before.\nWhat place am I?',
        es: 'Casa de hierro y sudor, donde el tiempo se detiene\nmientras la distancia avanza sin moverse del lugar.\nDonde la carga se busca y el peso no desanima,\nsino que eleva al guerrero que al metal viene a retar.\nCuentan aquí por repeticiones, no por palabras ni historias,\ny aunque entras para romperte, sales con más fortaleza.\n¿Qué lugar soy?',
      },
      acceptedAnswers: [
        { en: 'gym', es: 'gimnasio' },
        { en: 'gymnasium', es: 'gimnasio' },
      ],
      hints: [
        {
          en: "It's a place people go to get stronger, often complaining the whole time.",
          es: 'Es un lugar al que la gente va para ponerse fuerte, a menudo quejándose todo el rato.',
        },
        {
          en: 'Full of weights, machines, and mirrors everywhere.',
          es: 'Lleno de pesas, máquinas y espejos por todas partes.',
        },
        { en: "It's a gym.", es: 'Es un gimnasio.' },
      ],
    },
    location: {
      lat: 28.1327056,
      lng: -15.4428304,
      radiusMeters: 40,
      label: { en: 'The gym', es: 'El gimnasio' },
    },
    minigame: {
      kind: 'sequence-reorder',
      prompt: {
        en: 'Put the events in the right order.',
        es: 'Ordena los hechos correctamente.',
      },
      itemsInCorrectOrder: [
        { en: 'She texted me on WhatsApp', es: 'Me escribió un mensaje de WhatsApp' },
        { en: 'I found her lying down', es: 'La encontré acostada' },
        { en: 'We spent the afternoon together', es: 'Pasamos la tarde juntos' },
        { en: 'We left together that night', es: 'Nos fuimos juntos en la noche' },
      ],
      hints: [
        { en: 'It starts with a message.', es: 'Empieza con un mensaje.' },
        {
          en: 'Finding her came before the afternoon together.',
          es: 'Encontrarla vino antes de la tarde juntos.',
        },
        {
          en: 'WhatsApp message, found her lying down, afternoon together, left at night.',
          es: 'Mensaje de WhatsApp, la encontré acostada, tarde juntos, nos fuimos de noche.',
        },
      ],
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    notebookInstruction: {
      en: "Write the letter A in your notebook — you'll need it later.",
      es: 'Escribe la letra A en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-5-concert',
    order: 5,
    chapterIcon: '🎵',
    chapterImage: 'scavenger-hunt/photos/sandwich.png',
    pageNumber: 4,
    isFinale: false,
    title: {
      en: 'The Concert With the Terrible Seats',
      es: 'El Concierto de los Asientos Terribles',
    },
    narrative: {
      en: "We'd been talking for hours, getting to know each other. We decided to sit down on some stone steps, since we'd been walking for a good while. It was still very cold, and the salty sea air wasn't helping much either. She started to notice she was losing her voice, so we decided to go get something to soothe our throats and warm us up. At the café we ordered water, a coffee with milk, and a small chocolate-filled croissant that we shared between the two of us. She kept telling me about her adventures, like how she'd worked for the government and seen things she didn't like, how she'd wanted to change the system from within but found it was too complicated, and that her own needs made the situation harder. She sounded melancholic telling those stories, with a hint of frustration, as if wishing she could have done more to change things. It was starting to get dark when we decided to end the date. I walked her close to home before we parted ways so I could continue on mine — what was the name of that place where we ate? All that comes to mind is this riddle.",
      es: 'Llevábamos varias horas hablando, conociéndonos el uno al otro. Decidimos sentarnos en unos escalones de piedra, ya que llevábamos un buen rato caminando. Todavía hacía mucho frío y el aire salado del mar tampoco ayudaba mucho. Ella empezó a notar que estaba perdiendo la voz así que decidimos ir a tomar algo para hidratar la garganta y que nos ayude a entrar en calor. En la cafetería pedimos agua, café con leche y un pequeño croissant relleno de chocolate que compartimos entre los dos. Ella me seguía contando sobre sus aventuras, como trabajó para el gobierno y vio cosas que no le gustaron, como quería cambiar el sistema desde dentro pero se encontró con que era demasiado complicado y que sus propias necesidades le complicaban la situación. Se la escuchaba melancólica narrando esas historias, con un deje de frustración, como deseando haber podido hacer más para cambiar la situación. Ya empezaba a hacerse de noche cuando decidimos terminar la cita. La acompañé hasta cerca de su casa antes de separarnos para continuar mi camino ¿cuál era el nombre de ese sitio en el que comimos? solo me viene a la mente este acertijo.',
    },
    narrativeRich: [
      [
        {
          text: {
            en: 'She had been talking to me for hours',
            es: 'Ella llevaba varias horas hablándome',
          },
          style: 'crossed',
        },
        {
          text: {
            en: " We'd been talking for hours, getting to know each other. We decided to sit down on some ",
            es: ' Llevábamos varias horas hablando, conociéndonos el uno al otro. Decidimos sentarnos en unos ',
          },
        },
        { text: { en: 'stone steps', es: 'escalones de piedra' }, style: 'empty' },
        {
          text: {
            en: ", since we'd been walking for a good while. It was still very cold, and the salty sea air wasn't helping much either. ",
            es: ', ya que llevábamos un buen rato caminando. Todavía hacía mucho frío y el aire salado del mar tampoco ayudaba mucho. ',
          },
        },
        {
          text: {
            en: 'She was starting to lose her voice',
            es: 'Ella se estaba quedando afónica',
          },
          style: 'crossed',
        },
        {
          text: {
            en: ' She started to notice she was losing her voice, so we decided to go get something to soothe our throats and warm us up.',
            es: ' Ella empezó a notar que estaba perdiendo la voz así que decidimos ir a tomar algo para hidratar la garganta y que nos ayude a entrar en calor.',
          },
        },
      ],
      [
        { text: { en: 'At the ', es: 'En la ' } },
        { text: { en: 'café', es: 'cafetería' }, style: 'empty' },
        {
          text: {
            en: ' we ordered water, a coffee with milk, and a small chocolate-filled croissant that we shared between the two of us. She kept telling me about her ',
            es: ' pedimos agua, café con leche y un pequeño croissant relleno de chocolate que compartimos entre los dos. Ella me seguía contando sobre sus ',
          },
        },
        { text: { en: 'misadventures', es: 'desventuras' }, style: 'empty' },
        {
          text: {
            en: " adventures, like how she'd worked for the government and seen things she didn't like, how she'd wanted to change the system from within but found it was too complicated, and that her own needs made the situation harder. She sounded melancholic telling those stories, with a hint of frustration, as if wishing she could have done more to change things. It was starting to get dark when we decided to end the ",
            es: ' aventuras, como trabajó para el gobierno y vio cosas que no le gustaron, como quería cambiar el sistema desde dentro pero se encontró con que era demasiado complicado y que sus propias necesidades le complicaban la situación. Se la escuchaba melancólica narrando esas historias, con un deje de frustración, como deseando haber podido hacer más para cambiar la situación. Ya empezaba a hacerse de noche cuando decidimos terminar la ',
          },
        },
        { text: { en: 'date', es: 'cita' }, style: 'empty' },
        {
          text: {
            en: ". I walked her close to home before we parted ways so I could continue on mine — what was the name of that place where we ate? All that comes to mind is this riddle:",
            es: '. La acompañé hasta cerca de su casa antes de separarnos para continuar mi camino ¿cuál era el nombre de ese sitio en el que comimos? solo me viene a la mente este acertijo:',
          },
        },
      ],
    ],
    narrativeRiddle: {
      poem: {
        en: 'You\'ll find me as the day begins,\nwhen the aroma lets joy in.\nBread, sweets, and coffee fill the air,\nand many come to breakfast there.\nMy name ends just like "ier",\ndo you know what place I could be?',
        es: 'Me encuentras al empezar el día,\ncuando el aroma abre la alegría.\nPan, dulces y café suelen estar,\ny muchos vienen aquí a desayunar.\nMi nombre termina con "ier",\n¿sabes qué lugar puede ser?',
      },
      acceptedAnswers: [{ en: 'Granier', es: 'Granier' }],
      hints: [
        {
          en: "It's a bakery-café chain known for its fresh bread and pastries.",
          es: 'Es una cadena de panadería-cafetería conocida por su pan y bollería recién hecha.',
        },
        {
          en: "Its name sounds French, and it ends in '-ier'.",
          es: "Su nombre suena francés, y termina en '-ier'.",
        },
        { en: 'Granier.', es: 'Granier.' },
      ],
    },
    location: {
      lat: 28.1319019,
      lng: -15.4463558,
      radiusMeters: 40,
      label: { en: 'Coffee shop Granier', es: 'Cafetería Granier' },
    },
    minigame: {
      kind: 'sliding-tile-puzzle',
      prompt: {
        en: 'Slide the tiles to piece the memory back together.',
        es: 'Desliza las piezas para reconstruir el recuerdo.',
      },
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
        en: 'Which famous person was the movie we went to see at the cinema about?',
        es: '¿De qué personaje famoso era la película que fuimos a ver al cine?',
      },
      acceptedAnswers: [{ en: 'Michael Jackson', es: 'Michael Jackson' }],
      hints: [
        {
          en: "He was famous for his music, not for acting in this movie.",
          es: 'Era famoso por su música, no por actuar en esta película.',
        },
        { en: "Known as the 'King of Pop'.", es: "Conocido como el 'Rey del Pop'." },
        { en: 'Michael Jackson.', es: 'Michael Jackson.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter N in your notebook — you'll need it later.",
      es: 'Escribe la letra N en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-6-beach',
    order: 6,
    chapterIcon: '🏖️',
    chapterImage: 'scavenger-hunt/photos/ramen.png',
    pageNumber: 2,
    isFinale: false,
    title: { en: 'The Beach Day That Ran Too Long', es: 'El Día de Playa que se Alargó Demasiado' },
    narrative: {
      en: "It was the next day. We'd agreed to meet in front of the Japanese restaurant in the morning. She was wearing a white coat and a checkered scarf in white, black, and gray. At first she didn't recognize me; that was normal, we'd only seen each other for five minutes the day before at the bus stop. Still, she greeted me happily when she saw me. At the restaurant we ordered one of the place's signature dishes, ramen, plus some starters, gyozas. She started her introduction in a pretty unusual way, but always with a big smile on her face. I found her lovely from the very first moment I saw her; her warmth quickly wrapped around me and made me want to know more about her. So much so that we spent almost seven hours together that day. Also, the food at that place was really good but I've forgotten the name of that dish... I think it was something like the answer to this riddle.",
      es: 'Era el día siguiente. Habíamos acordado vernos delante del restaurante japonés por la mañana. Ella llevaba abrigo blanco y un pañuelo a cuadros con colores blanco, negro y gris. De primeras no me reconoció; era normal, solo nos habíamos visto cinco minutos el día anterior en la marquesina. Sin embargo me saludó con alegría al verme. En el restaurante pedimos uno de los platos característicos del local, ramen, además de unos entrantes, gyozas. Ella empezó su presentación de una forma bastante inusual, pero siempre con una gran sonrisa en la cara. Me pareció muy linda desde el primer momento en que la vi; su calidez pronto me envolvió y me hizo querer saber más de ella. Tanto fue así que pasamos casi siete horas juntos ese día. Además, la comida de ese sitio estaba muy buena pero se me ha olvidado el nombre de ese plato... creo que era algo como la solución de este acertijo.',
    },
    narrativeRich: [
      [
        {
          text: {
            en: "It was the next day. We'd agreed to meet in front of the ",
            es: 'Era el día siguiente. Habíamos acordado vernos delante del ',
          },
        },
        { text: { en: 'Japanese restaurant', es: 'restaurante japonés' }, style: 'empty' },
        {
          text: {
            en: ' in the morning. She was wearing ',
            es: ' por la mañana. Ella llevaba ',
          },
        },
        {
          text: {
            en: 'an unflattering furry jacket',
            es: 'una chaqueta de pelos poco agraciada',
          },
          style: 'crossed',
        },
        {
          text: {
            en: " a white coat and a checkered scarf in white, black, and gray. At first she didn't recognize me; that was normal, we'd only seen each other for five minutes the day before at the ",
            es: ' abrigo blanco y un pañuelo a cuadros con colores blanco, negro y gris. De primeras no me reconoció; era normal, solo nos habíamos visto cinco minutos el día anterior en la ',
          },
        },
        { text: { en: 'bus stop', es: 'marquesina' }, style: 'empty' },
        {
          text: {
            en: '. Still, she greeted me happily when she saw me.',
            es: '. Sin embargo me saludó con alegría al verme.',
          },
        },
      ],
      [
        {
          text: {
            en: "At the restaurant we ordered one of the place's signature dishes, ",
            es: 'En el restaurante pedimos uno de los platos característicos del local, ',
          },
        },
        { text: { en: 'ramen', es: 'ramen' }, style: 'empty' },
        { text: { en: ' plus some starters, ', es: ' además de unos entrantes, ' } },
        { text: { en: 'gyozas', es: 'gyozas' }, style: 'empty' },
        { text: { en: '. She started her introduction ', es: '. Ella empezó su presentación ' } },
        {
          text: { en: 'talking to me about drugs', es: 'hablándome de drogas' },
          style: 'crossed',
        },
        {
          text: {
            en: " in a pretty unusual way, but always with a big smile on her face. I found her lovely from the very first moment I saw her; her warmth quickly wrapped around me and made me want to know more about her. So much so that we spent almost seven hours together that day. Also, the food at that place was really good but I've forgotten the name of that dish... I think it was something like the answer to this riddle:",
            es: ' de una forma bastante inusual, pero siempre con una gran sonrisa en la cara. Me pareció muy linda desde el primer momento en que la vi; su calidez pronto me envolvió y me hizo querer saber más de ella. Tanto fue así que pasamos casi siete horas juntos ese día. Además, la comida de ese sitio estaba muy buena pero se me ha olvidado el nombre de ese plato... creo que era algo como la solución de este acertijo:',
          },
        },
      ],
    ],
    narrativeRiddle: {
      poem: {
        en: "I'm not soup, though I carry broth.\nI'm not pasta, though I have noodles.\nI tend to travel by chopsticks,\nand I like to arrive piping hot.\nWhat am I?",
        es: 'No soy sopa, aunque llevo caldo.\nNo soy pasta, aunque tengo fideos.\nCon palillos suelo viajar,\ny bien caliente me gusta llegar.\n¿Qué soy?',
      },
      acceptedAnswers: [{ en: 'ramen', es: 'ramen' }],
      hints: [
        {
          en: "It's a Japanese dish, served piping hot in a bowl.",
          es: 'Es un plato japonés, servido bien caliente en un tazón.',
        },
        {
          en: 'Noodles in broth, often topped with egg and pork.',
          es: 'Fideos en caldo, a menudo con huevo y cerdo encima.',
        },
        { en: 'Ramen.', es: 'Ramen.' },
      ],
    },
    location: {
      lat: 28.140048,
      lng: -15.4379313,
      radiusMeters: 40,
      label: { en: 'Japanese restaurant', es: 'Restaurante japonés' },
    },
    minigame: {
      kind: 'shake-to-reveal',
      prompt: {
        en: 'Shake the sand off to see what we ate that day.',
        es: 'Sacude la arena para ver qué comimos ese día.',
      },
      revealedWord: { en: 'RAMEN', es: 'RAMEN' },
    },
    photoCheckpoint: { prompt: { en: 'Take a photo here', es: 'Toma una foto aquí' } },
    personalQuestion: {
      kind: 'multiple-choice',
      question: {
        en: 'What special place did we watch the sunset from on our fourth date?',
        es: '¿En qué lugar especial vimos la puesta de sol en la cuarta cita?',
      },
      options: [
        { en: 'The beach', es: 'La playa' },
        { en: 'A lighthouse', es: 'Un faro' },
        { en: 'A very tall rooftop', es: 'Una azotea muy alta' },
        { en: 'The mountain', es: 'La montaña' },
      ],
      correctIndex: 1,
      hints: [
        { en: "It wasn't at ground level.", es: 'No estaba a nivel del suelo.' },
        {
          en: 'It has a light that guides ships at night.',
          es: 'Tiene una luz que guía a los barcos por la noche.',
        },
        { en: 'A lighthouse.', es: 'Un faro.' },
      ],
    },
    notebookInstruction: {
      en: "Write the letter C in your notebook — you'll need it later.",
      es: 'Escribe la letra C en tu cuaderno — la necesitarás más tarde.',
    },
  },
  {
    id: 'stop-7-family-dinner',
    order: 7,
    chapterIcon: '🍽️',
    chapterImage: 'scavenger-hunt/photos/dance.png',
    pageNumber: 1,
    isFinale: false,
    title: {
      en: 'The Dinner Where You Met Everyone at Once',
      es: 'La Cena Donde Conociste a Todos a la Vez',
    },
    narrative: {
      en: "I had gone out as usual to practice some bachata. It was a Friday like any other, and my dance friends asked me to go out with them. There were quite a few people, as usual at that place, all happy to be able to practice something they're passionate about, that relaxes and entertains them. There, among all of them, was her. A small girl, with long black hair and big curious eyes full of life. In one of the workshops she was my dance partner, and that's where I asked her name. She told me a completely unexpected name; one more of the many things that drew me to her. I asked if she was new to the place and she said sort of, and that she wanted to learn to dance bachata. I mentioned I was at a dance school and that I could pass along the contact. We exchanged phone numbers and went our separate ways. That night we didn't run into each other again for the rest of the social. Later that night, on my way home, I texted her to send the info I'd promised and told her we could meet up sometime. Not only did she agree, but she also suggested meeting the very next day. And without even knowing it, that night our paths decided to intertwine, like a passionate embrace, joining not just our bodies but our hearts. A brief encounter that lasted barely a few minutes but unleashed a flood of emotions over weeks and even months, one that let us get to know each other deeply, that gave us the chance to become important to one another and fill our hearts with warmth. That moment happened while we were practicing something we have in common, something I can now only describe with this riddle.",
      es: 'Había salido como de costumbre a practicar algo de bachata. Era un viernes como otro cualquiera y los compañeros de baile me dijeron de salir con ellos. Había bastante gente como es habitual en ese lugar, todos contentos de poder practicar algo que les apasiona, relaja y divierte. Allí, entre todos ellos estaba ella. Una chica pequeña, con una larga melena negra y grandes ojos curiosos y llenos de vida. En uno de los talleres fue mi pareja de baile y ahí fue donde le pregunté su nombre. Ella me dijo un nombre totalmente inesperado; otra de las tantas cosas que me atrajo de ella. Le pregunté que si era nueva en el lugar y me dijo que más o menos y que quería aprender a bailar bachata. Le comenté que yo estaba en una academia y que le podía pasar el contacto. Intercambiamos nuestros números de teléfono y nos separamos. Esa noche no nos encontramos más en todo el tiempo que duró el social. Entrada la noche, al volver a casa, le escribí para mandarle los datos que le había prometido y le dije que podíamos quedar algún día. Ella no solo estuvo de acuerdo, sino que además me dijo de quedar al día siguiente. Y sin siquiera saberlo, esa noche nuestros destinos decidieron entrelazarse, como un abrazo apasionado, uniendo no solo nuestros cuerpos sino nuestros corazones. Un pequeño encuentro que duró apenas unos minutos y que desató un aluvión de emociones a lo largo de semanas e incluso meses, que nos permitió conocernos el uno al otro con mucha profundidad, que nos ofreció la oportunidad de ser alguien importante para el otro y llenar de calidez nuestros corazones. Ese momento ocurrió mientras practicábamos algo que tenemos en común, que ahora solo puedo describir con este acertijo.',
    },
    narrativeRich: [
      [
        {
          text: {
            en: 'I had gone out as usual to practice some ',
            es: 'Había salido como de costumbre a practicar algo de ',
          },
        },
        { text: { en: 'bachata', es: 'bachata' }, style: 'empty' },
        {
          text: {
            en: '. It was a Friday like any other, and my ',
            es: '. Era un viernes como otro cualquiera y los compañeros ',
          },
        },
        { text: { en: 'dance', es: 'de baile' }, style: 'empty' },
        {
          text: {
            en: " friends asked me to go out with them. There were quite a few people, as usual at that place, all happy to be able to practice something they're passionate about, that relaxes and entertains them. There, among all of them, was her. A small girl, ",
            es: ' me dijeron de salir con ellos. Había bastante gente como es habitual en ese lugar, todos contentos de poder practicar algo que les apasiona, relaja y divierte. Allí, entre todos ellos estaba ella. Una chica pequeña, ',
          },
        },
        { text: { en: 'with wild hair', es: 'con pelo alocado' }, style: 'crossed' },
        {
          text: {
            en: ' with long black hair and big curious eyes full of life. In one of the ',
            es: ' con una larga melena negra y grandes ojos curiosos y llenos de vida. En uno de los ',
          },
        },
        { text: { en: 'workshops', es: 'talleres' }, style: 'empty' },
        { text: { en: ' she was my dance ', es: ' fue mi pareja de ' } },
        { text: { en: 'partner', es: 'baile' }, style: 'empty' },
        {
          text: {
            en: ", and that's where I asked her name. She told me a completely unexpected name; one more of the many things that drew me to her. I asked if she was new to the place and she said sort of, and that she wanted to learn to dance ",
            es: ' y ahí fue donde le pregunté su nombre. Ella me dijo un nombre totalmente inesperado; otra de las tantas cosas que me atrajo de ella. Le pregunté que si era nueva en el lugar y me dijo que más o menos y que quería aprender a bailar ',
          },
        },
        { text: { en: 'bachata', es: 'bachata' }, style: 'empty' },
        { text: { en: '. I mentioned I was at ', es: '. Le comenté que yo estaba en ' } },
        { text: { en: 'a dance school', es: 'una academia' }, style: 'empty' },
        {
          text: {
            en: ' and that I could pass along the contact. We exchanged phone numbers and went our separate ways. That night we didn’t run into each other again for the rest of ',
            es: ' y que le podía pasar el contacto. Intercambiamos nuestros números de teléfono y nos separamos. Esa noche no nos encontramos más en todo el tiempo que duró ',
          },
        },
        { text: { en: 'the social', es: 'el social' }, style: 'empty' },
        { text: { en: '.', es: '.' } },
      ],
      [
        {
          text: {
            en: "Later that night, on my way home, I texted her to send the info I'd promised and told her we could meet up sometime. Not only did she agree, but she also suggested meeting the very next day. And without even knowing it, that night our paths decided to intertwine, like a passionate embrace, joining not just our bodies but our hearts. A brief encounter that lasted barely a few minutes but unleashed a flood of emotions over weeks and even months, one that let us get to know each other deeply, that gave us the chance to become important to one another and fill our hearts with warmth. That moment happened while we were practicing something we have in common, something I can now only describe with this riddle:",
            es: 'Entrada la noche, al volver a casa, le escribí para mandarle los datos que le había prometido y le dije que podíamos quedar algún día. Ella no solo estuvo de acuerdo, sino que además me dijo de quedar al día siguiente. Y sin siquiera saberlo, esa noche nuestros destinos decidieron entrelazarse, como un abrazo apasionado, uniendo no solo nuestros cuerpos sino nuestros corazones. Un pequeño encuentro que duró apenas unos minutos y que desató un aluvión de emociones a lo largo de semanas e incluso meses, que nos permitió conocernos el uno al otro con mucha profundidad, que nos ofreció la oportunidad de ser alguien importante para el otro y llenar de calidez nuestros corazones. Ese momento ocurrió mientras practicábamos algo que tenemos en común, que ahora solo puedo describir con este acertijo:',
          },
        },
      ],
    ],
    narrativeRiddle: {
      poem: {
        en: 'I was born on a Caribbean isle,\nand my rhythm invites a smile.\nDanced in pairs, held close and tight,\nwith soft steps and turns so light.\nWhat am I?',
        es: 'Nací en una isla del Caribe,\ny mi ritmo invita a sonreír.\nSe baila en pareja, muy pegaditos,\ncon pasos suaves y giros bonitos.\n¿Qué soy?',
      },
      acceptedAnswers: [{ en: 'bachata', es: 'bachata' }],
      hints: [
        {
          en: "It's a genre of Latin music and dance from the Caribbean.",
          es: 'Es un género de música y baile latino del Caribe.',
        },
        {
          en: "It's danced very close together, originally from the Dominican Republic.",
          es: 'Se baila muy pegados, originario de República Dominicana.',
        },
        { en: 'Bachata.', es: 'Bachata.' },
      ],
    },
    location: {
      lat: 28.1398567,
      lng: -15.4302486,
      radiusMeters: 40,
      label: { en: 'The Marquesina', es: 'La Marquesina' },
    },
    minigame: {
      kind: 'jigsaw-puzzle',
      prompt: {
        en: 'Piece together the picture.',
        es: 'Arma la imagen.',
      },
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
      kind: 'notebook-code',
      question: {
        en: "Combine the letters from your notebook — you're missing just the very last one. What word is it?",
        es: 'Combina las letras de tu cuaderno — solo te falta la última. ¿Qué palabra es?',
      },
      referencedStopOrders: [1, 2, 3, 4, 5, 6],
      acceptedAnswers: [{ en: 'ROMANCE', es: 'ROMANCE' }],
      hints: [
        {
          en: "It's exactly what this whole day has been about.",
          es: 'Es justo de lo que ha tratado todo este día.',
        },
        {
          en: "You already have six letters — you're just missing the very last one.",
          es: 'Ya tienes seis letras — solo te falta la última.',
        },
        { en: 'Romance.', es: 'Romance.' },
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
