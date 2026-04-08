export interface Puppy {
  name: string;
  nickname: string;
  meaning: string;
  emoji: string;
  gender: 'girl' | 'boy';
  status: string;
  badge: string;
  personality: string;
}

export const puppies: Puppy[] = [
  { name: 'Roxana', nickname: 'Roxie', meaning: 'Zářící hvězda', emoji: '✨', gender: 'girl', status: 'home', badge: 'ZŮSTÁVÁ DOMA', personality: 'Přišla na svět jako první. Průbojná, energická, vede ostatní.' },
  { name: 'Lucas', nickname: 'Luky', meaning: 'Nositel světla', emoji: '☀️', gender: 'boy', status: 'reserved', badge: 'ZADANÝ', personality: 'Sluníčko, které rozzáří i ten nejtemnější kout.' },
  { name: 'Rosaline', nickname: 'Rousie', meaning: 'Líbezná růže', emoji: '🌹', gender: 'girl', status: 'reserved', badge: 'ZADANÁ', personality: 'Klidná, empatická. Připravuje se na operu — zatím ve verzi zívnutí.' },
  { name: 'Calla', nickname: 'Kejli', meaning: 'Královna elegance', emoji: '🌿', gender: 'girl', status: 'reserved', badge: 'ZADANÁ', personality: 'Klidné vystupování, které budí obdiv. Ví, že se nemusí přetrhnout.' },
  { name: 'Theo', nickname: 'Theo', meaning: 'Boží dar', emoji: '🎁', gender: 'boy', status: 'reserved', badge: 'ZADANÝ', personality: 'Připomínka, že ty nejkrásnější věci přicházejí jako dar.' },
  { name: 'Lillian', nickname: 'Lili', meaning: 'Čistá lilie', emoji: '🌸', gender: 'girl', status: 'reserved', badge: 'ZADANÁ', personality: 'Jemnost, pod kterou se skrývá velká oddanost.' },
  { name: 'Leo', nickname: 'Leo', meaning: 'Malý král', emoji: '👑', gender: 'boy', status: 'reserved', badge: 'ZADANÝ', personality: 'Ve 7 dnech poprvé ukázal svůj lví hlas. Přirozený vůdce smečky.' },
  { name: 'Samuel', nickname: 'Sam', meaning: 'Čistá duše', emoji: '🙏', gender: 'boy', status: 'reserved', badge: 'ZADANÝ', personality: 'Naslouchá srdcem. U první kašičky hlasitě připomněl, že mlíčko je jistota.' },
];
