export const generateUserColor = (userId: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C69', '#87CEEB', '#F0E68C', '#FFB6C1'
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const getRandomUserName = (): string => {
  const adjectives = [
    'Creative', 'Artistic', 'Brilliant', 'Clever', 'Innovative',
    'Talented', 'Skilled', 'Inspiring', 'Dynamic', 'Visionary'
  ];
  
  const nouns = [
    'Artist', 'Designer', 'Creator', 'Painter', 'Sketcher',
    'Illustrator', 'Doodler', 'Architect', 'Builder', 'Maker'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
};