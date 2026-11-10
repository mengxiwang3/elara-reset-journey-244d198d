// One shared destination list. The phones, the Atlas globe and the collection all read from here, so their
// names, images and order cannot drift apart. Areas, continents, places and coordinates follow the app.
// souvenir: the app's own keepsake for that destination's first day (cut from the app's souvenir sheets).
window.ELARA_DEST = [
  { key: 'kyoto',  area: ['Claridad financiera', 'Money Clarity'],      region: ['Asia', 'Asia'],                 place: ['Kioto', 'Kyoto'],                   title: ['Arashiyama, Kioto', 'Arashiyama, Kyoto'],
    lat: 35, lon: 135,            plate: 'kyoto.webp',  pin: 'pin-kyoto.jpg',  traveler: 'kyoto',  m: 1,    ob: 0,   souvenir: { img: 'keep-kyoto.png',  name: ['Grulla de papel', 'Paper crane'] } },
  { key: 'venice', area: ['Ritmo diario', 'Daily Rhythm'],              region: ['Europa', 'Europe'],             place: ['Venecia', 'Venice'],                title: ['Venecia, Italia', 'Venice, Italy'],
    lat: 45.4408, lon: 12.3155,   plate: 'venice.webp', pin: 'pin-venice.jpg', traveler: 'venice', m: .95,  ob: -12, souvenir: { img: 'keep-venice.png', name: ['Boleto de ferry', 'Ferry ticket'] } },
  { key: 'andes',  area: ['Encontrar tu propósito', 'Purpose Finding'], region: ['Sudamérica', 'South America'],  place: ['Machu Picchu', 'Machu Picchu'],     title: ['Machu Picchu, Perú', 'Machu Picchu, Peru'],
    lat: -13.16, lon: -72.54,     plate: 'andes.webp',  pin: 'pin-andes.jpg',  traveler: 'andes',  m: 1.03, ob: 8,   souvenir: { img: 'keep-andes.png',  name: ['Mapa plegado', 'Folded map'] } },
  { key: 'mexico', area: ['Amor y límites', 'Love & Boundaries'],       region: ['Norteamérica', 'North America'], place: ['Ciudad de México', 'Mexico City'], title: ['Ciudad de México', 'Mexico City'],
    lat: 19.4, lon: -99.1,        plate: 'mexico.webp', pin: 'pin-mexico.jpg', traveler: 'mexico', m: .96,  ob: -6,  souvenir: { img: 'keep-mexico.png', name: ['Boleto de metro', 'Metro ticket'] } },
  { key: 'giza',   area: ['Confianza en ti', 'Self-Trust'],             region: ['África', 'Africa'],             place: ['Guiza', 'Giza'],                    title: ['Guiza, Egipto', 'Giza, Egypt'],
    lat: 29.98, lon: 31.13,       plate: 'giza.webp',   pin: 'pin-giza.jpg',   traveler: 'camel',  m: .97,  ob: 4,   souvenir: { img: 'keep-giza.png',   name: ['Postal de Guiza', 'Giza postcard'] } },
  { key: 'reef',   area: ['Recuperar tu energía', 'Energy Reset'],      region: ['Oceanía', 'Oceania'],           place: ['Gran Barrera de Coral', 'Great Barrier Reef'], title: ['Gran Barrera de Coral', 'Great Barrier Reef'],
    lat: -18.3, lon: 147.7,       plate: 'reef.webp',   pin: 'pin-reef.jpg',   traveler: 'boat',   m: 1,    ob: -4,  souvenir: { img: 'keep-reef.png',   name: ['Boleto de lancha', 'Boat ticket'] } },
];
