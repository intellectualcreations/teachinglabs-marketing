'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatCircle, ArrowRight, PaperPlaneRight, SpeakerHigh, Microphone, Gear } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

type DifficultyLevel = 'below' | 'on' | 'above';

interface Message {
  id: string;
  role: 'ai' | 'student';
  text: string;
}

interface ReadingQuestion {
  question: string;
}

interface MathQuestion {
  question: string;
  expectedAnswer: number;
}

interface ContentSet {
  passages: Record<DifficultyLevel, string>;
  readingQuestions: Record<DifficultyLevel, ReadingQuestion[]>;
  mathQuestions: Record<DifficultyLevel, MathQuestion[]>;
  writingPrompts: Record<DifficultyLevel, string>;
}

interface AssessmentProfile {
  interest: string;
  interestCategory: string;
  birthYear: number;
  readingLevel: DifficultyLevel;
  mathLevel: DifficultyLevel;
  writingResponse: string;
  assessmentDate: string;
  responses: { question: string; answer: string; category: string; difficulty: string }[];
}

type Step = 'icebreaker' | 'reading' | 'math' | 'writing' | 'celebration';

// ─── Free-Text Evaluation ────────────────────────────────────────────────────

function evaluateReadingResponse(text: string): 'good' | 'ok' | 'weak' {
  const trimmed = text.trim();
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (trimmed.length > 50 && sentences.length >= 2) return 'good';
  if (trimmed.length >= 20) return 'ok';
  return 'weak';
}

function evaluateMathResponse(text: string, expectedAnswer: number): 'good' | 'ok' | 'weak' {
  const trimmed = text.trim();
  // Extract all numbers from the response (including decimals and negatives)
  const numbers = trimmed.match(/-?\d+\.?\d*/g)?.map(Number) || [];

  // Check if the expected answer appears in the response
  for (const n of numbers) {
    if (Math.abs(n - expectedAnswer) < 0.01) return 'good';
  }
  // Check if any number is close (within 10%)
  const tolerance = Math.max(Math.abs(expectedAnswer * 0.1), 1);
  for (const n of numbers) {
    if (Math.abs(n - expectedAnswer) <= tolerance) return 'ok';
  }
  return 'weak';
}

// ─── Content Banks ───────────────────────────────────────────────────────────

const CONTENT: Record<string, ContentSet> = {
  gaming: {
    passages: {
      below: "Video games are fun to play. People all over the world play games on computers, phones, and consoles. Some games let you build things. Other games let you go on adventures. Playing games can help you learn to solve problems and work with others.",
      on: "Video games have become one of the biggest forms of entertainment in the world. Game designers use math, art, and storytelling to create virtual worlds that millions of people enjoy. Some games require quick reflexes, while others test your ability to plan and think strategically. Many schools are even starting to use games to help students learn subjects like math and science.",
      above: "The video game industry generates over $180 billion annually, surpassing both the film and music industries combined. Game development requires expertise in computer science, mathematics, visual design, narrative writing, and psychology. Modern games use sophisticated algorithms for procedural generation, artificial intelligence, and physics simulation. Competitive esports has emerged as a legitimate career path, with professional players earning millions through tournaments and sponsorships.",
    },
    readingQuestions: {
      below: [
        { question: "What are some things you can do in video games?" },
        { question: "Why do you think games are fun for so many people?" },
        { question: "How can games help you learn?" },
        { question: "If you could make a game, what would it be about?" },
      ],
      on: [
        { question: "According to the passage, what skills do game designers use? Why do you think they need all of those?" },
        { question: "What's the difference between games that need quick reflexes and games that need strategic thinking? Can you give an example of each?" },
        { question: "Why do you think schools are starting to use games for learning? Do you think that's a good idea?" },
        { question: "What does 'strategically' mean in this passage? Can you use it in your own sentence?" },
      ],
      above: [
        { question: "The passage says gaming surpasses film and music combined. What do you think explains this massive growth?" },
        { question: "What is 'procedural generation' and why would game developers use it?" },
        { question: "Do you think esports should be considered a 'real' sport? Use evidence from the passage to support your argument." },
        { question: "How does game development combine STEM skills with creative skills? Why is that combination important?" },
      ],
    },
    mathQuestions: {
      below: [
        { question: "If you play a game for 2 hours on Monday and 3 hours on Tuesday, how many hours did you play in total?", expectedAnswer: 5 },
        { question: "You have 10 coins in a game and you spend 4 on a new item. How many coins do you have left?", expectedAnswer: 6 },
        { question: "If you get 3 stars on each of 4 levels, how many stars do you have?", expectedAnswer: 12 },
        { question: "You and 2 friends want to share 15 game tokens equally. How many does each person get?", expectedAnswer: 5 },
      ],
      on: [
        { question: "A game developer spent 240 hours building a game. If they worked 8 hours a day, how many days did it take?", expectedAnswer: 30 },
        { question: "In a game tournament, first place wins $500, second wins half of first, and third wins half of second. How much does third place win?", expectedAnswer: 125 },
        { question: "A game has 1,200 players. If 25% of them play every day, how many daily players is that?", expectedAnswer: 300 },
        { question: "You're saving up for a $60 game. You've saved $38 so far. If you earn $5.50 per week from chores, how many more weeks until you can buy it?", expectedAnswer: 4 },
      ],
      above: [
        { question: "An esports team won 72% of their 150 matches this season. How many matches did they win?", expectedAnswer: 108 },
        { question: "A game studio employs 85 people. They want to increase their team by 40% next year. How many total employees will they have?", expectedAnswer: 119 },
        { question: "A gaming PC costs $1,200. It loses 15% of its value each year. What's it worth after 2 years? (Round to nearest dollar)", expectedAnswer: 867 },
        { question: "In a battle royale, 100 players start. Each round, 1/4 of the remaining players are eliminated. How many players are left after 3 rounds? (Round down)", expectedAnswer: 42 },
      ],
    },
    writingPrompts: {
      below: "Tell me about your favorite game! What do you like most about it? 🎮",
      on: "Write me a paragraph about your favorite game. What makes it special to you? What's the coolest thing you've done in it?",
      above: "Write me a short story set inside your favorite game. Include details about the world, a challenge you face, and how you overcome it. Be creative!",
    },
  },

  sports: {
    passages: {
      below: "Sports are a great way to stay active and have fun. People play sports like soccer, basketball, and swimming all around the world. When you play a sport, you learn to work as a team. You also learn to keep trying even when things are hard. Sports can make you stronger and help you make friends.",
      on: "Athletes train for years to compete at the highest levels of their sport. Training involves not just physical practice, but also studying game strategy, maintaining proper nutrition, and getting enough rest. Many professional athletes start learning their sport as children and dedicate thousands of hours to perfecting their skills. Sports scientists study how the body moves and recovers to help athletes perform at their best.",
      above: "Modern sports science has revolutionized athletic performance through biomechanical analysis, nutritional optimization, and data-driven training programs. Technologies like motion capture, heart rate variability monitoring, and GPS tracking allow coaches to quantify every aspect of an athlete's performance. The concept of 'deliberate practice' — structured, focused training designed to improve specific weaknesses — has been shown to be more effective than simply accumulating hours of general practice. Recovery science has also advanced, with techniques like periodization helping athletes peak at precisely the right time for major competitions.",
    },
    readingQuestions: {
      below: [
        { question: "What are some things you can learn from playing sports?" },
        { question: "Why do you think sports help you make friends?" },
        { question: "What does 'keep trying even when things are hard' mean to you?" },
        { question: "What sport would you want to try and why?" },
      ],
      on: [
        { question: "Besides practicing their sport, what else do athletes do to perform their best?" },
        { question: "Why do you think starting young is important for athletes? What advantages does it give them?" },
        { question: "What do sports scientists study and why is that helpful?" },
        { question: "What does 'dedicate' mean in this passage? Use it in your own sentence." },
      ],
      above: [
        { question: "How has technology changed the way athletes train? Give specific examples from the passage." },
        { question: "What is 'deliberate practice' and why is it better than just practicing more?" },
        { question: "What does 'periodization' mean in context, and why would an athlete want to 'peak at the right time'?" },
        { question: "Do you think data-driven training takes away from the 'art' of sports coaching? Defend your position." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "Your team scored 3 goals in the first half and 2 goals in the second half. How many goals total?", expectedAnswer: 5 },
        { question: "There are 12 players on the bench and 5 go into the game. How many are still on the bench?", expectedAnswer: 7 },
        { question: "If practice is 2 hours long and you practice 3 days a week, how many hours of practice is that?", expectedAnswer: 6 },
        { question: "You need 20 points to win. You've scored 14. How many more do you need?", expectedAnswer: 6 },
      ],
      on: [
        { question: "A basketball player makes 3-point shots 40% of the time. If she takes 20 shots, about how many would you expect her to make?", expectedAnswer: 8 },
        { question: "A runner completes a 5K race in 22 minutes and 30 seconds. What was their average pace per kilometer in minutes?", expectedAnswer: 4.5 },
        { question: "A football field is 100 yards long. If a player runs from one end to the other and back 6 times during practice, how far did they run in total (in yards)?", expectedAnswer: 1200 },
        { question: "A team won 18 games and lost 12. What percentage of their games did they win?", expectedAnswer: 60 },
      ],
      above: [
        { question: "An athlete's heart rate during training follows a pattern: 2 minutes at 170 bpm, then 1 minute recovery at 120 bpm. Over a 30-minute session, what is the average heart rate? (Round to nearest whole number)", expectedAnswer: 153 },
        { question: "A sprinter improves their 100m time by 2% each month. If they start at 12.5 seconds, what will their time be after 3 months? (Round to 2 decimal places)", expectedAnswer: 11.76 },
        { question: "A stadium has 45,000 seats. Tickets cost $35 for general and $75 for premium. If 70% of seats are general and the rest premium, what is the total revenue if every seat is sold?", expectedAnswer: 2115000 },
        { question: "A basketball player's shooting percentage was 45% after 200 shots. How many more consecutive shots must they make (no misses) to raise their percentage to 50%?", expectedAnswer: 20 },
      ],
    },
    writingPrompts: {
      below: "Tell me about your favorite sport! What do you like most about playing or watching it? ⚽",
      on: "Write me a paragraph about your best sports moment. It could be a game you won, a skill you learned, or watching your favorite athlete. Tell me all about it!",
      above: "Write a short story about an athlete preparing for the biggest competition of their life. Include details about their training, their mindset, and what happens at the competition. Make it exciting!",
    },
  },

  animals: {
    passages: {
      below: "Animals live in many different places around the world. Some animals live in forests, some live in oceans, and some live in deserts. Animals need food, water, and a safe place to live. Baby animals learn from their parents. People can help animals by taking care of the places where they live.",
      on: "Many animals have developed amazing abilities to survive in their environments. Dolphins use echolocation, sending out sound waves that bounce back to help them find food in dark water. Arctic foxes change their fur color from brown in summer to white in winter for camouflage. Elephants can communicate with each other using low-frequency sounds that travel through the ground, which other elephants can feel through their feet from miles away.",
      above: "Biodiversity loss represents one of the most pressing environmental challenges of our time. Scientists estimate that species are currently going extinct at 100 to 1,000 times the natural background rate, driven primarily by habitat destruction, climate change, pollution, and invasive species. Conservation biologists use population viability analysis to predict the minimum population size needed for a species to survive long-term. Keystone species, like sea otters in kelp forest ecosystems, play outsized roles in maintaining ecological balance — their removal can trigger cascading effects throughout the entire food web.",
    },
    readingQuestions: {
      below: [
        { question: "What do animals need to live?" },
        { question: "How can people help animals?" },
        { question: "Why do baby animals learn from their parents?" },
        { question: "What's your favorite animal and why?" },
      ],
      on: [
        { question: "How does echolocation help dolphins? Explain it in your own words." },
        { question: "Why do Arctic foxes change color? What would happen if they didn't?" },
        { question: "How is elephant communication different from how most animals communicate?" },
        { question: "What does 'camouflage' mean? Can you think of another animal that uses it?" },
      ],
      above: [
        { question: "The passage mentions species going extinct at 100-1,000 times the natural rate. What does 'natural background rate' mean and why is the comparison important?" },
        { question: "What is a 'keystone species' and why are they so important to an ecosystem?" },
        { question: "What are 'cascading effects' and how might removing sea otters cause them in kelp forests?" },
        { question: "If you were a conservation biologist, what strategy would you prioritize to slow biodiversity loss? Use evidence from the passage." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "A cat has 4 kittens. If 2 more kittens are born, how many kittens are there now?", expectedAnswer: 6 },
        { question: "A dog eats 3 cups of food each day. How many cups does it eat in 5 days?", expectedAnswer: 15 },
        { question: "There are 9 birds on a fence. 4 fly away. How many are left?", expectedAnswer: 5 },
        { question: "You see 8 fish in a tank. If you put them in 2 equal groups, how many are in each group?", expectedAnswer: 4 },
      ],
      on: [
        { question: "A cheetah can run 70 miles per hour. A house cat can run 30 miles per hour. How many times faster is the cheetah? (Round to one decimal)", expectedAnswer: 2.3 },
        { question: "A zoo has 156 animals. If 1/3 are mammals and 1/4 are birds, how many are reptiles and fish?", expectedAnswer: 65 },
        { question: "An elephant eats 300 pounds of food per day. How many tons does it eat in a month (30 days)? (1 ton = 2,000 pounds)", expectedAnswer: 4.5 },
        { question: "A wildlife reserve is 840 acres. If they want to expand it by 35%, how many total acres will it be?", expectedAnswer: 1134 },
      ],
      above: [
        { question: "A wolf pack territory is roughly circular with a diameter of 20 miles. What's the approximate area in square miles? (Use π ≈ 3.14)", expectedAnswer: 314 },
        { question: "A population of rabbits doubles every 3 months. Starting with 12 rabbits, how many will there be after 1 year?", expectedAnswer: 192 },
        { question: "Conservationists tagged 50 fish in a lake. A week later, they caught 80 fish and 10 had tags. Estimate the total fish population.", expectedAnswer: 400 },
        { question: "A migration route is 3,500 miles. A bird flies at 35 mph for 10 hours per day. How many days will the journey take?", expectedAnswer: 10 },
      ],
    },
    writingPrompts: {
      below: "Tell me about an animal you think is really cool! What do you like about it? 🐾",
      on: "Write me a paragraph about an animal you find fascinating. What makes it special? What's the most interesting thing about how it lives?",
      above: "Write a short story from the perspective of an animal in the wild. Describe what a typical day looks like, including finding food, avoiding dangers, and interacting with other animals. Use vivid details!",
    },
  },

  music: {
    passages: {
      below: "Music is sounds put together in a special way. People make music with instruments like guitars, drums, and pianos. You can also make music with just your voice! Music can make you feel happy, sad, or excited. People all around the world love listening to and making music.",
      on: "Music has been part of human culture for thousands of years. Different instruments create different sounds because of how they produce vibrations. A guitar string vibrates when plucked, a drum skin vibrates when struck, and a flute column of air vibrates when you blow across it. Musicians spend years learning to control these vibrations to create melodies, harmonies, and rhythms that move people emotionally.",
      above: "The neuroscience of music reveals fascinating connections between sound and the brain. When we listen to music, multiple brain regions activate simultaneously — the auditory cortex processes sound, the motor cortex responds to rhythm, and the limbic system generates emotional responses. Research has shown that musical training physically changes brain structure, increasing the size of the corpus callosum and enhancing neural connectivity. Studies at Johns Hopkins found that jazz improvisation deactivates the brain's self-monitoring regions while activating creative centers, suggesting that spontaneous musical creation requires 'letting go' of conscious control.",
    },
    readingQuestions: {
      below: [
        { question: "What are some instruments you can use to make music?" },
        { question: "How can music make you feel?" },
        { question: "Why do you think people all around the world love music?" },
        { question: "What kind of music do you like?" },
      ],
      on: [
        { question: "How do different instruments create different sounds? Explain using examples from the passage." },
        { question: "Why do musicians spend years learning their instrument? What are they trying to control?" },
        { question: "What's the difference between melody, harmony, and rhythm?" },
        { question: "What does 'vibrations' mean? Why is that word important when talking about music?" },
      ],
      above: [
        { question: "The passage mentions multiple brain regions activating during music. Why might this make music uniquely powerful compared to other activities?" },
        { question: "What does the jazz improvisation study reveal about creativity?" },
        { question: "How does musical training physically change the brain? What does this suggest about brain plasticity?" },
        { question: "If music training enhances the brain, should music education be mandatory in schools? Build an argument using the passage." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "If a song is 3 minutes long and you listen to it 4 times, how many minutes is that?", expectedAnswer: 12 },
        { question: "You have 8 songs on a playlist and you add 5 more. How many songs do you have now?", expectedAnswer: 13 },
        { question: "A band has 6 members. Each member has 2 instruments. How many instruments does the band have in total?", expectedAnswer: 12 },
        { question: "Your music class is 45 minutes long. If 15 minutes have passed, how many minutes are left?", expectedAnswer: 30 },
      ],
      on: [
        { question: "A concert ticket costs $45. If 1,200 tickets are sold, how much money is that?", expectedAnswer: 54000 },
        { question: "A song is 4 minutes 30 seconds. An album has 12 songs averaging the same length. How long is the album in minutes?", expectedAnswer: 54 },
        { question: "A musician practices 2.5 hours per day, 6 days a week. How many hours do they practice in a year (52 weeks)?", expectedAnswer: 780 },
        { question: "A streaming platform pays $0.004 per song play. How many plays does an artist need to earn $1,000?", expectedAnswer: 250000 },
      ],
      above: [
        { question: "Sound travels at 343 meters per second. A concert speaker is 50 meters from the back row and 2 meters from the front row. What's the delay in milliseconds between the front row and back row?", expectedAnswer: 140 },
        { question: "A guitar string vibrates at 440 Hz (cycles per second) for the note A. If you play for 5 seconds, how many complete vibrations occur?", expectedAnswer: 2200 },
        { question: "An artist releases an album that costs $12 to produce per unit. They sell 6,000 digital copies at $20 and 4,000 physical copies at $25. What's the total profit?", expectedAnswer: 100000 },
        { question: "A metronome is set to 120 BPM (beats per minute). A song is in 4/4 time (4 beats per measure). How many measures occur in a 3-minute song?", expectedAnswer: 90 },
      ],
    },
    writingPrompts: {
      below: "Tell me about your favorite song or musician! What do you like about them? 🎵",
      on: "Write me a paragraph about a song or musician that means a lot to you. What is it about their music that connects with you? How does it make you feel?",
      above: "Write a short story about a musician who discovers they have a unique ability through their music. It could be a superpower, a connection to another world, or something unexpected. Be creative with the details!",
    },
  },

  science: {
    passages: {
      below: "Science helps us understand the world around us. Scientists ask questions about how things work and then try to find answers. They do experiments to test their ideas. You can be a scientist too! Every time you ask 'why?' or 'how?', you're thinking like a scientist.",
      on: "Space exploration has revealed incredible facts about our solar system. Mars has the largest volcano in the solar system, Olympus Mons, which is nearly three times the height of Mount Everest. Jupiter's Great Red Spot is a storm that has been raging for over 400 years and is large enough to swallow Earth. Saturn's rings, while appearing solid, are actually made up of billions of pieces of ice and rock, ranging from tiny grains to chunks the size of houses.",
      above: "Quantum mechanics challenges our everyday understanding of reality in profound ways. At the subatomic level, particles exist in 'superposition' — occupying multiple states simultaneously until observed. The famous double-slit experiment demonstrated that electrons behave as both particles and waves, and the mere act of measurement changes their behavior. Quantum entanglement, which Einstein called 'spooky action at a distance,' allows two particles to be correlated across vast distances instantaneously, defying classical physics' speed-of-light limitation. These principles are now being harnessed in quantum computing, which could solve problems that would take classical computers billions of years.",
    },
    readingQuestions: {
      below: [
        { question: "What do scientists do?" },
        { question: "How can you think like a scientist?" },
        { question: "What is an experiment?" },
        { question: "What's something you've been curious about?" },
      ],
      on: [
        { question: "How does Olympus Mons compare to mountains on Earth? Why do you think Mars can have a bigger volcano?" },
        { question: "What surprises you most about Jupiter's Great Red Spot?" },
        { question: "Saturn's rings look solid but they're not. What are they actually made of?" },
        { question: "If you could explore one place in our solar system, where would you go and why?" },
      ],
      above: [
        { question: "What does 'superposition' mean and why does it challenge our everyday understanding?" },
        { question: "Why did Einstein call quantum entanglement 'spooky action at a distance'?" },
        { question: "How does the double-slit experiment show that observation changes reality? What's philosophically strange about that?" },
        { question: "Why could quantum computers solve problems that classical computers can't? What makes them fundamentally different?" },
      ],
    },
    mathQuestions: {
      below: [
        { question: "A scientist has 5 test tubes. She gets 3 more. How many test tubes does she have now?", expectedAnswer: 8 },
        { question: "A plant grows 2 inches each week. How tall will it be after 4 weeks?", expectedAnswer: 8 },
        { question: "You have 10 rocks and sort them into 2 equal piles. How many in each pile?", expectedAnswer: 5 },
        { question: "There are 7 planets that are farther from the Sun than Earth. Including Earth, how many planets are in our solar system?", expectedAnswer: 8 },
      ],
      on: [
        { question: "Light takes 8 minutes to travel from the Sun to Earth. If the Sun suddenly turned off, how many minutes before we'd know?", expectedAnswer: 8 },
        { question: "A rocket travels at 25,000 mph. How far does it travel in 6 hours?", expectedAnswer: 150000 },
        { question: "A science experiment needs 3/4 cup of vinegar. If you want to do the experiment 5 times, how many cups of vinegar do you need?", expectedAnswer: 3.75 },
        { question: "Earth is about 93 million miles from the Sun. Mars is about 142 million miles. How many million miles farther from the Sun is Mars than Earth?", expectedAnswer: 49 },
      ],
      above: [
        { question: "The nearest star (Proxima Centauri) is 4.24 light-years away. If 1 light-year ≈ 5.88 trillion miles, approximately how many trillion miles away is it? (Round to one decimal)", expectedAnswer: 24.9 },
        { question: "Jupiter's mass is about 318 times Earth's mass. If Earth's mass is about 6 trillion trillion kg (6 × 10²⁴ kg), what is Jupiter's mass in trillion trillion kg?", expectedAnswer: 1908 },
        { question: "A bacteria population doubles every 20 minutes. Starting with 1 bacterium, how many will there be after 4 hours?", expectedAnswer: 4096 },
        { question: "The surface gravity of Mars is 38% of Earth's. If you weigh 150 pounds on Earth, how much would you weigh on Mars?", expectedAnswer: 57 },
      ],
    },
    writingPrompts: {
      below: "Tell me about something in science that you think is really cool! What do you want to learn more about? 🔬",
      on: "If you could be a scientist and study anything in the universe, what would you choose? Write me a paragraph about what you'd investigate and why it fascinates you.",
      above: "Write a short story about a scientist who makes an incredible discovery. Describe what they find, how they react, and what it means for the world. Use scientific details to make it feel real!",
    },
  },

  cooking: {
    passages: {
      below: "Cooking is a way to make food taste really good. You can mix different ingredients together to make new things. Some people bake cookies, while others cook soup or make pizza. Following a recipe is like following directions — you go step by step. Cooking can be really fun, especially when you share what you make with family and friends!",
      on: "Cooking is actually a form of chemistry. When you bake bread, yeast organisms consume sugar and release carbon dioxide gas, which creates the bubbles that make bread fluffy. When you sear a steak, the Maillard reaction between amino acids and sugars creates hundreds of new flavor compounds, giving it that delicious brown crust. Understanding the science behind cooking helps chefs create better food and even invent entirely new dishes.",
      above: "Modern gastronomy has transformed cooking into a precise science. Techniques like sous vide use exact temperature control — cooking food in sealed bags in water baths at specific temperatures (often to within 0.1°C) for extended periods. This precision eliminates the guesswork of traditional cooking and produces consistently perfect results. Fermentation, one of humanity's oldest food technologies, is being reimagined by chefs who are culturing everything from koji mold for umami depth to wild-fermented hot sauces with complex flavor profiles. The intersection of food science and culinary art continues to push the boundaries of what's possible on a plate.",
    },
    readingQuestions: {
      below: [
        { question: "What is cooking like, according to the passage?" },
        { question: "Why is cooking fun?" },
        { question: "What are some things you can cook?" },
        { question: "Have you ever helped cook something? What was it?" },
      ],
      on: [
        { question: "How is cooking related to chemistry? Give an example from the passage." },
        { question: "What is the Maillard reaction and why does it matter for cooking?" },
        { question: "How does understanding food science help chefs?" },
        { question: "What does 'consume' mean in this passage?" },
      ],
      above: [
        { question: "What makes sous vide different from traditional cooking, and what's the advantage of cooking to within 0.1°C?" },
        { question: "Why does the passage call fermentation 'one of humanity's oldest food technologies'? How is it being reimagined?" },
        { question: "What does 'the intersection of food science and culinary art' mean? Why is that intersection important?" },
        { question: "Design a simple experiment a student could do at home to demonstrate the Maillard reaction. What would you compare?" },
      ],
    },
    mathQuestions: {
      below: [
        { question: "A recipe needs 2 eggs. If you want to make it 3 times, how many eggs do you need?", expectedAnswer: 6 },
        { question: "You baked 12 cookies and ate 4. How many are left?", expectedAnswer: 8 },
        { question: "If a pizza has 8 slices and you eat half, how many slices did you eat?", expectedAnswer: 4 },
        { question: "You need 5 apples for a pie. How many apples for 2 pies?", expectedAnswer: 10 },
      ],
      on: [
        { question: "A recipe serves 4 people and needs 2/3 cup of flour. How many cups of flour do you need for 12 people?", expectedAnswer: 2 },
        { question: "A cake needs to bake at 350°F for 35 minutes. If you accidentally set it 50°F too high, you should reduce time by 15%. How many minutes should it bake? (Round to nearest minute)", expectedAnswer: 30 },
        { question: "A restaurant sells 180 meals per day. If 45% are pasta dishes, how many pasta dishes do they sell?", expectedAnswer: 81 },
        { question: "You're scaling a recipe from 6 servings to 15. If the original calls for 1.5 cups of sugar, how many cups do you need?", expectedAnswer: 3.75 },
      ],
      above: [
        { question: "Bread dough rises 60% in volume during the first proofing. If you start with 500 mL of dough, what's the volume after two proofings (each adds 60%)?", expectedAnswer: 1280 },
        { question: "A chef needs a 5% salt brine. Approximately how many grams of salt should they add to 2,000 grams of water? (Use simpler estimate: 5% of the water weight)", expectedAnswer: 100 },
        { question: "A restaurant's food cost ratio is 32%. If their monthly revenue is $45,000, how much do they spend on food?", expectedAnswer: 14400 },
        { question: "Yeast doubles every 90 minutes at optimal temperature. Starting with 1 gram, how many grams after 9 hours?", expectedAnswer: 64 },
      ],
    },
    writingPrompts: {
      below: "Tell me about your favorite food! What do you love about it? 🍕",
      on: "Write me a paragraph about a meal that's special to you. Maybe it's something your family makes, or your favorite restaurant dish. What makes it special?",
      above: "Write a short story about a chef who enters a cooking competition. Describe the dish they create, the techniques they use, and whether they win or lose. Make me hungry reading it!",
    },
  },

  toys: {
    passages: {
      below: "Toys come in all shapes and sizes. Some people love dolls like Barbies, while others like building with Legos. Stuffed animals can be your best friend at bedtime. Action figures let you make up exciting stories. Playing with toys helps you use your imagination and have fun!",
      on: "The toy industry is a multi-billion dollar business that shapes childhood around the world. Designers create toys by thinking about what makes play exciting and educational. Barbie, for example, has had over 200 different careers since 1959, inspiring children to imagine themselves in any role. Lego bricks use precise engineering — each brick must connect perfectly with every other brick ever made. Even simple toys like dolls and action figures help children develop storytelling skills and emotional intelligence through imaginative play.",
      above: "The psychology of play reveals that toys are far more than entertainment — they are tools for cognitive and social development. Through doll play, children practice empathy, social scenarios, and emotional regulation. Construction toys like Lego develop spatial reasoning, engineering thinking, and persistence. Research from Cardiff University found that children who engage in pretend play with toys show stronger theory of mind development, meaning they better understand that other people have different thoughts and feelings. The toy industry increasingly incorporates STEM principles, with products designed to introduce coding, robotics, and engineering concepts through hands-on play.",
    },
    readingQuestions: {
      below: [
        { question: "What kinds of toys does the passage talk about?" },
        { question: "How do toys help you use your imagination?" },
        { question: "What's your favorite toy and why do you like it?" },
        { question: "Why do you think stuffed animals can be like a best friend?" },
      ],
      on: [
        { question: "What does it mean that Barbie has had over 200 careers? Why is that important?" },
        { question: "Why do Lego bricks need precise engineering? What would happen if they weren't precise?" },
        { question: "How do dolls and action figures help children develop storytelling skills?" },
        { question: "What does 'emotional intelligence' mean in this passage?" },
      ],
      above: [
        { question: "According to the passage, how are toys more than just entertainment? What skills do they actually develop?" },
        { question: "What is 'theory of mind' and how does pretend play help develop it?" },
        { question: "Why is it significant that the toy industry is incorporating STEM principles? What does this say about how we think about play?" },
        { question: "Do you think digital toys (video games, apps) develop the same skills as physical toys? Use ideas from the passage to argue your position." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "You have 5 Barbie dolls and get 3 more for your birthday. How many do you have now?", expectedAnswer: 8 },
        { question: "You built a Lego tower with 6 blocks. Your friend built one with 9 blocks. How many blocks did you both use?", expectedAnswer: 15 },
        { question: "You have 12 action figures and put them in 3 equal teams. How many are on each team?", expectedAnswer: 4 },
        { question: "If a toy costs 7 dollars, how much would 2 of the same toy cost?", expectedAnswer: 14 },
      ],
      on: [
        { question: "A Lego set has 450 pieces. If you build 75 pieces per day, how many days will it take to finish?", expectedAnswer: 6 },
        { question: "A toy store sold 840 Barbie dolls in one month. If 35% were career Barbies, how many career Barbies were sold?", expectedAnswer: 294 },
        { question: "A stuffed animal costs $18. It's on sale for 25% off. What's the sale price?", expectedAnswer: 13.5 },
        { question: "You want to buy a Lego set for $60. You've saved $22 and earn $4.75 per week in allowance. How many weeks until you have enough?", expectedAnswer: 8 },
      ],
      above: [
        { question: "The Lego company produces 36 billion bricks per year. How many bricks is that per day? (Round to nearest million)", expectedAnswer: 99 },
        { question: "A collector has 85 Barbie dolls. She increases her collection by 20% each year. How many will she have after 2 years? (Round to nearest whole number)", expectedAnswer: 122 },
        { question: "A toy factory produces 2,500 action figures per hour. If 3.2% are defective and must be discarded, how many good figures are produced in an 8-hour shift?", expectedAnswer: 19360 },
        { question: "A Lego set has a retail price of $120. The store buys it wholesale at 45% of retail. What's the store's profit per set sold at full price?", expectedAnswer: 66 },
      ],
    },
    writingPrompts: {
      below: "Tell me about your favorite toy! What games do you play with it? 🧸",
      on: "Write me a paragraph about a toy that means a lot to you. How did you get it? What adventures have you had with it?",
      above: "Write a short story where your favorite toy comes to life. What would it say? Where would it go? What adventure would you have together? Be creative!",
    },
  },

  art: {
    passages: {
      below: "Art is a way to show how you feel and what you imagine. You can draw with crayons, paint with brushes, or make things with clay. Some people like to color inside the lines, and others like to create their own designs. Art comes in many colors and shapes. Making art is fun because there is no wrong way to do it!",
      on: "Artists use many different techniques to create their work. Painters mix colors to make new shades — for example, mixing blue and yellow creates green. Sculptors shape clay, stone, or metal into three-dimensional forms. Some artists use perspective, making objects look smaller when they're farther away to create depth on a flat surface. Throughout history, art movements like Impressionism and Pop Art have changed how people think about creativity and expression.",
      above: "Art has always reflected and challenged the societies that produce it. The Renaissance revolutionized Western art by combining mathematical principles like linear perspective with anatomical study, creating unprecedented realism. Modern art movements deliberately broke these rules — Cubism fractured objects into geometric shapes to show multiple viewpoints simultaneously, while Abstract Expressionists like Jackson Pollock abandoned representation entirely, arguing that the physical act of painting was itself the artwork. Today, digital art and AI-generated images raise new questions about authorship, creativity, and what qualifies as 'art' in an age where algorithms can produce visually stunning works.",
    },
    readingQuestions: {
      below: [
        { question: "What are some ways you can make art?" },
        { question: "Why does the passage say there is 'no wrong way' to make art?" },
        { question: "What kinds of things do you like to draw or create?" },
        { question: "Why do you think art comes in many colors and shapes?" },
      ],
      on: [
        { question: "How do painters create new colors? Can you think of another color combination?" },
        { question: "What is perspective in art and why do artists use it?" },
        { question: "What's the difference between a painting and a sculpture?" },
        { question: "What does 'expression' mean when talking about art?" },
      ],
      above: [
        { question: "How did the Renaissance change Western art? What tools did artists use to create realism?" },
        { question: "Why did modern art movements like Cubism deliberately break the rules of realistic art?" },
        { question: "What questions does AI-generated art raise about creativity and authorship?" },
        { question: "Do you think AI can truly create 'art,' or is human intention a necessary ingredient? Defend your position." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "You have 8 crayons and your friend gives you 6 more. How many crayons do you have?", expectedAnswer: 14 },
        { question: "You want to paint 4 pictures. Each one uses 2 colors. How many colors do you need in total?", expectedAnswer: 8 },
        { question: "There are 15 colored pencils and 3 kids sharing equally. How many does each kid get?", expectedAnswer: 5 },
        { question: "You drew 3 pictures on Monday, 2 on Tuesday, and 4 on Wednesday. How many pictures did you draw?", expectedAnswer: 9 },
      ],
      on: [
        { question: "An art class has 24 students. If each student uses 3 sheets of paper per project and they do 5 projects, how many sheets does the class use total?", expectedAnswer: 360 },
        { question: "A tube of paint costs $4.50. How much would 8 tubes cost?", expectedAnswer: 36 },
        { question: "A canvas is 24 inches wide and 36 inches tall. What is the area of the canvas in square inches?", expectedAnswer: 864 },
        { question: "An art gallery displayed 120 paintings. If 40% were landscapes, how many landscapes were displayed?", expectedAnswer: 48 },
      ],
      above: [
        { question: "A mural is planned for a wall that is 15 feet tall and 40 feet wide. If paint covers 350 square feet per gallon, how many gallons are needed? (Round up to nearest whole gallon)", expectedAnswer: 2 },
        { question: "An art auction sold a painting for $45,000. The auction house takes a 15% commission. How much does the artist receive?", expectedAnswer: 38250 },
        { question: "A color wheel has 12 colors spaced equally around a circle (360 degrees). How many degrees apart is each color?", expectedAnswer: 30 },
        { question: "A sculptor creates a rectangular block 8 inches × 6 inches × 10 inches, then carves away 35% of the volume. What volume remains in cubic inches?", expectedAnswer: 312 },
      ],
    },
    writingPrompts: {
      below: "Tell me about something cool you drew or created! What did it look like? 🎨",
      on: "Write me a paragraph about your favorite kind of art. Do you like drawing, painting, sculpting, or something else? What do you enjoy most about creating?",
      above: "Write a short story about an artist who creates a masterpiece that changes the world. What do they create, how do they create it, and what impact does it have? Use vivid descriptions!",
    },
  },

  reading: {
    passages: {
      below: "Books can take you anywhere! You can fly on a dragon, solve a mystery, or explore the ocean. Some stories are funny, and some are exciting. When you read, you use your imagination to see the story in your mind. Reading is like having a superpower — you can visit any place and any time just by opening a book!",
      on: "Books have the power to transport readers to entirely different worlds. Fantasy authors like J.K. Rowling created Hogwarts, a magical school that millions of readers feel they've actually visited. Mystery writers plant clues throughout their stories, turning readers into detectives. Graphic novels and manga combine visual art with storytelling, creating a unique reading experience. Libraries around the world hold millions of books, and today's readers can also access thousands of stories digitally through e-readers and apps.",
      above: "Literature serves as both a mirror and a window — reflecting our own experiences while revealing lives vastly different from our own. Classic novels like Harper Lee's 'To Kill a Mockingbird' used fiction to confront real social injustice, changing public attitudes. The rise of young adult fiction has given voice to diverse perspectives, with authors from marginalized communities sharing stories previously untold in mainstream publishing. Literary analysis examines how authors use techniques like unreliable narrators, symbolism, and non-linear timelines to create meaning beyond the surface plot. The debate between physical books and digital reading continues, with research suggesting that reading comprehension may differ based on the medium.",
    },
    readingQuestions: {
      below: [
        { question: "What kinds of adventures can you have by reading books?" },
        { question: "Why does the passage say reading is like having a superpower?" },
        { question: "What's your favorite book or story? What happened in it?" },
        { question: "How do you use your imagination when you read?" },
      ],
      on: [
        { question: "How do fantasy authors like J.K. Rowling make readers feel like they've visited a place that doesn't exist?" },
        { question: "What makes graphic novels and manga different from regular books?" },
        { question: "Why are libraries important? What would the world be like without them?" },
        { question: "What does 'transport readers to different worlds' mean in this passage?" },
      ],
      above: [
        { question: "What does it mean that literature is 'both a mirror and a window'? Give an example of each." },
        { question: "How can fiction change public attitudes about real social issues? Use the passage's example to explain." },
        { question: "What is an 'unreliable narrator' and why would an author choose to use one?" },
        { question: "Do you think physical books or digital reading is better? Use ideas from the passage and your own experience to argue your point." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "You read 4 pages before bed each night. How many pages do you read in 5 nights?", expectedAnswer: 20 },
        { question: "A book has 10 chapters. You've read 6. How many are left?", expectedAnswer: 4 },
        { question: "You checked out 3 books from the library on Monday and 2 more on Wednesday. How many did you check out total?", expectedAnswer: 5 },
        { question: "If a story has 8 pictures and each picture takes up half a page, how many pages of pictures are there?", expectedAnswer: 4 },
      ],
      on: [
        { question: "A book has 320 pages. If you read 45 pages per day, how many full days will it take to finish? (Don't count the partial last day)", expectedAnswer: 7 },
        { question: "A library has 8,500 books. If 30% are fiction, how many fiction books are there?", expectedAnswer: 2550 },
        { question: "A bookstore sold 1,200 books in March and 1,500 in April. What was the percentage increase from March to April?", expectedAnswer: 25 },
        { question: "If you read for 25 minutes each day for a month (30 days), how many total hours did you read?", expectedAnswer: 12.5 },
      ],
      above: [
        { question: "A library has 42,000 books. They add 1,800 new books and remove 650 outdated ones each year. How many books will they have after 3 years?", expectedAnswer: 45450 },
        { question: "An author earns 12% royalty on a $16 book. If 25,000 copies sell, what are the total royalties?", expectedAnswer: 48000 },
        { question: "A student reads at 250 words per minute. A novel has 80,000 words. How many hours will it take to read? (Round to one decimal)", expectedAnswer: 5.3 },
        { question: "A book series has 7 books. Each book is 15% longer than the previous one. If the first book is 200 pages, how many pages is the 4th book? (Round to nearest page)", expectedAnswer: 304 },
      ],
    },
    writingPrompts: {
      below: "Tell me about a story you love! Who is your favorite character and what happens to them? 📖",
      on: "Write me a paragraph about a book or story that changed how you think about something. What was it about, and what did you learn from it?",
      above: "Write the opening chapter of your own story. Create a main character, set the scene, and introduce a conflict that makes the reader want to keep reading. Be creative with your writing style!",
    },
  },

  nature: {
    passages: {
      below: "Nature is all around us! Trees give us shade and clean air. Flowers bloom in beautiful colors. Animals live in forests, rivers, and fields. When you go outside, you can hear birds singing and feel the wind. Taking care of nature helps keep the Earth a happy, healthy place for everyone.",
      on: "Earth's natural environments are incredibly diverse and interconnected. Rainforests, which cover only 6% of the planet's surface, contain more than half of all plant and animal species. Coral reefs are sometimes called the 'rainforests of the sea' because of their rich biodiversity. Mountains create their own weather patterns, with different ecosystems at different elevations — tropical forest at the base might give way to alpine meadows and then snow-capped peaks. Every ecosystem depends on others: forests filter water for rivers, bees pollinate crops that feed people, and wetlands protect coastlines from storms.",
      above: "Climate change is fundamentally altering Earth's natural systems at an unprecedented rate. Glaciers that have existed for thousands of years are retreating, sea levels are rising, and extreme weather events are becoming more frequent and severe. Ecologists study these shifts through the lens of ecological resilience — the capacity of an ecosystem to absorb disturbance and still maintain its essential functions. Some ecosystems have 'tipping points' beyond which recovery becomes impossible: coral reefs that bleach too many times cannot regenerate, and deforested areas may become permanent grasslands as changing soil conditions prevent forest regrowth. Understanding these thresholds is critical for conservation policy and climate adaptation strategies.",
    },
    readingQuestions: {
      below: [
        { question: "What are some things you can find in nature?" },
        { question: "Why is it important to take care of nature?" },
        { question: "What's your favorite thing to do outside?" },
        { question: "How do trees help us?" },
      ],
      on: [
        { question: "Why are rainforests so important even though they cover only 6% of Earth's surface?" },
        { question: "Why are coral reefs called the 'rainforests of the sea'?" },
        { question: "How do different ecosystems depend on each other? Give an example from the passage." },
        { question: "What does 'biodiversity' mean based on how it's used in the passage?" },
      ],
      above: [
        { question: "What is 'ecological resilience' and why does it matter for conservation?" },
        { question: "What are 'tipping points' in ecosystems? Why are they dangerous?" },
        { question: "How does deforestation create a cycle that prevents forests from growing back?" },
        { question: "If you were advising a government on climate policy, what would you prioritize based on this passage? Defend your answer." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "You planted 5 flowers on Monday and 4 flowers on Tuesday. How many flowers did you plant?", expectedAnswer: 9 },
        { question: "A tree has 12 apples. You pick 7. How many are left on the tree?", expectedAnswer: 5 },
        { question: "You saw 3 birds in one tree and 6 birds in another. How many birds did you see?", expectedAnswer: 9 },
        { question: "If you hike 2 miles each day for 3 days, how many miles did you hike?", expectedAnswer: 6 },
      ],
      on: [
        { question: "A national park covers 500 square miles. If 6% is covered by lakes, how many square miles of lakes are there?", expectedAnswer: 30 },
        { question: "A trail is 8.5 miles long. If you've hiked 3.75 miles, how many miles are left?", expectedAnswer: 4.75 },
        { question: "A forest had 2,400 trees. A storm knocked down 15%. How many trees remain?", expectedAnswer: 2040 },
        { question: "You collected 84 leaves for a science project. If you sort them into 7 equal groups by type, how many are in each group?", expectedAnswer: 12 },
      ],
      above: [
        { question: "Rainforests cover about 6% of Earth's surface (510 million sq km). How many million square kilometers of rainforest is that? (Round to one decimal)", expectedAnswer: 30.6 },
        { question: "A glacier retreats 12 meters per year. How many meters will it have retreated after 25 years?", expectedAnswer: 300 },
        { question: "A river flows at 4.5 mph. How many miles does a leaf travel in 8 hours?", expectedAnswer: 36 },
        { question: "A mountain is 14,000 feet tall. The tree line is at 65% of its height. Above what elevation (in feet) are there no trees?", expectedAnswer: 9100 },
      ],
    },
    writingPrompts: {
      below: "Tell me about a time you went outside and had fun! What did you see and do? 🌲",
      on: "Write me a paragraph about your favorite place in nature. What does it look like? What sounds can you hear? How does it make you feel?",
      above: "Write a short story about someone who discovers a hidden place in nature that no one has ever seen before. Describe the landscape, the plants and animals, and what makes it magical. Use vivid, sensory details!",
    },
  },

  fashion: {
    passages: {
      below: "Clothes are a way to show who you are! Some people like bright colors, while others like soft ones. You can wear fun patterns like stripes or polka dots. Getting dressed is like picking your outfit for an adventure. When you pick out your own clothes, you get to be creative every single day!",
      on: "Fashion is a form of self-expression that has existed throughout human history. Designers sketch their ideas, choose fabrics, and create patterns before a single stitch is sewn. The fashion industry involves everything from cotton farming to fabric weaving to runway shows where models display new collections. Trends change with the seasons — what's popular in spring might be different from fall styles. Sustainable fashion has become increasingly important as people learn about how clothing production affects the environment.",
      above: "The global fashion industry is valued at over $1.7 trillion and employs more than 75 million people worldwide. However, it also has significant environmental and ethical implications. Fast fashion — inexpensive clothing produced rapidly in response to trends — has been criticized for contributing to textile waste, water pollution, and exploitative labor practices. In contrast, the slow fashion movement advocates for quality over quantity, encouraging consumers to buy fewer, better-made garments. Fashion technology is evolving rapidly, with innovations like 3D-printed clothing, smart fabrics that regulate body temperature, and AI-powered design tools that can predict trends months in advance.",
    },
    readingQuestions: {
      below: [
        { question: "How can clothes help show who you are?" },
        { question: "What are some fun patterns you can wear?" },
        { question: "Why is getting dressed like picking an outfit for an adventure?" },
        { question: "What's your favorite thing to wear and why?" },
      ],
      on: [
        { question: "What steps do designers go through to create new clothes?" },
        { question: "Why do fashion trends change with the seasons?" },
        { question: "What is sustainable fashion and why is it important?" },
        { question: "What does 'self-expression' mean when talking about fashion?" },
      ],
      above: [
        { question: "What is 'fast fashion' and why has it been criticized?" },
        { question: "How does the slow fashion movement differ from fast fashion? What trade-offs are involved?" },
        { question: "How could technology like 3D printing and smart fabrics change the fashion industry?" },
        { question: "Is fashion art or commerce? Build an argument using evidence from the passage." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "You have 3 shirts and 2 pairs of pants. How many different outfits can you make?", expectedAnswer: 6 },
        { question: "A dress costs 9 dollars. You have 15 dollars. How much money will you have left after buying it?", expectedAnswer: 6 },
        { question: "You have 10 pairs of socks and lose 2 pairs. How many pairs do you have left?", expectedAnswer: 8 },
        { question: "Your closet has 4 shelves with 3 hats on each shelf. How many hats do you have?", expectedAnswer: 12 },
      ],
      on: [
        { question: "A shirt originally costs $40. It's on sale for 30% off. What's the sale price?", expectedAnswer: 28 },
        { question: "A fashion designer makes 12 dresses per week. How many does she make in a year (52 weeks)?", expectedAnswer: 624 },
        { question: "A clothing store bought 500 t-shirts for $8 each and sells them for $22 each. What's the total profit if they sell all of them?", expectedAnswer: 7000 },
        { question: "If 3/4 of a fabric roll measuring 60 yards is used for a collection, how many yards were used?", expectedAnswer: 45 },
      ],
      above: [
        { question: "The fashion industry is worth $1.7 trillion. If fast fashion accounts for 35% of that, how much is fast fashion worth in billions? (1 trillion = 1,000 billion)", expectedAnswer: 595 },
        { question: "A clothing brand reduces water usage by 22% per garment. If they originally used 2,700 liters per garment, how many liters do they use now? (Round to nearest liter)", expectedAnswer: 2106 },
        { question: "A model walks a 90-meter runway at 1.5 meters per second. How many seconds does the walk take?", expectedAnswer: 60 },
        { question: "A boutique marks up wholesale prices by 150%. If a jacket costs $80 wholesale, what's the retail price?", expectedAnswer: 200 },
      ],
    },
    writingPrompts: {
      below: "Tell me about your favorite outfit! What does it look like and why do you love wearing it? 👗",
      on: "Write me a paragraph about your personal style. What kinds of clothes do you like? If you could design any outfit, what would it look like?",
      above: "Write a short story about a fashion designer who creates something no one has ever seen before. What do they design, what inspired them, and how do people react? Make it vivid and creative!",
    },
  },

  general: {
    passages: {
      below: "Everyone has something they love to do! Some people love playing outside, and others love making things. Trying new activities is a great way to find what you enjoy. When you try something new, you might be surprised by how much fun it is. The best part about hobbies is sharing them with friends and family.",
      on: "Hobbies are more than just fun — they help us grow as people. When you spend time doing something you enjoy, your brain releases dopamine, a chemical that makes you feel happy and motivated. Learning a new hobby also builds persistence, because mastering any skill takes practice and patience. People who have hobbies they're passionate about tend to be happier, more creative, and better at handling stress. Whether it's building models, playing music, writing stories, or exploring nature, the activity itself matters less than the joy and growth it brings.",
      above: "The science of motivation reveals that intrinsic motivation — doing something because you genuinely enjoy it — produces far better outcomes than extrinsic motivation like rewards or grades. Psychologist Mihaly Csikszentmihalyi identified the concept of 'flow,' a state of complete absorption in an activity where time seems to disappear and performance peaks. Flow occurs when the challenge of a task perfectly matches your skill level — too easy and you're bored, too hard and you're anxious. Research shows that people who regularly experience flow through their hobbies and passions report higher life satisfaction, greater creativity, and improved mental health across their entire lives.",
    },
    readingQuestions: {
      below: [
        { question: "Why is trying new things a good idea?" },
        { question: "What's the best part about hobbies according to the passage?" },
        { question: "What's something new you'd like to try?" },
        { question: "Why might you be surprised when you try something new?" },
      ],
      on: [
        { question: "How do hobbies help us grow as people, according to the passage?" },
        { question: "What is dopamine and why does it matter for hobbies?" },
        { question: "Why does mastering a hobby require persistence? Can you give an example from your own life?" },
        { question: "What does the passage mean when it says 'the activity itself matters less than the joy and growth it brings'?" },
      ],
      above: [
        { question: "What's the difference between intrinsic and extrinsic motivation? Why is intrinsic motivation more powerful?" },
        { question: "What is 'flow' and what conditions are needed to experience it?" },
        { question: "Why is the balance between challenge and skill important for flow? What happens when they don't match?" },
        { question: "Based on this passage, how would you design a school curriculum that maximizes student motivation and learning? Defend your approach." },
      ],
    },
    mathQuestions: {
      below: [
        { question: "If you spend 3 hours on your hobby each week, how many hours is that in 4 weeks?", expectedAnswer: 12 },
        { question: "You have 10 supplies for your hobby and use 4. How many are left?", expectedAnswer: 6 },
        { question: "There are 16 kids in a class and they split into 4 equal groups. How many in each group?", expectedAnswer: 4 },
        { question: "You practice something new for 2 hours each day for 5 days. How many hours did you practice?", expectedAnswer: 10 },
      ],
      on: [
        { question: "A class has 28 students. If 3/4 of them have a hobby they practice regularly, how many students is that?", expectedAnswer: 21 },
        { question: "You practice your hobby for 45 minutes every day. How many total hours is that in a week (7 days)? (Round to one decimal)", expectedAnswer: 5.3 },
        { question: "Your test scores are 85, 92, 78, and 95. What's your average score?", expectedAnswer: 87.5 },
        { question: "A club raised $1,250 for supplies. If that's 62.5% of their goal, what was the total goal?", expectedAnswer: 2000 },
      ],
      above: [
        { question: "A student's grades are calculated by averaging: A=4, B=3, C=2. With grades of A, A, B, A, B, C across 6 classes, what's their GPA? (Round to 2 decimal places)", expectedAnswer: 3.33 },
        { question: "Research shows a hobby improves test scores by 15%. If students without a hobby average 72%, what would hobby students average? (Round to one decimal)", expectedAnswer: 82.8 },
        { question: "A school has 1,500 students. Test results: 22% Advanced, 48% Proficient, 23% Basic, rest Below Basic. How many scored Below Basic?", expectedAnswer: 105 },
        { question: "If you practice with spaced repetition at day 1, 3, 7, and 14, and your exam is on day 20, what's the latest day you can start to complete all 4 reviews?", expectedAnswer: 6 },
      ],
    },
    writingPrompts: {
      below: "Tell me about something you learned recently that you thought was really cool! 🌟",
      on: "Write me a paragraph about something you're really good at. How did you get good at it? What advice would you give someone just starting?",
      above: "Write a short story about a student who discovers a unique talent they didn't know they had. How do they discover it, and what do they do with it? Make it creative and detailed!",
    },
  },
};

// ─── Interest Category Matching ──────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  gaming: ['game', 'gaming', 'minecraft', 'roblox', 'fortnite', 'xbox', 'playstation', 'nintendo', 'switch', 'video game', 'computer game', 'controller', 'esport', 'valorant', 'apex', 'league', 'cod', 'call of duty', 'gta', 'pokemon', 'zelda', 'mario'],
  sports: ['sport', 'soccer', 'football', 'basketball', 'baseball', 'tennis', 'swimming', 'running', 'track', 'gymnastics', 'volleyball', 'hockey', 'lacrosse', 'wrestling', 'martial art', 'karate', 'taekwondo', 'boxing', 'athlete', 'workout', 'gym', 'exercise', 'skateboard', 'surf', 'ski', 'snowboard', 'cheer', 'dance'],
  animals: ['animal', 'pet', 'dog', 'cat', 'horse', 'fish', 'bird', 'reptile', 'snake', 'lizard', 'hamster', 'rabbit', 'bunny', 'turtle', 'dinosaur', 'zoo', 'wildlife', 'puppy', 'kitten', 'aquarium', 'farm', 'veterinar', 'dolphin', 'shark', 'whale', 'insect', 'bug'],
  music: ['music', 'sing', 'song', 'guitar', 'piano', 'drum', 'band', 'concert', 'instrument', 'rap', 'hip hop', 'pop', 'rock', 'country', 'jazz', 'violin', 'flute', 'trumpet', 'ukulele', 'choir', 'spotify', 'playlist', 'beat', 'melody', 'dj'],
  science: ['science', 'space', 'planet', 'star', 'chemistry', 'physics', 'biology', 'experiment', 'lab', 'robot', 'technology', 'tech', 'coding', 'programming', 'computer', 'math', 'nasa', 'rocket', 'astronaut', 'dna', 'atom', 'molecule', 'electric', 'magnet', 'invention', 'engineer'],
  cooking: ['cook', 'bake', 'food', 'recipe', 'kitchen', 'chef', 'cake', 'cookie', 'pizza', 'pasta', 'breakfast', 'lunch', 'dinner', 'dessert', 'chocolate', 'restaurant', 'eat', 'delicious', 'flavor', 'ingredient', 'meal'],
  toys: ['barbie', 'doll', 'lego', 'toy', 'action figure', 'stuffed animal', 'play', 'pretend', 'playdoh', 'hot wheels', 'nerf', 'teddy bear', 'figurine', 'dollhouse'],
  art: ['draw', 'drawing', 'paint', 'painting', 'art', 'craft', 'color', 'sketch', 'design', 'create', 'creative', 'clay', 'pottery', 'sculpture', 'origami', 'collage'],
  reading: ['read', 'book', 'story', 'stories', 'library', 'novel', 'comic', 'manga', 'chapter', 'harry potter', 'diary of a wimpy kid', 'author', 'fiction', 'fantasy'],
  nature: ['nature', 'outside', 'outdoors', 'garden', 'plant', 'flower', 'tree', 'hike', 'hiking', 'camping', 'fishing', 'explore', 'forest', 'beach', 'ocean', 'mountain', 'river', 'lake'],
  fashion: ['fashion', 'clothes', 'style', 'outfit', 'dress', 'sewing', 'makeup', 'accessory', 'shoes', 'trend', 'model', 'runway'],
};

function matchInterestCategory(interest: string): string {
  const lower = interest.toLowerCase();
  let bestMatch = 'general';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
}

function getGradeFromBirthYear(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return Math.max(0, Math.min(12, age - 5));
}

function getStartingDifficulty(birthYear: number): DifficultyLevel {
  const grade = getGradeFromBirthYear(birthYear);
  if (grade <= 3) return 'below';
  if (grade <= 8) return 'on';
  return 'above';
}

// ─── Smart General Fallback ──────────────────────────────────────────────────
// When using the general category, weave the student's interest into questions

function personalizeGeneralQuestions(
  content: ContentSet,
  interest: string,
  difficulty: DifficultyLevel,
): ContentSet {
  const interestText = interest.trim();
  if (!interestText) return content;

  // Create personalized math questions that reference the student's interest
  const personalizedMath: MathQuestion[] = content.mathQuestions[difficulty].map((q, i) => {
    // Replace generic references with the student's interest for the first couple questions
    if (i === 0) {
      if (difficulty === 'below') {
        return { question: `If you spend 3 hours on ${interestText} each week, how many hours is that in 4 weeks?`, expectedAnswer: 12 };
      } else if (difficulty === 'on') {
        return { question: `A group of 28 students all love ${interestText}. If 3/4 of them practice it regularly, how many students is that?`, expectedAnswer: 21 };
      } else {
        return { question: `A student spends 2 hours per day on ${interestText}. Over a 30-day month, how many total hours is that?`, expectedAnswer: 60 };
      }
    }
    return q;
  });

  // Create personalized reading questions
  const personalizedReading: ReadingQuestion[] = content.readingQuestions[difficulty].map((q, i) => {
    if (i === 2) {
      if (difficulty === 'below') {
        return { question: `You said you love ${interestText}. What's the most fun thing about it?` };
      } else if (difficulty === 'on') {
        return { question: `Thinking about ${interestText}, how has practicing or doing it helped you grow as a person?` };
      } else {
        return { question: `How might someone experience 'flow' while doing ${interestText}? Use the passage's definition to explain.` };
      }
    }
    return q;
  });

  return {
    ...content,
    mathQuestions: {
      ...content.mathQuestions,
      [difficulty]: personalizedMath,
    },
    readingQuestions: {
      ...content.readingQuestions,
      [difficulty]: personalizedReading,
    },
  };
}

// ─── Voice Helpers ───────────────────────────────────────────────────────────

const FEMALE_VOICE_HINTS = ['samantha', 'victoria', 'karen', 'allison', 'ava', 'alice', 'veena', 'moira', 'tessa', 'fiona', 'kate', 'sarah', 'susan', 'zira', 'female', 'aria', 'jenny', 'emma', 'libby', 'sonia', 'hazel', 'neerja', 'heera'];
const MALE_VOICE_HINTS = ['daniel', 'alex', 'bruce', 'fred', 'junior', 'ralph', 'tom', 'david', 'lee', 'paul', 'james', 'aaron', 'male', 'rishi', 'george', 'ryan', 'liam', 'arthur', 'oliver'];

function getVoiceGender(name: string): 'Female' | 'Male' | 'Neutral' {
  const lower = name.toLowerCase();
  if (FEMALE_VOICE_HINTS.some(h => lower.includes(h))) return 'Female';
  if (MALE_VOICE_HINTS.some(h => lower.includes(h))) return 'Male';
  return 'Neutral';
}

function getFriendlyVoiceLabel(voice: SpeechSynthesisVoice, index: number): string {
  const gender = getVoiceGender(voice.name);
  return `Voice ${index + 1} (${gender})`;
}

// ─── Confetti Component ──────────────────────────────────────────────────────

function Confetti() {
  const colors = ['#4FA3A5', '#1F3A5F', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#F97316', '#06B6D4'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    size: 6 + Math.random() * 8,
    isCircle: Math.random() > 0.5,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-[confettiFall_var(--dur)_ease-in_var(--delay)_forwards]"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            '--delay': `${p.delay}s`,
            '--dur': `${p.duration}s`,
          } as React.CSSProperties}
        >
          <div
            className="animate-[confettiSpin_1s_linear_infinite]"
            style={{
              width: p.size,
              height: p.isCircle ? p.size : p.size * 0.6,
              background: p.color,
              borderRadius: p.isCircle ? '50%' : '2px',
              transform: `rotate(${p.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

let msgCounter = 0;
function makeId() { return `msg-${++msgCounter}`; }

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState<Step>('icebreaker');
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'textarea'>('text');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persistent state
  const [studentName, setStudentName] = useState('');
  const [birthYear, setBirthYear] = useState(2014);
  const [interest, setInterest] = useState('');
  const [interestCategory, setInterestCategory] = useState('general');
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('on');
  const [readingScore, setReadingScore] = useState(0);
  const [mathScore, setMathScore] = useState(0);
  const [readingQIndex, setReadingQIndex] = useState(0);
  const [mathQIndex, setMathQIndex] = useState(0);
  const [writingResponse, setWritingResponse] = useState('');
  const [responses, setResponses] = useState<AssessmentProfile['responses']>([]);
  const [initialized, setInitialized] = useState(false);

  // ─── Voice Feature State ──────────────────────────────────────────────────

  // Text-to-Speech
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Voice picker state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const handleVoiceChange = useCallback((uri: string) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem('tts_voice_uri', uri);
  }, []);

  const handleVoicePreview = useCallback(() => {
    if (!ttsSupported || !selectedVoiceURI) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance("Hello! I'm your Learning Lab Coach");
    utt.rate = 0.95;
    utt.pitch = 1.0;
    const v = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === selectedVoiceURI);
    if (v) utt.voice = v;
    utt.onend = () => setIsPreviewPlaying(false);
    utt.onerror = () => setIsPreviewPlaying(false);
    setIsPreviewPlaying(true);
    window.speechSynthesis.speak(utt);
  }, [ttsSupported, selectedVoiceURI]);

  const speakMessage = useCallback((msgId: string, text: string) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    if (selectedVoiceURI) {
      const v = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === selectedVoiceURI);
      if (v) utterance.voice = v;
    }
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  }, [speakingMsgId, ttsSupported, selectedVoiceURI]);

  // Speech-to-Text
  const [isListening, setIsListening] = useState(false);
  const [listeningCountdown, setListeningCountdown] = useState(30);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sttSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsListening(false);
    setListeningCountdown(30);
  }, []);

  const startListening = useCallback(() => {
    if (!sttSupported) return;
    if (isListening) { stopListening(); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      let remaining = 30;
      setListeningCountdown(remaining);
      countdownTimerRef.current = setInterval(() => {
        remaining--;
        setListeningCountdown(remaining);
        if (remaining <= 0) stopListening();
      }, 1000);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTextInput(fullTranscript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
      stopListening();
    };

    recognition.onend = () => stopListening();

    try { recognition.start(); } catch (err) {
      console.error('Failed to start speech recognition:', err);
      stopListening();
    }
  }, [isListening, sttSupported, stopListening]);

  // Load available voices for voice picker
  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const english = allVoices.filter(v => v.lang.startsWith('en'));
      if (english.length === 0) return;
      setVoices(english);
      const saved = localStorage.getItem('tts_voice_uri');
      const match = saved ? english.find(v => v.voiceURI === saved) : null;
      setSelectedVoiceURI(prev => prev || (match ? match.voiceURI : english[0].voiceURI));
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', loadVoices); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup voice APIs on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopListening();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAiMsg = useCallback((text: string): Promise<void> => {
    return new Promise(resolve => {
      setIsTyping(true);
      const delay = Math.min(800 + text.length * 6, 2200);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: makeId(), role: 'ai', text }]);
        setTimeout(resolve, 300);
      }, delay);
    });
  }, []);

  const addStudentMsg = useCallback((text: string) => {
    setMessages(prev => [...prev, { id: makeId(), role: 'student', text }]);
  }, []);

  // Load student info from localStorage and complete signup enrollment
  useEffect(() => {
    if (initialized) return;
    const name = localStorage.getItem('pending_student_name') || 'there';
    const by = localStorage.getItem('pending_birth_year');
    const parsedBY = by ? parseInt(by, 10) : 2014;
    setStudentName(name.split(' ')[0]);
    setBirthYear(parsedBY);
    setCurrentDifficulty(getStartingDifficulty(parsedBY));
    setInitialized(true);

    // Complete signup: create enrollment and generate student number
    const pendingClassId = localStorage.getItem('pending_class_id');
    if (pendingClassId) {
      fetch('/api/student/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: pendingClassId,
          birth_year: parsedBY,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Clear pending data after successful enrollment
            localStorage.removeItem('pending_class_id');
            localStorage.removeItem('pending_role');
            localStorage.removeItem('pending_birth_year');
            // Keep pending_student_name for the session
          }
        })
        .catch(err => {
          console.error('Complete signup error:', err);
        });
    }
  }, [initialized]);

  // Start conversation
  useEffect(() => {
    if (!initialized) return;
    const timer = setTimeout(async () => {
      await addAiMsg(`Hey ${studentName}! 👋 I'm so excited to meet you! Before we start learning together, I want to get to know you a little.`);
      await addAiMsg("What's something you LOVE to do? Could be anything — a hobby, a sport, a game, something you're really into right now!");
      setWaitingForInput(true);
      setInputMode('text');
      setProgress(5);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, isTyping, waitingForInput]);

  // Focus input
  useEffect(() => {
    if (waitingForInput) {
      setTimeout(() => {
        if (inputMode === 'textarea') {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 200);
    }
  }, [waitingForInput, inputMode]);

  // ─── Step Handlers ─────────────────────────────────────────────────────

  const adjustDifficulty = useCallback((quality: 'good' | 'ok' | 'weak', current: DifficultyLevel): DifficultyLevel => {
    if (quality === 'good' && current === 'below') return 'on';
    if (quality === 'good' && current === 'on') return 'above';
    if (quality === 'weak' && current === 'above') return 'on';
    if (quality === 'weak' && current === 'on') return 'below';
    return current;
  }, []);

  const getContent = useCallback((category: string, studentInterest: string): ContentSet => {
    const base = CONTENT[category] || CONTENT.general;
    if (category === 'general') {
      // For general fallback, personalize with the student's interest
      return personalizeGeneralQuestions(base, studentInterest, currentDifficulty);
    }
    return base;
  }, [currentDifficulty]);

  const handleIcebreakerResponse = useCallback(async (text: string) => {
    addStudentMsg(text);
    setInterest(text);
    const category = matchInterestCategory(text);
    setInterestCategory(category);
    setStep('reading');
    setProgress(15);

    const content = getContent(category, text);
    const passage = content.passages[currentDifficulty];

    const categoryNames: Record<string, string> = {
      gaming: 'gaming', sports: 'sports', animals: 'animals',
      music: 'music', science: 'science', cooking: 'cooking',
      toys: 'toys', art: 'art', reading: 'reading',
      nature: 'nature', fashion: 'fashion', general: text.trim(),
    };
    const catName = categoryNames[category] || text.trim();

    await addAiMsg(`Oh awesome, you're into ${catName}! 🎉 That's so cool. I put together something fun for you.`);
    await addAiMsg(`Here's a short passage. Read it and then I'll ask you some questions about it:`);
    await addAiMsg(passage);

    const q = content.readingQuestions[currentDifficulty][0];
    await addAiMsg(q.question);
    setWaitingForInput(true);
    setInputMode('text');
    setReadingQIndex(0);
    setProgress(20);
  }, [addAiMsg, addStudentMsg, currentDifficulty, getContent]);

  const handleReadingResponse = useCallback(async (text: string) => {
    addStudentMsg(text);
    const quality = evaluateReadingResponse(text);
    const content = getContent(interestCategory, interest);
    const newScore = readingScore + (quality === 'good' ? 2 : quality === 'ok' ? 1 : 0);
    setReadingScore(newScore);

    setResponses(prev => [...prev, { question: content.readingQuestions[currentDifficulty][readingQIndex].question, answer: text, category: 'reading', difficulty: currentDifficulty }]);

    const newDiff = adjustDifficulty(quality, currentDifficulty);
    setCurrentDifficulty(newDiff);

    const encouragements = quality === 'good'
      ? ["That's a really thoughtful answer! 🌟", "Wow, great thinking! 💡", "I love how you explained that!"]
      : quality === 'ok'
      ? ["Good thinking! 👍", "Nice! I can see you're working through it.", "That's a solid answer!"]
      : ["Thanks for trying! That's how we learn. 😊", "I appreciate you giving it a shot!", "Good effort! 💪"];
    await addAiMsg(encouragements[Math.floor(Math.random() * encouragements.length)]);

    const nextIndex = readingQIndex + 1;
    const updatedContent = getContent(interestCategory, interest);
    const questions = updatedContent.readingQuestions[newDiff];

    if (nextIndex < 3 && nextIndex < questions.length) {
      const q = questions[nextIndex];
      await addAiMsg(q.question);
      setWaitingForInput(true);
      setInputMode('text');
      setReadingQIndex(nextIndex);
      setProgress(20 + nextIndex * 10);
    } else {
      // Move to math
      setStep('math');
      setProgress(50);
      setMathQIndex(0);

      await addAiMsg("You did awesome with the reading! 📚 Now let's have some fun with numbers.");

      const mathContent = getContent(interestCategory, interest);
      const mathQ = mathContent.mathQuestions[newDiff][0];
      await addAiMsg(mathQ.question);
      setWaitingForInput(true);
      setInputMode('text');
    }
  }, [addAiMsg, addStudentMsg, interestCategory, interest, readingScore, readingQIndex, currentDifficulty, adjustDifficulty, getContent]);

  const handleMathResponse = useCallback(async (text: string) => {
    addStudentMsg(text);
    const content = getContent(interestCategory, interest);
    const currentQ = content.mathQuestions[currentDifficulty][mathQIndex];
    const quality = evaluateMathResponse(text, currentQ.expectedAnswer);
    const newMathScore = mathScore + (quality === 'good' ? 2 : quality === 'ok' ? 1 : 0);
    setMathScore(newMathScore);

    setResponses(prev => [...prev, { question: currentQ.question, answer: text, category: 'math', difficulty: currentDifficulty }]);

    const newDiff = adjustDifficulty(quality, currentDifficulty);
    setCurrentDifficulty(newDiff);

    const encouragements = quality === 'good'
      ? ["Nailed it! 🎯", "You got it! Great math skills! 🧮", "Exactly right! Nice work!"]
      : quality === 'ok'
      ? ["I love how you thought about that! 👏", "You're on the right track!", "Good thinking through the steps!"]
      : ["I love that you tried! Math takes practice. 💪", "No worries! We'll work on this together.", "That's totally OK! Let's keep going. 😊"];
    await addAiMsg(encouragements[Math.floor(Math.random() * encouragements.length)]);

    const nextIndex = mathQIndex + 1;
    const updatedContent = getContent(interestCategory, interest);
    const questions = updatedContent.mathQuestions[newDiff];

    if (nextIndex < 3 && nextIndex < questions.length) {
      const q = questions[nextIndex];
      await addAiMsg(q.question);
      setWaitingForInput(true);
      setInputMode('text');
      setMathQIndex(nextIndex);
      setProgress(50 + nextIndex * 10);
    } else {
      // Move to writing
      setStep('writing');
      setProgress(75);

      await addAiMsg("You're doing amazing! 🌟 One more thing — I'd love to see your creative side.");
      const writingContent = getContent(interestCategory, interest);
      const prompt = writingContent.writingPrompts[newDiff];
      await addAiMsg(prompt);
      setWaitingForInput(true);
      setInputMode('textarea');
    }
  }, [addAiMsg, addStudentMsg, interestCategory, interest, mathScore, mathQIndex, currentDifficulty, adjustDifficulty, getContent]);

  const handleWritingResponse = useCallback(async (text: string) => {
    addStudentMsg(text);
    setWritingResponse(text);
    setResponses(prev => [...prev, { question: 'Creative writing', answer: text, category: 'writing', difficulty: currentDifficulty }]);

    const writingPraise = text.length > 100
      ? "Wow, I can tell you put real thought into that! Your writing is really expressive. 🌟✨"
      : text.length > 30
      ? "That's great! I love what you shared. Thanks for writing that out! ✍️"
      : "Thanks for sharing! Every bit of writing counts. 😊";
    await addAiMsg(writingPraise);

    // Calculate final levels
    const readingLevel: DifficultyLevel = readingScore >= 4 ? 'above' : readingScore >= 2 ? 'on' : 'below';
    const mathLevel: DifficultyLevel = mathScore >= 4 ? 'above' : mathScore >= 2 ? 'on' : 'below';

    // Store assessment
    const profile: AssessmentProfile = {
      interest,
      interestCategory,
      birthYear,
      readingLevel,
      mathLevel,
      writingResponse: text,
      assessmentDate: new Date().toISOString(),
      responses: [...responses, { question: 'Creative writing', answer: text, category: 'writing', difficulty: currentDifficulty }],
    };
    localStorage.setItem('student_assessment', JSON.stringify(profile));

    // Celebration
    setStep('celebration');
    setProgress(100);
    setShowConfetti(true);
    setWaitingForInput(false);

    await addAiMsg(`Great job, ${studentName}! 🎉🎊 I had so much fun getting to know you!`);
    await addAiMsg("I can already tell we're going to have an awesome time learning together. Let's get started!");

    setTimeout(() => setShowContinue(true), 600);
  }, [addAiMsg, addStudentMsg, interest, interestCategory, birthYear, readingScore, mathScore, currentDifficulty, responses, studentName]);

  // ─── Input Handlers ────────────────────────────────────────────────────

  const handleSubmitText = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput('');
    setWaitingForInput(false);

    if (step === 'icebreaker') {
      await handleIcebreakerResponse(text);
    } else if (step === 'reading') {
      await handleReadingResponse(text);
    } else if (step === 'math') {
      await handleMathResponse(text);
    } else if (step === 'writing') {
      await handleWritingResponse(text);
    }
  }, [textInput, step, handleIcebreakerResponse, handleReadingResponse, handleMathResponse, handleWritingResponse]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitText();
    }
  }, [handleSubmitText]);

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col">
      {showConfetti && <Confetti />}

      <div className="w-full max-w-[600px] mx-auto px-4 pt-5 pb-40 flex flex-col flex-1">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-stacked-light.png"
            alt="Teaching Labs"
            width={160}
            height={80}
            className="dark:hidden"
            priority
          />
          <Image
            src="/images/logo-stacked-dark.png"
            alt="Teaching Labs"
            width={160}
            height={80}
            className="hidden dark:block"
            priority
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-5">
          <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
            <ChatCircle size={24} weight="fill" className="text-white" />
          </div>
          <div className="flex-1">
            <div className="font-heading font-semibold text-sm text-text-primary">Teaching Labs Coach</div>
            <div className="text-xs text-text-secondary">I'm here to help you learn!</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold">
              {step === 'icebreaker' ? '👋 Intro' : step === 'reading' ? '📚 Reading' : step === 'math' ? '🧮 Math' : step === 'writing' ? '✍️ Writing' : '🎉 Done!'}
            </span>
            {ttsSupported && (
              <button
                type="button"
                onClick={() => setShowVoicePanel(v => !v)}
                className={`p-1.5 rounded-full transition-colors ${
                  showVoicePanel
                    ? 'text-teal bg-teal/10'
                    : 'text-text-muted hover:text-teal hover:bg-teal/10'
                }`}
                title="Voice settings"
              >
                <Gear size={16} weight={showVoicePanel ? 'fill' : 'regular'} />
              </button>
            )}
          </div>
        </div>

        {/* Voice Settings Panel */}
        {showVoicePanel && ttsSupported && (
          <div className="mb-4 p-3 bg-card-bg dark:bg-[#1A2332] border border-border dark:border-[#2A3A4E] rounded-xl animate-[fadeUp_0.2s_ease-out]">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Gear size={13} className="text-teal" />
              <span className="text-xs font-semibold text-text-primary">Voice Settings</span>
            </div>
            {voices.length === 0 ? (
              <p className="text-xs text-text-muted">Loading voices…</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVoiceURI}
                    onChange={e => handleVoiceChange(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-border dark:border-[#2A3A4E] rounded-lg bg-warm-white dark:bg-[#0B1426] text-text-primary outline-none focus:border-teal transition-colors"
                  >
                    {voices.map((voice, i) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {getFriendlyVoiceLabel(voice, i)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleVoicePreview}
                    disabled={isPreviewPlaying || !selectedVoiceURI}
                    className="flex items-center gap-1.5 px-3 py-2 bg-teal/10 text-teal rounded-lg text-xs font-medium hover:bg-teal/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <SpeakerHigh size={13} weight={isPreviewPlaying ? 'fill' : 'regular'} className={isPreviewPlaying ? 'animate-pulse' : ''} />
                    {isPreviewPlaying ? 'Playing…' : 'Preview'}
                  </button>
                </div>
                {voices.length === 1 && (
                  <p className="text-xs text-text-muted mt-1.5">Only one voice is available in your browser.</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-muted dark:text-text-secondary mb-1.5">
            <span>Getting to know you</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-border dark:bg-[#1A2332] rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[90%] animate-[fadeUp_0.3s_ease-out] ${msg.role === 'student' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold mt-1
                ${msg.role === 'ai' ? 'bg-navy text-white' : 'bg-teal text-white'}`}>
                {msg.role === 'ai' ? <ChatCircle size={16} weight="fill" /> : studentName.charAt(0).toUpperCase()}
              </div>
              {msg.role === 'ai' ? (
                <div className="flex flex-col gap-1">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-card-bg dark:bg-[#1A2332] border border-border dark:border-[#2A3A4E] text-text-primary">
                    {msg.text}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakMessage(msg.id, msg.text)}
                    disabled={!ttsSupported}
                    className={`self-start p-1.5 rounded-full transition-colors flex items-center gap-1.5 text-xs
                      ${!ttsSupported
                        ? 'text-text-muted/30 cursor-not-allowed'
                        : speakingMsgId === msg.id
                          ? 'text-teal bg-teal/10'
                          : 'text-text-muted hover:text-teal hover:bg-teal/10'}`}
                    title={!ttsSupported ? 'Text-to-speech not supported in this browser' : speakingMsgId === msg.id ? 'Stop reading' : 'Read aloud'}
                  >
                    <SpeakerHigh
                      size={14}
                      weight={speakingMsgId === msg.id ? 'fill' : 'regular'}
                      className={speakingMsgId === msg.id ? 'animate-pulse' : ''}
                    />
                    {speakingMsgId === msg.id && <span>Stop</span>}
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-teal text-white">
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 self-start max-w-[90%]">
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-1">
                <ChatCircle size={16} weight="fill" className="text-white" />
              </div>
              <div className="bg-card-bg dark:bg-[#1A2332] border border-border dark:border-[#2A3A4E] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-text-muted opacity-40"
                      style={{ animation: `typingBounce 1.4s infinite ease-in-out ${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      {waitingForInput && !isTyping && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white dark:bg-[#0B1426] border-t border-border dark:border-[#2A3A4E]">
          <div className="max-w-[600px] mx-auto">
            {inputMode === 'textarea' ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write your response here..."
                    rows={3}
                    className="flex-1 px-4 py-3 border border-border dark:border-[#2A3A4E] rounded-xl text-sm bg-card-bg dark:bg-[#1A2332] text-text-primary outline-none focus:border-teal transition-colors resize-none"
                  />
                  <div className="flex flex-col gap-2 self-end">
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={!sttSupported}
                      className={`p-3 rounded-xl transition-colors
                        ${!sttSupported
                          ? 'bg-card-bg dark:bg-[#1A2332] text-text-muted/30 border border-border dark:border-[#2A3A4E] cursor-not-allowed'
                          : isListening
                            ? 'bg-red-500 text-white'
                            : 'bg-card-bg dark:bg-[#1A2332] text-text-secondary border border-border dark:border-[#2A3A4E] hover:border-teal hover:text-teal'}`}
                      title={!sttSupported ? 'Speech recognition not supported in this browser' : isListening ? `Listening... ${listeningCountdown}s` : 'Start voice input'}
                    >
                      <Microphone size={20} weight={isListening ? 'fill' : 'regular'} className={isListening ? 'animate-pulse' : ''} />
                    </button>
                    <button
                      onClick={handleSubmitText}
                      disabled={!textInput.trim()}
                      className="p-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperPlaneRight size={20} weight="fill" />
                    </button>
                  </div>
                </div>
                {isListening && (
                  <div className="flex items-center gap-2 text-xs text-red-500 px-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    Listening... {listeningCountdown}s remaining — click mic to stop
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={step === 'icebreaker' ? "Tell me what you love to do!" : "Type your answer..."}
                    className="flex-1 px-4 py-3 border border-border dark:border-[#2A3A4E] rounded-xl text-sm bg-card-bg dark:bg-[#1A2332] text-text-primary outline-none focus:border-teal transition-colors"
                  />
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={!sttSupported}
                    className={`p-3 rounded-xl transition-colors flex-shrink-0
                      ${!sttSupported
                        ? 'bg-card-bg dark:bg-[#1A2332] text-text-muted/30 border border-border dark:border-[#2A3A4E] cursor-not-allowed'
                        : isListening
                          ? 'bg-red-500 text-white'
                          : 'bg-card-bg dark:bg-[#1A2332] text-text-secondary border border-border dark:border-[#2A3A4E] hover:border-teal hover:text-teal'}`}
                    title={!sttSupported ? 'Speech recognition not supported in this browser' : isListening ? `Listening... ${listeningCountdown}s` : 'Start voice input'}
                  >
                    <Microphone size={20} weight={isListening ? 'fill' : 'regular'} className={isListening ? 'animate-pulse' : ''} />
                  </button>
                  <button
                    onClick={handleSubmitText}
                    disabled={!textInput.trim()}
                    className="p-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <PaperPlaneRight size={20} weight="fill" />
                  </button>
                </div>
                {isListening && (
                  <div className="flex items-center gap-2 text-xs text-red-500 px-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    Listening... {listeningCountdown}s remaining — click mic to stop
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue button */}
      {showContinue && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white dark:bg-[#0B1426] border-t border-border dark:border-[#2A3A4E]">
          <div className="max-w-[600px] mx-auto">
            <Link
              href="/student/dashboard"
              onClick={() => localStorage.setItem('teachinglabs_onboarded', 'true')}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-teal text-white font-heading font-semibold rounded-xl text-base hover:bg-teal/90 transition-colors"
            >
              Let&apos;s start learning!
              <ArrowRight size={18} weight="fill" />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes confettiSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
