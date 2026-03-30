/**
 * Easter egg: `railgun ant` prints ASCII art and a random quote.
 * Legacy from the railgun days, kept for fun.
 */
const RAILGUN_ART = `
    ____        _ __
   / __ \\____ _(_) /___ ___  ______
  / /_/ / __ \`/ / / __ \`/ / / / __ \\
 / _, _/ /_/ / / / /_/ / /_/ / / / /
/_/ |_|\\__,_/_/_/\\__, /\\__,_/_/ /_/
                /____/
`;
const QUOTES = [
    "Determinism is not a limitation. It's a superpower.",
    "Your agents don't get to improvise.",
    "Great things are done by a series of small things brought together. -- Van Gogh",
    "Alone we can do so little; together we can do so much. -- Helen Keller",
    "If you want to go fast, go alone. If you want to go far, go together. -- African Proverb",
    "A pipeline is only as strong as its weakest step.",
    "Ship it. Then ship it again.",
    "The world is moved along not only by the mighty shoves of its heroes, but also by the tiny pushes of each honest worker. -- Helen Keller",
];
export function printAnt() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    process.stdout.write(`${RAILGUN_ART}\n${quote}\n`);
}
