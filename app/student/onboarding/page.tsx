'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Robot, ArrowRight, PaperPlaneRight } from '@phosphor-icons/react';
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
  options: { label: string; text: string; quality: 'good' | 'ok' | 'weak' }[];
}

interface MathQuestion {
  question: string;
  options: { label: string; text: string; quality: 'good' | 'ok' | 'weak' }[];
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
        { question: "What are some things you can do in video games?", options: [{ label: "Great answer", text: "You can build things and go on adventures. The passage also says games help you solve problems.", quality: "good" }, { label: "Good try", text: "You can play them on a computer.", quality: "ok" }, { label: "Simple answer", text: "Play them", quality: "weak" }] },
        { question: "Why do you think games are fun for so many people?", options: [{ label: "Great answer", text: "Because there are different kinds for everyone. Some people like building, others like adventures.", quality: "good" }, { label: "Good try", text: "Because they're fun to play.", quality: "ok" }, { label: "Simple answer", text: "I don't know, they just are", quality: "weak" }] },
        { question: "How can games help you learn?", options: [{ label: "Great answer", text: "Games can teach you to solve problems and work with other people, like the passage says.", quality: "good" }, { label: "Good try", text: "They help with problem solving.", quality: "ok" }, { label: "Simple answer", text: "They're educational", quality: "weak" }] },
        { question: "If you could make a game, what would it be about?", options: [{ label: "Great answer", text: "I'd make a game where you explore space and have to solve science puzzles to survive on different planets.", quality: "good" }, { label: "Good try", text: "A game about exploring a big world.", quality: "ok" }, { label: "Simple answer", text: "Fighting", quality: "weak" }] },
      ],
      on: [
        { question: "According to the passage, what skills do game designers use? Why do you think they need all of those?", options: [{ label: "Great answer", text: "They use math, art, and storytelling. They need math for the game mechanics, art to make it look good, and storytelling to make players care about what happens.", quality: "good" }, { label: "Good try", text: "Math, art, and storytelling. They need them to make good games.", quality: "ok" }, { label: "Simple answer", text: "Different skills like math and art", quality: "weak" }] },
        { question: "What's the difference between games that need quick reflexes and games that need strategic thinking? Can you give an example of each?", options: [{ label: "Great answer", text: "Reflex games are like racing or shooting games where you react fast. Strategy games are like chess or city builders where you plan ahead. One tests your speed, the other tests your brain.", quality: "good" }, { label: "Good try", text: "Reflex games are fast and strategy games make you think more.", quality: "ok" }, { label: "Simple answer", text: "Some are fast and some are slow", quality: "weak" }] },
        { question: "Why do you think schools are starting to use games for learning? Do you think that's a good idea?", options: [{ label: "Great answer", text: "Games make learning fun so students pay more attention. I think it's a good idea because when you're having fun, you don't even realize you're learning.", quality: "good" }, { label: "Good try", text: "Because games are more fun than textbooks. Yeah, I think it's a good idea.", quality: "ok" }, { label: "Simple answer", text: "To make school more fun", quality: "weak" }] },
        { question: "What does 'strategically' mean in this passage? Can you use it in your own sentence?", options: [{ label: "Great answer", text: "Strategically means thinking ahead and planning your moves carefully. Like: 'I strategically saved my best Pokemon for the final gym battle.'", quality: "good" }, { label: "Good try", text: "It means planning things out. Like planning your next move in chess.", quality: "ok" }, { label: "Simple answer", text: "Thinking about stuff", quality: "weak" }] },
      ],
      above: [
        { question: "The passage says gaming surpasses film and music combined. What do you think explains this massive growth?", options: [{ label: "Great answer", text: "Games are interactive, so people spend more time with them than passive entertainment. Plus, games have recurring revenue from in-game purchases and subscriptions, and the global audience keeps growing as internet access expands.", quality: "good" }, { label: "Good try", text: "More people play games now and they cost a lot of money to buy.", quality: "ok" }, { label: "Simple answer", text: "Games are really popular", quality: "weak" }] },
        { question: "What is 'procedural generation' and why would game developers use it?", options: [{ label: "Great answer", text: "Procedural generation uses algorithms to create content automatically instead of designing everything by hand. Developers use it because it creates nearly infinite variety, like how Minecraft generates unique worlds every time.", quality: "good" }, { label: "Good try", text: "It's when computers make game content using math formulas. It saves time.", quality: "ok" }, { label: "Simple answer", text: "Making stuff with computers", quality: "weak" }] },
        { question: "Do you think esports should be considered a 'real' sport? Use evidence from the passage to support your argument.", options: [{ label: "Great answer", text: "Yes, because the passage shows esports is a legitimate career with million-dollar earnings. Athletes train intensely, and it requires real skill in strategy and reflexes. The fact that it's a career path supports treating it seriously.", quality: "good" }, { label: "Good try", text: "I think so because players earn millions and it takes a lot of skill.", quality: "ok" }, { label: "Simple answer", text: "Yeah, it's competitive", quality: "weak" }] },
        { question: "How does game development combine STEM skills with creative skills? Why is that combination important?", options: [{ label: "Great answer", text: "Developers need computer science for coding, math for physics and AI, but also art for visuals and narrative writing for story. This combination matters because great games need both technical excellence AND emotional engagement to succeed.", quality: "good" }, { label: "Good try", text: "You need coding and math for the technical parts, and art and writing for the creative parts.", quality: "ok" }, { label: "Simple answer", text: "You need both tech and creative stuff", quality: "weak" }] },
      ],
    },
    mathQuestions: {
      below: [
        { question: "If you play a game for 2 hours on Monday and 3 hours on Tuesday, how many hours did you play in total?", options: [{ label: "Correct", text: "5 hours! 2 + 3 = 5", quality: "good" }, { label: "Working on it", text: "Um... 5?", quality: "ok" }, { label: "Not sure", text: "I think maybe 4?", quality: "weak" }] },
        { question: "You have 10 coins in a game and you spend 4 on a new item. How many coins do you have left?", options: [{ label: "Correct", text: "6 coins left. 10 minus 4 is 6.", quality: "good" }, { label: "Working on it", text: "6?", quality: "ok" }, { label: "Not sure", text: "I'm not sure, maybe 5?", quality: "weak" }] },
        { question: "If you get 3 stars on each of 4 levels, how many stars do you have?", options: [{ label: "Correct", text: "12 stars! 3 times 4 is 12.", quality: "good" }, { label: "Working on it", text: "Let me count... 3, 6, 9, 12. 12 stars!", quality: "ok" }, { label: "Not sure", text: "A lot? Maybe 10?", quality: "weak" }] },
        { question: "You and 2 friends want to share 15 game tokens equally. How many does each person get?", options: [{ label: "Correct", text: "5 each! 15 divided by 3 people is 5.", quality: "good" }, { label: "Working on it", text: "15 divided by 3... 5?", quality: "ok" }, { label: "Not sure", text: "I don't know how to split them", quality: "weak" }] },
      ],
      on: [
        { question: "A game developer spent 240 hours building a game. If they worked 8 hours a day, how many days did it take?", options: [{ label: "Correct", text: "30 days. 240 divided by 8 is 30.", quality: "good" }, { label: "Working on it", text: "240 divided by 8... that's 30 days I think.", quality: "ok" }, { label: "Not sure", text: "A lot of days, maybe 20?", quality: "weak" }] },
        { question: "In a game tournament, first place wins $500, second wins half of first, and third wins half of second. How much does third place win?", options: [{ label: "Correct", text: "$125! Second is half of $500 which is $250, and half of $250 is $125.", quality: "good" }, { label: "Working on it", text: "Second gets $250... and half of that is... $125?", quality: "ok" }, { label: "Not sure", text: "Maybe $100?", quality: "weak" }] },
        { question: "A game has 1,200 players. If 25% of them play every day, how many daily players is that?", options: [{ label: "Correct", text: "300 players. 25% is one quarter, and 1,200 divided by 4 is 300.", quality: "good" }, { label: "Working on it", text: "25% of 1,200... that's like 1,200 divided by 4... 300?", quality: "ok" }, { label: "Not sure", text: "I don't know how to do percentages", quality: "weak" }] },
        { question: "You're saving up for a $60 game. You've saved $38 so far. If you earn $5.50 per week from chores, how many more weeks until you can buy it?", options: [{ label: "Correct", text: "I need $22 more. $22 divided by $5.50 is 4 weeks.", quality: "good" }, { label: "Working on it", text: "I need $22 more... at $5.50 a week... maybe 4 weeks?", quality: "ok" }, { label: "Not sure", text: "A few weeks? I'm not sure how to figure it out.", quality: "weak" }] },
      ],
      above: [
        { question: "An esports team won 72% of their 150 matches this season. How many matches did they win, and how many did they lose?", options: [{ label: "Correct", text: "They won 108 matches (150 × 0.72 = 108) and lost 42 (150 - 108 = 42).", quality: "good" }, { label: "Working on it", text: "72% of 150... 150 times 0.72... 108 wins? So 42 losses.", quality: "ok" }, { label: "Not sure", text: "I'd need to multiply but I'm not sure how to do percents with big numbers.", quality: "weak" }] },
        { question: "A game studio employs 85 people. They want to increase their team by 40% next year. How many total employees will they have?", options: [{ label: "Correct", text: "119 employees. 40% of 85 is 34, and 85 + 34 = 119.", quality: "good" }, { label: "Working on it", text: "40% of 85... that's 34 more people... so 119 total?", quality: "ok" }, { label: "Not sure", text: "More than 100? I'm not sure how to calculate it.", quality: "weak" }] },
        { question: "A gaming PC costs $1,200. It loses 15% of its value each year. What's it worth after 2 years?", options: [{ label: "Correct", text: "After year 1: $1,200 × 0.85 = $1,020. After year 2: $1,020 × 0.85 = $867.", quality: "good" }, { label: "Working on it", text: "15% of 1200 is 180, so after a year it's $1,020. Then 15% of that... around $867?", quality: "ok" }, { label: "Not sure", text: "It gets cheaper but I'm not sure exactly how much.", quality: "weak" }] },
        { question: "In a battle royale, 100 players start. Each round, 1/4 of the remaining players are eliminated. How many players are left after 3 rounds?", options: [{ label: "Correct", text: "Round 1: 100 × 3/4 = 75. Round 2: 75 × 3/4 = 56.25, so 56. Round 3: 56 × 3/4 = 42.", quality: "good" }, { label: "Working on it", text: "After round 1, 75 left. After round 2... about 56. After round 3... about 42?", quality: "ok" }, { label: "Not sure", text: "A quarter leave each time so... it keeps getting smaller but I'm not sure the exact number.", quality: "weak" }] },
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
        { question: "What are some things you can learn from playing sports?", options: [{ label: "Great answer", text: "You learn teamwork and to keep trying even when it's hard. You also get stronger and make friends.", quality: "good" }, { label: "Good try", text: "You learn to play with other people.", quality: "ok" }, { label: "Simple answer", text: "Teamwork", quality: "weak" }] },
        { question: "Why do you think sports help you make friends?", options: [{ label: "Great answer", text: "Because you're playing together and working as a team, so you spend time together and help each other.", quality: "good" }, { label: "Good try", text: "Because you play with other people.", quality: "ok" }, { label: "Simple answer", text: "You meet people", quality: "weak" }] },
        { question: "What does 'keep trying even when things are hard' mean to you?", options: [{ label: "Great answer", text: "It means not giving up when you make a mistake or lose. Like if you miss a shot, you try again next time.", quality: "good" }, { label: "Good try", text: "Don't give up.", quality: "ok" }, { label: "Simple answer", text: "Try hard", quality: "weak" }] },
        { question: "What sport would you want to try and why?", options: [{ label: "Great answer", text: "I'd want to try swimming because it uses your whole body and you can do it even when it's hot outside.", quality: "good" }, { label: "Good try", text: "Soccer because it looks fun.", quality: "ok" }, { label: "Simple answer", text: "Basketball", quality: "weak" }] },
      ],
      on: [
        { question: "Besides practicing their sport, what else do athletes do to perform their best?", options: [{ label: "Great answer", text: "They study game strategy to outsmart opponents, eat proper nutrition to fuel their body, and get enough rest so their muscles can recover and grow.", quality: "good" }, { label: "Good try", text: "They eat healthy food and get enough sleep.", quality: "ok" }, { label: "Simple answer", text: "They train a lot", quality: "weak" }] },
        { question: "Why do you think starting young is important for athletes? What advantages does it give them?", options: [{ label: "Great answer", text: "Starting young gives them more time to build muscle memory and perfect techniques. Their bodies are still growing so they can adapt better. Plus they accumulate thousands of practice hours by the time they're adults.", quality: "good" }, { label: "Good try", text: "They get more practice time and get really good by the time they're older.", quality: "ok" }, { label: "Simple answer", text: "More practice", quality: "weak" }] },
        { question: "What do sports scientists study and why is that helpful?", options: [{ label: "Great answer", text: "They study how the body moves and recovers. This helps because they can figure out the best way to train and prevent injuries, so athletes can perform at their peak.", quality: "good" }, { label: "Good try", text: "They study bodies and movement to help athletes get better.", quality: "ok" }, { label: "Simple answer", text: "How bodies work", quality: "weak" }] },
        { question: "What does 'dedicate' mean in this passage? Use it in your own sentence.", options: [{ label: "Great answer", text: "Dedicate means to devote all your time and effort to something. Like: 'I dedicated my whole summer to learning how to skateboard.'", quality: "good" }, { label: "Good try", text: "It means to work really hard at something. I dedicated time to my homework.", quality: "ok" }, { label: "Simple answer", text: "To try really hard", quality: "weak" }] },
      ],
      above: [
        { question: "How has technology changed the way athletes train? Give specific examples from the passage.", options: [{ label: "Great answer", text: "Technology like motion capture analyzes exact body movements to fix form, GPS tracking monitors speed and distance during practice, and heart rate monitoring shows recovery status. This means training is based on real data instead of just guesswork.", quality: "good" }, { label: "Good try", text: "They use motion capture and GPS to track how athletes perform and make training better.", quality: "ok" }, { label: "Simple answer", text: "Technology helps them train better", quality: "weak" }] },
        { question: "What is 'deliberate practice' and why is it better than just practicing more?", options: [{ label: "Great answer", text: "Deliberate practice is structured training that targets specific weaknesses rather than just repeating what you already know. It's more effective because you spend time improving the areas that actually need work, rather than just accumulating hours of general practice.", quality: "good" }, { label: "Good try", text: "It's focused practice on your weak spots. It works better than just doing the same thing over and over.", quality: "ok" }, { label: "Simple answer", text: "Practice that focuses on getting better at specific things", quality: "weak" }] },
        { question: "What does 'periodization' mean in context, and why would an athlete want to 'peak at the right time'?", options: [{ label: "Great answer", text: "Periodization is structuring training in cycles so performance peaks during competitions. Athletes can't be at 100% all the time, so they strategically plan when to train hard and when to recover, timing their best performance for championships or Olympics.", quality: "good" }, { label: "Good try", text: "It's planning training so you're at your best for big competitions instead of burning out early.", quality: "ok" }, { label: "Simple answer", text: "Training in phases to be ready for competitions", quality: "weak" }] },
        { question: "Do you think data-driven training takes away from the 'art' of sports coaching? Defend your position.", options: [{ label: "Great answer", text: "I think it enhances coaching rather than replacing it. Data gives coaches objective information to make better decisions, but they still need intuition and people skills to motivate athletes and make real-time game decisions that numbers can't capture.", quality: "good" }, { label: "Good try", text: "No, I think data helps coaches make better decisions. They can use both data and their experience.", quality: "ok" }, { label: "Simple answer", text: "Data is helpful but coaches still matter", quality: "weak" }] },
      ],
    },
    mathQuestions: {
      below: [
        { question: "Your team scored 3 goals in the first half and 2 goals in the second half. How many goals total?", options: [{ label: "Correct", text: "5 goals! 3 + 2 = 5", quality: "good" }, { label: "Working on it", text: "5?", quality: "ok" }, { label: "Not sure", text: "Maybe 4?", quality: "weak" }] },
        { question: "There are 12 players on the bench and 5 go into the game. How many are still on the bench?", options: [{ label: "Correct", text: "7 players. 12 minus 5 is 7.", quality: "good" }, { label: "Working on it", text: "12 take away 5... 7?", quality: "ok" }, { label: "Not sure", text: "I'm not sure, maybe 6?", quality: "weak" }] },
        { question: "If practice is 2 hours long and you practice 3 days a week, how many hours of practice is that?", options: [{ label: "Correct", text: "6 hours! 2 times 3 is 6.", quality: "good" }, { label: "Working on it", text: "2 plus 2 plus 2 is 6 hours.", quality: "ok" }, { label: "Not sure", text: "Maybe 5 hours?", quality: "weak" }] },
        { question: "You need 20 points to win. You've scored 14. How many more do you need?", options: [{ label: "Correct", text: "6 more points! 20 minus 14 is 6.", quality: "good" }, { label: "Working on it", text: "20 minus 14... 6 I think.", quality: "ok" }, { label: "Not sure", text: "Some more, maybe 5?", quality: "weak" }] },
      ],
      on: [
        { question: "A basketball player makes 3-point shots 40% of the time. If she takes 20 shots, about how many would you expect her to make?", options: [{ label: "Correct", text: "8 shots. 40% of 20 is 8.", quality: "good" }, { label: "Working on it", text: "40% of 20... that's like 8?", quality: "ok" }, { label: "Not sure", text: "I don't know how to do percents well.", quality: "weak" }] },
        { question: "A runner completes a 5K race in 22 minutes and 30 seconds. What was their average pace per kilometer?", options: [{ label: "Correct", text: "4 minutes 30 seconds per km. 22.5 minutes divided by 5 is 4.5 minutes.", quality: "good" }, { label: "Working on it", text: "22 and a half minutes divided by 5... about 4 and a half minutes?", quality: "ok" }, { label: "Not sure", text: "I'd need to divide but I'm not sure how.", quality: "weak" }] },
        { question: "A football field is 100 yards long. If a player runs from one end to the other and back 6 times during practice, how far did they run in total?", options: [{ label: "Correct", text: "1,200 yards. Each round trip is 200 yards (100 there and 100 back), times 6 is 1,200.", quality: "good" }, { label: "Working on it", text: "100 yards there and back is 200, times 6... 1,200 yards?", quality: "ok" }, { label: "Not sure", text: "A lot? 600 yards maybe?", quality: "weak" }] },
        { question: "A team won 18 games and lost 12. What percentage of their games did they win?", options: [{ label: "Correct", text: "60%. They played 30 games total, and 18 out of 30 is 60%.", quality: "good" }, { label: "Working on it", text: "18 plus 12 is 30 total... 18 out of 30... that's 60%?", quality: "ok" }, { label: "Not sure", text: "More than half? I'm not sure of the exact percentage.", quality: "weak" }] },
      ],
      above: [
        { question: "An athlete's heart rate during training follows a pattern: 2 minutes at 170 bpm, then 1 minute recovery at 120 bpm. Over a 30-minute session, what is the average heart rate?", options: [{ label: "Correct", text: "In each 3-min cycle: (170×2 + 120×1)/3 = 460/3 ≈ 153.3 bpm. The pattern repeats 10 times in 30 minutes, so the average is about 153 bpm.", quality: "good" }, { label: "Working on it", text: "Two-thirds of the time at 170 and one-third at 120... so weighted average is about 153 bpm?", quality: "ok" }, { label: "Not sure", text: "Somewhere between 120 and 170... maybe around 150?", quality: "weak" }] },
        { question: "A sprinter improves their 100m time by 2% each month. If they start at 12.5 seconds, what will their time be after 3 months?", options: [{ label: "Correct", text: "Month 1: 12.5 × 0.98 = 12.25s. Month 2: 12.25 × 0.98 = 12.005s. Month 3: 12.005 × 0.98 ≈ 11.76s.", quality: "good" }, { label: "Working on it", text: "Each month is 98% of the previous time... after 3 months about 11.76 seconds?", quality: "ok" }, { label: "Not sure", text: "Faster than 12.5 but I'm not sure how to calculate repeated percentages.", quality: "weak" }] },
        { question: "A stadium has 45,000 seats. Tickets cost $35 for general and $75 for premium. If 70% of seats are general and the rest premium, what is the total revenue if every seat is sold?", options: [{ label: "Correct", text: "General: 31,500 × $35 = $1,102,500. Premium: 13,500 × $75 = $1,012,500. Total: $2,115,000.", quality: "good" }, { label: "Working on it", text: "70% of 45,000 is 31,500 general seats. 13,500 premium. Total revenue would be... over $2 million?", quality: "ok" }, { label: "Not sure", text: "I'd need to multiply a lot of numbers and I'm not sure where to start.", quality: "weak" }] },
        { question: "A basketball player's shooting percentage was 45% after 200 shots. How many more consecutive shots must they make (no misses) to raise their percentage to 50%?", options: [{ label: "Correct", text: "They've made 90/200. Need (90+x)/(200+x) = 0.5. Solving: 90+x = 100+0.5x, so 0.5x = 10, x = 20 consecutive makes.", quality: "good" }, { label: "Working on it", text: "90 makes out of 200. I need to solve an equation... I think about 20?", quality: "ok" }, { label: "Not sure", text: "I'm not sure how to set up this kind of problem.", quality: "weak" }] },
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
        { question: "What do animals need to live?", options: [{ label: "Great answer", text: "Animals need food, water, and a safe place to live. The passage says their home needs to be safe.", quality: "good" }, { label: "Good try", text: "Food and water.", quality: "ok" }, { label: "Simple answer", text: "Food", quality: "weak" }] },
        { question: "How can people help animals?", options: [{ label: "Great answer", text: "People can help by taking care of the places where animals live, like not polluting forests and oceans.", quality: "good" }, { label: "Good try", text: "By protecting where they live.", quality: "ok" }, { label: "Simple answer", text: "Be nice to them", quality: "weak" }] },
        { question: "Why do baby animals learn from their parents?", options: [{ label: "Great answer", text: "Because their parents know how to find food and stay safe, so babies watch them to learn how to survive.", quality: "good" }, { label: "Good try", text: "So they know what to do.", quality: "ok" }, { label: "Simple answer", text: "To learn stuff", quality: "weak" }] },
        { question: "What's your favorite animal and why?", options: [{ label: "Great answer", text: "I love dolphins because they're smart, they swim fast, and they play with each other.", quality: "good" }, { label: "Good try", text: "Dogs because they're cute.", quality: "ok" }, { label: "Simple answer", text: "Cats", quality: "weak" }] },
      ],
      on: [
        { question: "How does echolocation help dolphins? Explain it in your own words.", options: [{ label: "Great answer", text: "Dolphins make sounds that travel through the water and bounce off fish and other objects. When the sound comes back, the dolphin can tell where things are, even in dark or murky water. It's like seeing with sound.", quality: "good" }, { label: "Good try", text: "They send out sounds and the sounds bounce back so they can find food.", quality: "ok" }, { label: "Simple answer", text: "They use sound to find food", quality: "weak" }] },
        { question: "Why do Arctic foxes change color? What would happen if they didn't?", options: [{ label: "Great answer", text: "They change color for camouflage, matching their surroundings in each season. If they stayed brown in winter, predators could easily spot them against the white snow, and they'd also have a harder time sneaking up on prey.", quality: "good" }, { label: "Good try", text: "For camouflage. If they didn't change, they'd be easy to see in the snow.", quality: "ok" }, { label: "Simple answer", text: "To hide from other animals", quality: "weak" }] },
        { question: "How is elephant communication different from how most animals communicate?", options: [{ label: "Great answer", text: "Most animals communicate with sounds you can hear, but elephants use low-frequency sounds that travel through the ground. Other elephants feel these vibrations through their feet, so they can communicate over miles. It's like they have a secret underground messaging system.", quality: "good" }, { label: "Good try", text: "They use sounds that go through the ground instead of through the air, and feel them with their feet.", quality: "ok" }, { label: "Simple answer", text: "They use ground vibrations", quality: "weak" }] },
        { question: "What does 'camouflage' mean? Can you think of another animal that uses it?", options: [{ label: "Great answer", text: "Camouflage is when an animal's color or pattern helps it blend in with its surroundings. Chameleons are great at this because they can actually change color to match what's around them.", quality: "good" }, { label: "Good try", text: "It means blending in. Like a chameleon changes colors.", quality: "ok" }, { label: "Simple answer", text: "Hiding by matching colors", quality: "weak" }] },
      ],
      above: [
        { question: "The passage mentions species going extinct at 100-1,000 times the natural rate. What does 'natural background rate' mean and why is the comparison important?", options: [{ label: "Great answer", text: "The natural background rate is how fast species would normally go extinct without human influence — it's the baseline. Comparing current rates to it shows just how dramatically humans have accelerated extinction. Even at the low estimate of 100x, that's catastrophic for biodiversity.", quality: "good" }, { label: "Good try", text: "It's the normal rate of extinction. The comparison shows humans are making it much worse.", quality: "ok" }, { label: "Simple answer", text: "It's how fast species normally go extinct", quality: "weak" }] },
        { question: "What is a 'keystone species' and why are they so important to an ecosystem?", options: [{ label: "Great answer", text: "A keystone species has an outsized impact on its ecosystem relative to its population size. Like sea otters eating sea urchins that would otherwise destroy kelp forests. Removing one keystone species creates a chain reaction that can collapse the entire food web — it's like pulling a key brick from an arch.", quality: "good" }, { label: "Good try", text: "A species that's really important to the whole ecosystem. If you remove it, everything else gets messed up.", quality: "ok" }, { label: "Simple answer", text: "An important species that other species depend on", quality: "weak" }] },
        { question: "What are 'cascading effects' and how might removing sea otters cause them in kelp forests?", options: [{ label: "Great answer", text: "Cascading effects are chain reactions through a food web. Without sea otters, sea urchin populations explode. Urchins eat kelp. Kelp forests disappear. Fish that lived in kelp lose habitat. Animals that ate those fish lose food sources. The whole ecosystem unravels from one removal.", quality: "good" }, { label: "Good try", text: "It means one change causes many other changes. Without otters, urchins eat all the kelp and other animals lose their habitat.", quality: "ok" }, { label: "Simple answer", text: "One thing goes wrong and it makes other things go wrong too", quality: "weak" }] },
        { question: "If you were a conservation biologist, what strategy would you prioritize to slow biodiversity loss? Use evidence from the passage.", options: [{ label: "Great answer", text: "I'd prioritize habitat protection since the passage lists habitat destruction as a primary driver. Specifically, I'd focus on protecting areas with keystone species, since the passage shows their removal triggers cascading ecosystem collapse. It's the most efficient use of limited conservation resources.", quality: "good" }, { label: "Good try", text: "I'd focus on protecting habitats since that's listed as the biggest cause of extinction.", quality: "ok" }, { label: "Simple answer", text: "Stop destroying habitats", quality: "weak" }] },
      ],
    },
    mathQuestions: {
      below: [
        { question: "A cat has 4 kittens. If 2 more kittens are born, how many kittens are there now?", options: [{ label: "Correct", text: "6 kittens! 4 + 2 = 6", quality: "good" }, { label: "Working on it", text: "6?", quality: "ok" }, { label: "Not sure", text: "Maybe 5?", quality: "weak" }] },
        { question: "A dog eats 3 cups of food each day. How many cups does it eat in 5 days?", options: [{ label: "Correct", text: "15 cups! 3 times 5 is 15.", quality: "good" }, { label: "Working on it", text: "3, 6, 9, 12, 15. So 15 cups!", quality: "ok" }, { label: "Not sure", text: "A lot? Maybe 12?", quality: "weak" }] },
        { question: "There are 9 birds on a fence. 4 fly away. How many are left?", options: [{ label: "Correct", text: "5 birds. 9 minus 4 is 5.", quality: "good" }, { label: "Working on it", text: "9 take away 4 is... 5?", quality: "ok" }, { label: "Not sure", text: "Maybe 4?", quality: "weak" }] },
        { question: "You see 8 fish in a tank. If you put them in 2 equal groups, how many are in each group?", options: [{ label: "Correct", text: "4 fish in each group! 8 divided by 2 is 4.", quality: "good" }, { label: "Working on it", text: "4?", quality: "ok" }, { label: "Not sure", text: "I'm not sure how to split them", quality: "weak" }] },
      ],
      on: [
        { question: "A cheetah can run 70 miles per hour. A house cat can run 30 miles per hour. How many times faster is the cheetah?", options: [{ label: "Correct", text: "About 2.3 times faster. 70 divided by 30 is 2.33.", quality: "good" }, { label: "Working on it", text: "70 divided by 30... more than 2 times faster?", quality: "ok" }, { label: "Not sure", text: "A lot faster but I'm not sure the exact number.", quality: "weak" }] },
        { question: "A zoo has 156 animals. If 1/3 are mammals, 1/4 are birds, and the rest are reptiles and fish, how many are reptiles and fish?", options: [{ label: "Correct", text: "Mammals: 52 (156÷3). Birds: 39 (156÷4). That's 91, so reptiles and fish = 156 - 91 = 65.", quality: "good" }, { label: "Working on it", text: "1/3 of 156 is 52, 1/4 is 39... 52 plus 39 is 91... so 65 are reptiles and fish?", quality: "ok" }, { label: "Not sure", text: "I need to do fractions and I'm not sure how.", quality: "weak" }] },
        { question: "An elephant eats 300 pounds of food per day. How many tons does it eat in a month (30 days)? (1 ton = 2,000 pounds)", options: [{ label: "Correct", text: "300 × 30 = 9,000 pounds. 9,000 ÷ 2,000 = 4.5 tons per month!", quality: "good" }, { label: "Working on it", text: "300 times 30 is 9,000 pounds... divided by 2,000... 4.5 tons?", quality: "ok" }, { label: "Not sure", text: "A lot of food! I'm not sure how to convert to tons.", quality: "weak" }] },
        { question: "A wildlife reserve is 840 acres. If they want to expand it by 35%, how many total acres will it be?", options: [{ label: "Correct", text: "840 × 1.35 = 1,134 acres. Or: 35% of 840 is 294, plus 840 is 1,134.", quality: "good" }, { label: "Working on it", text: "35% of 840... that's about 294 more acres? So about 1,134 total?", quality: "ok" }, { label: "Not sure", text: "Bigger than 840 but I'm not sure how much.", quality: "weak" }] },
      ],
      above: [
        { question: "A wolf pack territory is roughly circular with a diameter of 20 miles. What's the approximate area? (Use π ≈ 3.14)", options: [{ label: "Correct", text: "Radius is 10 miles. Area = π × r² = 3.14 × 100 = 314 square miles.", quality: "good" }, { label: "Working on it", text: "Radius is 10, and area of a circle is pi times radius squared... 3.14 times 100 is 314 square miles?", quality: "ok" }, { label: "Not sure", text: "I know the formula has pi in it but I'm not sure how to use it.", quality: "weak" }] },
        { question: "A population of rabbits doubles every 3 months. Starting with 12 rabbits, how many will there be after 1 year?", options: [{ label: "Correct", text: "1 year = 4 doubling periods. 12 → 24 → 48 → 96 → 192 rabbits.", quality: "good" }, { label: "Working on it", text: "Doubles 4 times in a year... 12, 24, 48, 96, 192?", quality: "ok" }, { label: "Not sure", text: "A lot more than 12? I know it doubles but I'm not sure how many times.", quality: "weak" }] },
        { question: "Conservationists tagged 50 fish in a lake. A week later, they caught 80 fish and 10 had tags. Estimate the total fish population.", options: [{ label: "Correct", text: "Using capture-recapture: 10/80 = 50/N. So N = 50 × 80/10 = 400 fish in the lake.", quality: "good" }, { label: "Working on it", text: "10 out of 80 were tagged, and there are 50 tagged total... so the lake has about 400 fish?", quality: "ok" }, { label: "Not sure", text: "More than 80 since only some were tagged? I'm not sure how to calculate it.", quality: "weak" }] },
        { question: "A migration route is 3,500 miles. A bird flies at 35 mph for 10 hours per day. How many days will the journey take?", options: [{ label: "Correct", text: "Distance per day: 35 × 10 = 350 miles. Total days: 3,500 ÷ 350 = 10 days.", quality: "good" }, { label: "Working on it", text: "35 mph for 10 hours is 350 miles per day. 3,500 divided by 350 is 10 days.", quality: "ok" }, { label: "Not sure", text: "They fly 350 miles a day so... a couple weeks maybe?", quality: "weak" }] },
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
        { question: "What are some instruments you can use to make music?", options: [{ label: "Great answer", text: "Guitars, drums, and pianos! And the passage says you can even use your voice.", quality: "good" }, { label: "Good try", text: "Guitar and drums.", quality: "ok" }, { label: "Simple answer", text: "Instruments", quality: "weak" }] },
        { question: "How can music make you feel?", options: [{ label: "Great answer", text: "Music can make you feel happy, sad, or excited. Different songs give you different feelings.", quality: "good" }, { label: "Good try", text: "Happy or sad.", quality: "ok" }, { label: "Simple answer", text: "Good", quality: "weak" }] },
        { question: "Why do you think people all around the world love music?", options: [{ label: "Great answer", text: "Because music makes people feel things and it's fun to listen to and play. Everyone likes feeling happy!", quality: "good" }, { label: "Good try", text: "Because it sounds good.", quality: "ok" }, { label: "Simple answer", text: "It's fun", quality: "weak" }] },
        { question: "What kind of music do you like?", options: [{ label: "Great answer", text: "I like hip-hop because it has a good beat and the lyrics tell stories about real life.", quality: "good" }, { label: "Good try", text: "Pop music because it's catchy.", quality: "ok" }, { label: "Simple answer", text: "Rap", quality: "weak" }] },
      ],
      on: [
        { question: "How do different instruments create different sounds? Explain using examples from the passage.", options: [{ label: "Great answer", text: "Each instrument creates vibrations differently. A guitar vibrates its strings when plucked, a drum vibrates its skin when hit, and a flute makes air vibrate inside it. The different types of vibrations create unique sounds.", quality: "good" }, { label: "Good try", text: "They all vibrate differently. Guitars vibrate strings and drums vibrate the drum skin.", quality: "ok" }, { label: "Simple answer", text: "They vibrate in different ways", quality: "weak" }] },
        { question: "Why do musicians spend years learning their instrument? What are they trying to control?", options: [{ label: "Great answer", text: "They're learning to control vibrations precisely to create melodies, harmonies, and rhythms. It takes years because making those vibrations sound exactly right and emotionally moving requires incredible precision and feel.", quality: "good" }, { label: "Good try", text: "They're controlling the vibrations to make good music. It takes a lot of practice.", quality: "ok" }, { label: "Simple answer", text: "To get better at playing", quality: "weak" }] },
        { question: "What's the difference between melody, harmony, and rhythm?", options: [{ label: "Great answer", text: "Melody is the main tune you hum along to. Harmony is when multiple notes are played together to support the melody. Rhythm is the pattern of beats that gives music its groove.", quality: "good" }, { label: "Good try", text: "Melody is the tune, harmony is notes together, and rhythm is the beat.", quality: "ok" }, { label: "Simple answer", text: "Different parts of music", quality: "weak" }] },
        { question: "What does 'vibrations' mean? Why is that word important when talking about music?", options: [{ label: "Great answer", text: "Vibrations are rapid back-and-forth movements. It's important because ALL sound is vibration — every instrument creates music by making something vibrate at specific frequencies, which our ears pick up as different notes.", quality: "good" }, { label: "Good try", text: "Things moving back and forth really fast. Sound is made from vibrations.", quality: "ok" }, { label: "Simple answer", text: "Shaking that makes sound", quality: "weak" }] },
      ],
      above: [
        { question: "The passage mentions multiple brain regions activating during music. Why might this make music uniquely powerful compared to other activities?", options: [{ label: "Great answer", text: "Music simultaneously engages auditory processing, motor responses, and emotions — it's a whole-brain workout. Most activities only engage one or two regions. This multi-region activation may explain why music can trigger memories, motivate physical movement, and alter mood all at once.", quality: "good" }, { label: "Good try", text: "It uses many parts of the brain at once, which makes it affect us more strongly than other things.", quality: "ok" }, { label: "Simple answer", text: "It uses the whole brain", quality: "weak" }] },
        { question: "What does the jazz improvisation study reveal about creativity?", options: [{ label: "Great answer", text: "It shows that creativity may require turning off self-censorship. When jazz musicians improvise, their self-monitoring brain regions deactivate while creative centers activate. This suggests the best creative work comes from a flow state where you stop judging yourself.", quality: "good" }, { label: "Good try", text: "Creativity works better when you stop overthinking and just let ideas flow.", quality: "ok" }, { label: "Simple answer", text: "Being creative means letting go of control", quality: "weak" }] },
        { question: "How does musical training physically change the brain? What does this suggest about brain plasticity?", options: [{ label: "Great answer", text: "Musical training increases the corpus callosum size and enhances neural connectivity. This demonstrates neuroplasticity — the brain physically restructures in response to sustained practice. It suggests that dedicated training in any complex skill could reshape brain architecture, not just music.", quality: "good" }, { label: "Good try", text: "The brain grows bigger in certain areas with practice. It shows the brain can change and adapt.", quality: "ok" }, { label: "Simple answer", text: "Practice changes your brain", quality: "weak" }] },
        { question: "If music training enhances the brain, should music education be mandatory in schools? Build an argument using the passage.", options: [{ label: "Great answer", text: "Yes — the passage shows music training enhances neural connectivity and increases brain structure size. If music literally builds better brains, the educational ROI is enormous. It's not just about producing musicians; it's about developing cognitive architecture that benefits all learning.", quality: "good" }, { label: "Good try", text: "I think so because the passage shows music makes your brain stronger, which could help with other subjects too.", quality: "ok" }, { label: "Simple answer", text: "Yes because it's good for your brain", quality: "weak" }] },
      ],
    },
    mathQuestions: {
      below: [
        { question: "If a song is 3 minutes long and you listen to it 4 times, how many minutes is that?", options: [{ label: "Correct", text: "12 minutes! 3 times 4 is 12.", quality: "good" }, { label: "Working on it", text: "3 plus 3 plus 3 plus 3... 12!", quality: "ok" }, { label: "Not sure", text: "Maybe 10?", quality: "weak" }] },
        { question: "You have 8 songs on a playlist and you add 5 more. How many songs do you have now?", options: [{ label: "Correct", text: "13 songs! 8 + 5 = 13.", quality: "good" }, { label: "Working on it", text: "8 plus 5 is 13.", quality: "ok" }, { label: "Not sure", text: "Maybe 12?", quality: "weak" }] },
        { question: "A band has 6 members. Each member has 2 instruments. How many instruments does the band have in total?", options: [{ label: "Correct", text: "12 instruments! 6 times 2 is 12.", quality: "good" }, { label: "Working on it", text: "6 and 6 is 12?", quality: "ok" }, { label: "Not sure", text: "A lot, maybe 10?", quality: "weak" }] },
        { question: "Your music class is 45 minutes long. If 15 minutes have passed, how many minutes are left?", options: [{ label: "Correct", text: "30 minutes left! 45 minus 15 is 30.", quality: "good" }, { label: "Working on it", text: "45 take away 15... 30?", quality: "ok" }, { label: "Not sure", text: "About 25 minutes?", quality: "weak" }] },
      ],
      on: [
        { question: "A concert ticket costs $45. If 1,200 tickets are sold, how much money is that?", options: [{ label: "Correct", text: "$54,000. 45 × 1,200 = 54,000.", quality: "good" }, { label: "Working on it", text: "45 times 1,200... that's $54,000?", quality: "ok" }, { label: "Not sure", text: "A lot of money, maybe $50,000?", quality: "weak" }] },
        { question: "A song is 4 minutes 30 seconds. An album has 12 songs averaging the same length. How long is the album?", options: [{ label: "Correct", text: "4.5 minutes × 12 = 54 minutes total.", quality: "good" }, { label: "Working on it", text: "4 and a half minutes times 12... 54 minutes?", quality: "ok" }, { label: "Not sure", text: "About an hour?", quality: "weak" }] },
        { question: "A musician practices 2.5 hours per day, 6 days a week. How many hours do they practice in a year (52 weeks)?", options: [{ label: "Correct", text: "2.5 × 6 = 15 hours per week. 15 × 52 = 780 hours per year.", quality: "good" }, { label: "Working on it", text: "15 hours a week times 52 weeks... about 780 hours?", quality: "ok" }, { label: "Not sure", text: "A lot, hundreds of hours.", quality: "weak" }] },
        { question: "A streaming platform pays $0.004 per song play. How many plays does an artist need to earn $1,000?", options: [{ label: "Correct", text: "250,000 plays! $1,000 ÷ $0.004 = 250,000.", quality: "good" }, { label: "Working on it", text: "$1,000 divided by $0.004... that's 250,000 plays?", quality: "ok" }, { label: "Not sure", text: "A huge number, I'm not sure how to divide by a decimal.", quality: "weak" }] },
      ],
      above: [
        { question: "Sound travels at 343 meters per second. If a concert speaker is 50 meters away from the back row, what's the delay in milliseconds between the front row (2m) and back row?", options: [{ label: "Correct", text: "Front row: 2/343 ≈ 0.00583s. Back row: 50/343 ≈ 0.1458s. Delay: about 140 milliseconds.", quality: "good" }, { label: "Working on it", text: "50 minus 2 is 48 meters of difference. 48/343 is about 0.14 seconds, or 140 milliseconds?", quality: "ok" }, { label: "Not sure", text: "There would be a small delay but I'm not sure how to calculate it.", quality: "weak" }] },
        { question: "A guitar string vibrates at 440 Hz (cycles per second) for the note A. If you play for 5 seconds, how many complete vibrations occur?", options: [{ label: "Correct", text: "2,200 vibrations. 440 × 5 = 2,200.", quality: "good" }, { label: "Working on it", text: "440 times 5... 2,200 vibrations?", quality: "ok" }, { label: "Not sure", text: "Thousands? Hz is confusing.", quality: "weak" }] },
        { question: "An artist releases an album that costs $12 to produce per unit. They sell it for $20 digital and $25 physical. If they sell 60% digital and 40% physical out of 10,000 copies, what's the total profit?", options: [{ label: "Correct", text: "Digital: 6,000 × ($20-$12) = $48,000. Physical: 4,000 × ($25-$12) = $52,000. Total profit: $100,000.", quality: "good" }, { label: "Working on it", text: "6,000 digital at $8 profit each, and 4,000 physical at $13 profit each... about $100,000 total?", quality: "ok" }, { label: "Not sure", text: "I'd need to calculate digital and physical separately, which is complex.", quality: "weak" }] },
        { question: "A metronome is set to 120 BPM (beats per minute). A song is in 4/4 time. How many measures (bars) occur in a 3-minute song?", options: [{ label: "Correct", text: "120 BPM × 3 min = 360 beats. In 4/4 time, each measure is 4 beats. 360 ÷ 4 = 90 measures.", quality: "good" }, { label: "Working on it", text: "360 total beats, 4 per measure... 90 measures?", quality: "ok" }, { label: "Not sure", text: "I know BPM but I'm not sure how measures work with time signatures.", quality: "weak" }] },
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
        { question: "What do scientists do?", options: [{ label: "Great answer", text: "Scientists ask questions about how things work and do experiments to find the answers.", quality: "good" }, { label: "Good try", text: "They do experiments.", quality: "ok" }, { label: "Simple answer", text: "Study stuff", quality: "weak" }] },
        { question: "How can you think like a scientist?", options: [{ label: "Great answer", text: "By asking 'why?' and 'how?' about things. Whenever you're curious about something, you're thinking like a scientist!", quality: "good" }, { label: "Good try", text: "By asking questions.", quality: "ok" }, { label: "Simple answer", text: "Ask why", quality: "weak" }] },
        { question: "What is an experiment?", options: [{ label: "Great answer", text: "An experiment is when you test an idea to see if it's true. Like if you think plants need sunlight, you could put one in the dark and one in light to compare.", quality: "good" }, { label: "Good try", text: "Testing something to see what happens.", quality: "ok" }, { label: "Simple answer", text: "A test", quality: "weak" }] },
        { question: "What's something you've been curious about?", options: [{ label: "Great answer", text: "I've wondered why the sky is blue during the day but turns orange and pink during sunset. It's really cool.", quality: "good" }, { label: "Good try", text: "Why do stars twinkle.", quality: "ok" }, { label: "Simple answer", text: "Space", quality: "weak" }] },
      ],
      on: [
        { question: "How does Olympus Mons compare to mountains on Earth? Why do you think Mars can have a bigger volcano?", options: [{ label: "Great answer", text: "Olympus Mons is nearly three times taller than Mount Everest, which is Earth's tallest mountain. Mars might have bigger volcanoes because it has lower gravity, so volcanic rock can pile up higher without collapsing.", quality: "good" }, { label: "Good try", text: "It's three times bigger than Everest. Mars probably has weaker gravity.", quality: "ok" }, { label: "Simple answer", text: "It's really big, bigger than anything on Earth", quality: "weak" }] },
        { question: "What surprises you most about Jupiter's Great Red Spot?", options: [{ label: "Great answer", text: "That a storm has been raging for over 400 years and is big enough to swallow Earth! On Earth, storms last days, not centuries. It shows how different other planets are from ours.", quality: "good" }, { label: "Good try", text: "That it's been going for 400 years. Earth storms don't last that long.", quality: "ok" }, { label: "Simple answer", text: "It's really old", quality: "weak" }] },
        { question: "Saturn's rings look solid but they're not. What are they actually made of?", options: [{ label: "Great answer", text: "They're made of billions of pieces of ice and rock in all different sizes — from tiny grains like sand to huge chunks as big as houses, all orbiting around Saturn.", quality: "good" }, { label: "Good try", text: "Ice and rock pieces of different sizes.", quality: "ok" }, { label: "Simple answer", text: "Ice and rocks", quality: "weak" }] },
        { question: "If you could explore one place in our solar system, where would you go and why?", options: [{ label: "Great answer", text: "I'd explore Europa, one of Jupiter's moons, because scientists think there's a liquid ocean under its ice surface that might contain life. Discovering alien life would be the biggest discovery ever.", quality: "good" }, { label: "Good try", text: "Mars, because we might live there someday and I want to see the big volcano.", quality: "ok" }, { label: "Simple answer", text: "The moon because it's close", quality: "weak" }] },
      ],
      above: [
        { question: "What does 'superposition' mean and why does it challenge our everyday understanding?", options: [{ label: "Great answer", text: "Superposition means a particle exists in multiple states at once until it's observed. This defies everyday logic because we're used to things being in one definite state — a ball is either here or there, never both. At the quantum level, that certainty dissolves.", quality: "good" }, { label: "Good try", text: "Particles can be in multiple states at the same time, which doesn't match how things work in our daily life.", quality: "ok" }, { label: "Simple answer", text: "Things can be in two states at once", quality: "weak" }] },
        { question: "Why did Einstein call quantum entanglement 'spooky action at a distance'?", options: [{ label: "Great answer", text: "Because entangled particles affect each other instantly regardless of distance, which seems to violate the speed of light — nothing should be able to communicate faster than light according to Einstein's own theory of relativity. It seemed impossible, almost supernatural.", quality: "good" }, { label: "Good try", text: "Because it seems to break the rules of physics — particles affecting each other instantly across huge distances.", quality: "ok" }, { label: "Simple answer", text: "Because it seems impossible", quality: "weak" }] },
        { question: "How does the double-slit experiment show that observation changes reality? What's philosophically strange about that?", options: [{ label: "Great answer", text: "Electrons create an interference pattern (wave behavior) when unobserved, but act like particles when measured. The act of looking literally changes what happens. Philosophically, it suggests objective reality might not exist independently of observation — the universe behaves differently when no one is watching.", quality: "good" }, { label: "Good try", text: "Electrons act differently when watched versus not watched. It's weird that measuring something can change how it behaves.", quality: "ok" }, { label: "Simple answer", text: "Watching changes what particles do", quality: "weak" }] },
        { question: "Why could quantum computers solve problems that classical computers can't? What makes them fundamentally different?", options: [{ label: "Great answer", text: "Classical computers use bits (0 or 1). Quantum computers use qubits that exploit superposition to be 0 AND 1 simultaneously. This means they can process exponentially more possibilities in parallel. For certain problems like factoring huge numbers or simulating molecules, this parallelism is transformative.", quality: "good" }, { label: "Good try", text: "They use quantum properties to process many possibilities at once instead of one at a time like regular computers.", quality: "ok" }, { label: "Simple answer", text: "They're faster because of quantum physics", quality: "weak" }] },
      ],
    },
    mathQuestions: {
      below: [
        { question: "A scientist has 5 test tubes. She gets 3 more. How many test tubes does she have now?", options: [{ label: "Correct", text: "8 test tubes! 5 + 3 = 8.", quality: "good" }, { label: "Working on it", text: "8?", quality: "ok" }, { label: "Not sure", text: "Maybe 7?", quality: "weak" }] },
        { question: "A plant grows 2 inches each week. How tall will it be after 4 weeks?", options: [{ label: "Correct", text: "8 inches! 2 times 4 is 8.", quality: "good" }, { label: "Working on it", text: "2, 4, 6, 8. So 8 inches!", quality: "ok" }, { label: "Not sure", text: "Maybe 6 inches?", quality: "weak" }] },
        { question: "You have 10 rocks and sort them into 2 equal piles. How many in each pile?", options: [{ label: "Correct", text: "5 in each pile! 10 divided by 2 is 5.", quality: "good" }, { label: "Working on it", text: "5?", quality: "ok" }, { label: "Not sure", text: "4?", quality: "weak" }] },
        { question: "There are 7 planets that are farther from the Sun than Earth. How many total planets are in our solar system (including Earth)?", options: [{ label: "Correct", text: "8 planets! 7 plus Earth is 8.", quality: "good" }, { label: "Working on it", text: "8?", quality: "ok" }, { label: "Not sure", text: "I don't remember", quality: "weak" }] },
      ],
      on: [
        { question: "Light takes 8 minutes to travel from the Sun to Earth. If the Sun suddenly turned off, how long before we'd know?", options: [{ label: "Correct", text: "8 minutes! Since light takes 8 minutes to reach us, we'd still see the Sun for 8 more minutes.", quality: "good" }, { label: "Working on it", text: "8 minutes, because that's how long light takes to get here.", quality: "ok" }, { label: "Not sure", text: "Right away? Or maybe a few minutes?", quality: "weak" }] },
        { question: "A rocket travels at 25,000 mph. How far does it travel in 6 hours?", options: [{ label: "Correct", text: "150,000 miles! 25,000 × 6 = 150,000.", quality: "good" }, { label: "Working on it", text: "25,000 times 6... 150,000 miles?", quality: "ok" }, { label: "Not sure", text: "Really far! Millions of miles?", quality: "weak" }] },
        { question: "A science experiment needs 3/4 cup of vinegar. If you want to do the experiment 5 times, how much vinegar do you need?", options: [{ label: "Correct", text: "3.75 cups! 3/4 × 5 = 15/4 = 3 and 3/4 cups.", quality: "good" }, { label: "Working on it", text: "3/4 five times... that's 15/4... so about 3 and 3/4 cups?", quality: "ok" }, { label: "Not sure", text: "More than 3 cups? I'm not sure about fractions.", quality: "weak" }] },
        { question: "Earth is about 93 million miles from the Sun. Mars is about 142 million miles. How much farther from the Sun is Mars than Earth?", options: [{ label: "Correct", text: "49 million miles! 142 - 93 = 49 million.", quality: "good" }, { label: "Working on it", text: "142 minus 93... 49 million miles?", quality: "ok" }, { label: "Not sure", text: "A lot farther, maybe 50 million?", quality: "weak" }] },
      ],
      above: [
        { question: "The speed of light is approximately 3 × 10⁸ m/s. If the nearest star (Proxima Centauri) is 4.24 light-years away, how many seconds does it take light to reach us? (1 year ≈ 3.15 × 10⁷ seconds)", options: [{ label: "Correct", text: "4.24 × 3.15 × 10⁷ = 1.336 × 10⁸ seconds, or about 133.6 million seconds.", quality: "good" }, { label: "Working on it", text: "4.24 years times about 31.5 million seconds per year... around 134 million seconds?", quality: "ok" }, { label: "Not sure", text: "I know it's a huge number but scientific notation is tricky for me.", quality: "weak" }] },
        { question: "Jupiter's mass is about 318 times Earth's mass. Earth's mass is 5.97 × 10²⁴ kg. Express Jupiter's mass in scientific notation.", options: [{ label: "Correct", text: "318 × 5.97 × 10²⁴ = 1,898.46 × 10²⁴ = 1.898 × 10²⁷ kg.", quality: "good" }, { label: "Working on it", text: "318 times 5.97 is about 1,898... so about 1.9 × 10²⁷ kg?", quality: "ok" }, { label: "Not sure", text: "I'd need to multiply really big numbers and I'm not confident with scientific notation.", quality: "weak" }] },
        { question: "A bacteria population doubles every 20 minutes. Starting with 1 bacterium, how many will there be after 4 hours?", options: [{ label: "Correct", text: "4 hours = 240 minutes ÷ 20 = 12 doublings. 2¹² = 4,096 bacteria.", quality: "good" }, { label: "Working on it", text: "12 doublings in 4 hours. 2 to the 12th... 4,096?", quality: "ok" }, { label: "Not sure", text: "It doubles many times so the number gets huge, maybe thousands?", quality: "weak" }] },
        { question: "The surface gravity of Mars is 38% of Earth's. If you weigh 150 pounds on Earth, how much would you weigh on Mars? If you could jump 2 feet high on Earth, approximately how high could you jump on Mars?", options: [{ label: "Correct", text: "Weight on Mars: 150 × 0.38 = 57 pounds. Jump height: 2 ÷ 0.38 ≈ 5.26 feet — about 2.6 times higher!", quality: "good" }, { label: "Working on it", text: "57 pounds on Mars. And if gravity is less, you'd jump higher... about 5 feet?", quality: "ok" }, { label: "Not sure", text: "Less weight and higher jumps, but I'm not sure of the exact numbers.", quality: "weak" }] },
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
        { question: "What is cooking like, according to the passage?", options: [{ label: "Great answer", text: "Cooking is like following directions — you go step by step, just like following a recipe.", quality: "good" }, { label: "Good try", text: "Following a recipe.", quality: "ok" }, { label: "Simple answer", text: "Making food", quality: "weak" }] },
        { question: "Why is cooking fun?", options: [{ label: "Great answer", text: "Because you get to mix things together to make new foods, and then you can share what you make with family and friends!", quality: "good" }, { label: "Good try", text: "You can share food with people.", quality: "ok" }, { label: "Simple answer", text: "Food tastes good", quality: "weak" }] },
        { question: "What are some things you can cook?", options: [{ label: "Great answer", text: "The passage mentions cookies, soup, and pizza. But you can cook so many other things too, like pasta or tacos!", quality: "good" }, { label: "Good try", text: "Cookies and pizza.", quality: "ok" }, { label: "Simple answer", text: "Food", quality: "weak" }] },
        { question: "Have you ever helped cook something? What was it?", options: [{ label: "Great answer", text: "I helped make pancakes with my mom! I cracked the eggs and mixed the batter, and we put blueberries in them.", quality: "good" }, { label: "Good try", text: "I helped make cookies once.", quality: "ok" }, { label: "Simple answer", text: "Yeah, food", quality: "weak" }] },
      ],
      on: [
        { question: "How is cooking related to chemistry? Give an example from the passage.", options: [{ label: "Great answer", text: "Cooking involves chemical reactions. For example, when you bake bread, yeast eats sugar and produces carbon dioxide gas, which creates bubbles that make bread fluffy. The Maillard reaction when searing steak creates hundreds of new flavor compounds.", quality: "good" }, { label: "Good try", text: "Yeast makes chemical reactions in bread that create bubbles.", quality: "ok" }, { label: "Simple answer", text: "Cooking changes ingredients chemically", quality: "weak" }] },
        { question: "What is the Maillard reaction and why does it matter for cooking?", options: [{ label: "Great answer", text: "It's a chemical reaction between amino acids and sugars that happens when food browns, like searing a steak. It creates hundreds of new flavor compounds, which is why browned food tastes so much more complex and delicious.", quality: "good" }, { label: "Good try", text: "It's what happens when meat browns and creates a tasty crust.", quality: "ok" }, { label: "Simple answer", text: "It makes food brown and tasty", quality: "weak" }] },
        { question: "How does understanding food science help chefs?", options: [{ label: "Great answer", text: "When chefs understand the science, they can control their results better and even create new dishes. Instead of just guessing, they know WHY something works, so they can be creative and intentional.", quality: "good" }, { label: "Good try", text: "It helps them make better food and invent new dishes.", quality: "ok" }, { label: "Simple answer", text: "They cook better", quality: "weak" }] },
        { question: "What does 'consume' mean in this passage?", options: [{ label: "Great answer", text: "Here 'consume' means to eat or use up. The yeast organisms consume (eat) the sugar as fuel, and their digestion produces the CO2 gas.", quality: "good" }, { label: "Good try", text: "It means to eat. The yeast eats the sugar.", quality: "ok" }, { label: "Simple answer", text: "Eat", quality: "weak" }] },
      ],
      above: [
        { question: "What makes sous vide different from traditional cooking, and what's the advantage of cooking to within 0.1°C?", options: [{ label: "Great answer", text: "Traditional cooking uses imprecise heat sources where temperature varies across the food. Sous vide uses water baths at exact temperatures, so the food cooks uniformly throughout. 0.1°C precision means you can target exact protein denaturation points — the difference between a medium-rare and medium steak is just a few degrees.", quality: "good" }, { label: "Good try", text: "Sous vide is more precise because it uses exact temperatures. This means food comes out perfectly every time.", quality: "ok" }, { label: "Simple answer", text: "It's more exact and consistent", quality: "weak" }] },
        { question: "Why does the passage call fermentation 'one of humanity's oldest food technologies'? How is it being reimagined?", options: [{ label: "Great answer", text: "Fermentation is ancient — humans have been using it for bread, beer, cheese, and preserved foods for thousands of years. Modern chefs are pushing it further by culturing specific molds like koji for umami and wild-fermenting ingredients for complex flavors, turning a survival technique into a creative tool.", quality: "good" }, { label: "Good try", text: "Because people have been fermenting food for thousands of years. Now chefs are using it in new creative ways.", quality: "ok" }, { label: "Simple answer", text: "Fermentation is old and chefs use it in new ways now", quality: "weak" }] },
        { question: "What does 'the intersection of food science and culinary art' mean? Why is that intersection important?", options: [{ label: "Great answer", text: "It means where scientific knowledge meets creative cooking skill. The intersection matters because science alone produces functional but uninspired food, and art alone is inconsistent. Together, chefs can be both precisely controlled AND wildly creative, pushing boundaries of what food can be.", quality: "good" }, { label: "Good try", text: "It's where science and creativity in cooking meet. Both together make better results than either alone.", quality: "ok" }, { label: "Simple answer", text: "Combining science and art in cooking", quality: "weak" }] },
        { question: "Design a simple experiment a student could do at home to demonstrate the Maillard reaction. What would you compare?", options: [{ label: "Great answer", text: "Toast two identical slices of bread: one lightly and one until dark brown. Compare taste, smell, and color. The darker slice has undergone more Maillard reactions, creating more complex flavors. You could rate flavor complexity on a scale and note how color correlates with new flavor compounds.", quality: "good" }, { label: "Good try", text: "Cook two pieces of bread differently — one barely toasted and one very toasted — and compare how they taste.", quality: "ok" }, { label: "Simple answer", text: "Compare cooked and raw food", quality: "weak" }] },
      ],
    },
    mathQuestions: {
      below: [
        { question: "A recipe needs 2 eggs. If you want to make it 3 times, how many eggs do you need?", options: [{ label: "Correct", text: "6 eggs! 2 times 3 is 6.", quality: "good" }, { label: "Working on it", text: "2, 4, 6. So 6 eggs!", quality: "ok" }, { label: "Not sure", text: "Maybe 5?", quality: "weak" }] },
        { question: "You baked 12 cookies and ate 4. How many are left?", options: [{ label: "Correct", text: "8 cookies! 12 minus 4 is 8.", quality: "good" }, { label: "Working on it", text: "8?", quality: "ok" }, { label: "Not sure", text: "Maybe 7?", quality: "weak" }] },
        { question: "If a pizza has 8 slices and you eat half, how many slices did you eat?", options: [{ label: "Correct", text: "4 slices! Half of 8 is 4.", quality: "good" }, { label: "Working on it", text: "Half of 8... 4?", quality: "ok" }, { label: "Not sure", text: "3?", quality: "weak" }] },
        { question: "You need 5 apples for a pie. How many apples for 2 pies?", options: [{ label: "Correct", text: "10 apples! 5 times 2 is 10.", quality: "good" }, { label: "Working on it", text: "5 plus 5 is 10.", quality: "ok" }, { label: "Not sure", text: "Maybe 8?", quality: "weak" }] },
      ],
      on: [
        { question: "A recipe serves 4 people and needs 2/3 cup of flour. How much flour for 12 people?", options: [{ label: "Correct", text: "2 cups! 12 is 3 times 4, so 3 × 2/3 = 6/3 = 2 cups.", quality: "good" }, { label: "Working on it", text: "Triple the recipe... 3 times 2/3... 2 cups?", quality: "ok" }, { label: "Not sure", text: "More than 2/3 but I'm not sure about fraction multiplication.", quality: "weak" }] },
        { question: "A cake needs to bake at 350°F for 35 minutes. If you accidentally set it 50°F too high, you should reduce time by 15%. How long should it bake?", options: [{ label: "Correct", text: "35 × 0.85 = 29.75 minutes, so about 30 minutes.", quality: "good" }, { label: "Working on it", text: "15% of 35 is about 5.25 minutes less... so about 30 minutes?", quality: "ok" }, { label: "Not sure", text: "Less time, but I'm not sure how to figure out 15% less.", quality: "weak" }] },
        { question: "A restaurant sells 180 meals per day. If 45% are pasta dishes, how many pasta dishes do they sell?", options: [{ label: "Correct", text: "81 pasta dishes. 180 × 0.45 = 81.", quality: "good" }, { label: "Working on it", text: "45% of 180... about half would be 90... so 81?", quality: "ok" }, { label: "Not sure", text: "About half? I'm not sure the exact number.", quality: "weak" }] },
        { question: "You're scaling a recipe from 6 servings to 15. If the original calls for 1.5 cups of sugar, how much do you need?", options: [{ label: "Correct", text: "15/6 = 2.5. So 1.5 × 2.5 = 3.75 cups of sugar.", quality: "good" }, { label: "Working on it", text: "I need 2.5 times the recipe... 1.5 times 2.5... 3.75 cups?", quality: "ok" }, { label: "Not sure", text: "More than 1.5 cups but scaling fractions is confusing.", quality: "weak" }] },
      ],
      above: [
        { question: "Bread dough rises 60% in volume during the first proofing. If you start with 500 mL of dough, what's the volume after two proofings (each adds 60%)?", options: [{ label: "Correct", text: "After first: 500 × 1.6 = 800 mL. After second: 800 × 1.6 = 1,280 mL.", quality: "good" }, { label: "Working on it", text: "1.6 times each proofing. 500 → 800 → 1,280 mL?", quality: "ok" }, { label: "Not sure", text: "It gets bigger each time but I'm not sure about compound percentages.", quality: "weak" }] },
        { question: "A chef needs a 5% salt brine. If they have 2 liters of water (2,000 mL), how many grams of salt should they add? (Assume 1 mL of water = 1 gram)", options: [{ label: "Correct", text: "5% of total solution. If total = water + salt, then salt/(2000+salt) = 0.05. Solving: salt = 105.3g. Or approximately: 5% of 2000 = 100g for a close estimate.", quality: "good" }, { label: "Working on it", text: "5% of 2,000 grams is about 100 grams of salt?", quality: "ok" }, { label: "Not sure", text: "Some salt, but I'm not sure how to calculate concentration.", quality: "weak" }] },
        { question: "A restaurant's food cost ratio is 32%. If their monthly revenue is $45,000, what do they spend on food? If they want to lower costs to 28%, how much would they save monthly?", options: [{ label: "Correct", text: "Current food cost: $45,000 × 0.32 = $14,400. At 28%: $45,000 × 0.28 = $12,600. Savings: $1,800/month.", quality: "good" }, { label: "Working on it", text: "$14,400 currently. At 28% it'd be $12,600. So they'd save $1,800?", quality: "ok" }, { label: "Not sure", text: "I'd need to do percentage calculations with big numbers.", quality: "weak" }] },
        { question: "Yeast doubles every 90 minutes at optimal temperature. Starting with 1 gram, how many grams after 9 hours? If you need 64 grams for a recipe, how long must you wait?", options: [{ label: "Correct", text: "9 hours = 6 doublings. 2⁶ = 64 grams. For 64g: since 2⁶ = 64, you need 6 doublings = 9 hours. Perfect!", quality: "good" }, { label: "Working on it", text: "6 doublings in 9 hours: 1→2→4→8→16→32→64. So 64 grams, and it takes exactly 9 hours!", quality: "ok" }, { label: "Not sure", text: "It doubles a lot so probably more than 32 grams?", quality: "weak" }] },
      ],
    },
    writingPrompts: {
      below: "Tell me about your favorite food! What do you love about it? 🍕",
      on: "Write me a paragraph about a meal that's special to you. Maybe it's something your family makes, or your favorite restaurant dish. What makes it special?",
      above: "Write a short story about a chef who enters a cooking competition. Describe the dish they create, the techniques they use, and whether they win or lose. Make me hungry reading it!",
    },
  },

  general: {
    passages: {
      below: "Learning new things is one of the best parts of growing up. Every day, you can discover something you didn't know before. Some people learn best by reading, others by doing, and others by talking with friends. Everyone learns differently, and that's OK! The important thing is to stay curious and keep asking questions.",
      on: "The human brain is an incredible learning machine. It contains about 86 billion neurons, each connected to thousands of others, forming trillions of connections called synapses. When you learn something new, your brain physically changes — new connections form and existing ones get stronger. This is why practice makes you better at things: each time you repeat a skill, the neural pathways for that skill become faster and more efficient.",
      above: "The science of learning has revealed that many common study habits are surprisingly ineffective. Research shows that re-reading textbooks and highlighting passages create an 'illusion of knowledge' — familiarity with the material feels like understanding, but it doesn't produce lasting learning. Instead, techniques like retrieval practice (testing yourself), spaced repetition (reviewing material at increasing intervals), and interleaving (mixing different topics in study sessions) have been proven through rigorous research to produce significantly better long-term retention and transfer of knowledge to new situations.",
    },
    readingQuestions: {
      below: [
        { question: "What are some different ways people learn?", options: [{ label: "Great answer", text: "Some people learn by reading, others learn by doing things with their hands, and others learn best by talking with friends and discussing ideas.", quality: "good" }, { label: "Good try", text: "Reading and doing.", quality: "ok" }, { label: "Simple answer", text: "Different ways", quality: "weak" }] },
        { question: "What does the passage say is the most important thing about learning?", options: [{ label: "Great answer", text: "Staying curious and keeping asking questions! It doesn't matter how you learn, as long as you keep wanting to know more.", quality: "good" }, { label: "Good try", text: "To stay curious.", quality: "ok" }, { label: "Simple answer", text: "Asking questions", quality: "weak" }] },
        { question: "Why is it OK that everyone learns differently?", options: [{ label: "Great answer", text: "Because there's no one 'right' way to learn. What works for one person might not work for another, and that's totally normal.", quality: "good" }, { label: "Good try", text: "Because people are different.", quality: "ok" }, { label: "Simple answer", text: "It just is", quality: "weak" }] },
        { question: "How do you learn best?", options: [{ label: "Great answer", text: "I think I learn best by doing things myself. When I try something and figure it out, I remember it better than just reading about it.", quality: "good" }, { label: "Good try", text: "I like watching videos about things.", quality: "ok" }, { label: "Simple answer", text: "Reading", quality: "weak" }] },
      ],
      on: [
        { question: "How does the brain physically change when you learn something new?", options: [{ label: "Great answer", text: "When you learn something new, new connections form between neurons and existing connections get stronger. The brain literally rewires itself, building new neural pathways.", quality: "good" }, { label: "Good try", text: "New connections form between brain cells.", quality: "ok" }, { label: "Simple answer", text: "It changes its connections", quality: "weak" }] },
        { question: "Why does practice make you better at things? Explain using what the passage tells you about neurons.", options: [{ label: "Great answer", text: "Each time you practice, the neural pathways for that skill get used again, making them faster and more efficient. It's like a path in the woods — the more you walk it, the clearer and easier it becomes.", quality: "good" }, { label: "Good try", text: "The brain pathways get stronger each time you practice, so signals travel faster.", quality: "ok" }, { label: "Simple answer", text: "Your brain gets faster at it", quality: "weak" }] },
        { question: "What is a synapse? Why are trillions of them important?", options: [{ label: "Great answer", text: "A synapse is a connection between neurons. Having trillions means the brain can process incredibly complex information and learn an almost unlimited number of things. Each new connection represents a new piece of knowledge or skill.", quality: "good" }, { label: "Good try", text: "Connections between brain cells. Lots of them means more learning capacity.", quality: "ok" }, { label: "Simple answer", text: "Brain connections", quality: "weak" }] },
        { question: "If the brain has 86 billion neurons, why is that number important?", options: [{ label: "Great answer", text: "Because each neuron connects to thousands of others, the total number of possible connections is astronomical. This massive network is what gives humans the ability to think, create, remember, and solve complex problems.", quality: "good" }, { label: "Good try", text: "More neurons means more brain power and ability to learn.", quality: "ok" }, { label: "Simple answer", text: "That's a lot of brain cells", quality: "weak" }] },
      ],
      above: [
        { question: "What is the 'illusion of knowledge' and why is it dangerous for students?", options: [{ label: "Great answer", text: "It's when re-reading or highlighting makes material feel familiar, which students mistake for actual understanding. It's dangerous because students believe they've learned something when they haven't, leading to poor test performance and inability to apply the knowledge in new situations.", quality: "good" }, { label: "Good try", text: "Feeling like you know something because you've read it, when you actually can't recall or use it. It gives false confidence.", quality: "ok" }, { label: "Simple answer", text: "Thinking you know something when you don't", quality: "weak" }] },
        { question: "Why is testing yourself (retrieval practice) more effective than re-reading?", options: [{ label: "Great answer", text: "Retrieval practice forces your brain to actively reconstruct knowledge from memory, which strengthens neural pathways. Re-reading is passive — your brain recognizes the words without actually processing them deeply. The effort of recall is what builds lasting learning.", quality: "good" }, { label: "Good try", text: "Because actively recalling information strengthens your memory more than just passively reading it again.", quality: "ok" }, { label: "Simple answer", text: "Active recall is better than passive reading", quality: "weak" }] },
        { question: "What is 'interleaving' and why does mixing topics work better than studying one topic at a time?", options: [{ label: "Great answer", text: "Interleaving means mixing different topics in a single study session instead of blocking one topic at a time. It works better because it forces the brain to discriminate between concepts and develop flexible retrieval strategies. It's harder in the moment but produces superior long-term retention and transfer to new problems.", quality: "good" }, { label: "Good try", text: "Studying different topics together instead of one at a time. It makes your brain work harder to distinguish between them, which helps learning.", quality: "ok" }, { label: "Simple answer", text: "Mixing topics when studying helps you remember better", quality: "weak" }] },
        { question: "Based on this passage, redesign how you'd study for a big exam. What would you do differently from most students?", options: [{ label: "Great answer", text: "Instead of re-reading notes and highlighting, I'd use flashcards for retrieval practice, space study sessions over weeks with increasing intervals, and mix different subjects in each session. It would feel harder but produce much better results on the exam and real learning.", quality: "good" }, { label: "Good try", text: "I'd test myself more instead of just reading, and spread study sessions out over time instead of cramming.", quality: "ok" }, { label: "Simple answer", text: "Study smarter with testing and spacing", quality: "weak" }] },
      ],
    },
    mathQuestions: {
      below: [
        { question: "If you read 3 pages each night for 5 nights, how many pages is that?", options: [{ label: "Correct", text: "15 pages! 3 times 5 is 15.", quality: "good" }, { label: "Working on it", text: "15?", quality: "ok" }, { label: "Not sure", text: "Maybe 12?", quality: "weak" }] },
        { question: "You have 10 crayons and lose 3. How many do you have left?", options: [{ label: "Correct", text: "7 crayons! 10 minus 3 is 7.", quality: "good" }, { label: "Working on it", text: "7?", quality: "ok" }, { label: "Not sure", text: "Maybe 6?", quality: "weak" }] },
        { question: "There are 16 students and they split into 4 equal groups. How many in each group?", options: [{ label: "Correct", text: "4 students! 16 divided by 4 is 4.", quality: "good" }, { label: "Working on it", text: "4?", quality: "ok" }, { label: "Not sure", text: "Maybe 3?", quality: "weak" }] },
        { question: "You get 2 gold stars each day at school. How many stars after a week (5 school days)?", options: [{ label: "Correct", text: "10 stars! 2 times 5 is 10.", quality: "good" }, { label: "Working on it", text: "2, 4, 6, 8, 10!", quality: "ok" }, { label: "Not sure", text: "Maybe 8?", quality: "weak" }] },
      ],
      on: [
        { question: "A class has 28 students. If 3/4 brought lunch from home, how many brought lunch?", options: [{ label: "Correct", text: "21 students. 28 × 3/4 = 21.", quality: "good" }, { label: "Working on it", text: "3/4 of 28... that's 21?", quality: "ok" }, { label: "Not sure", text: "Most of them? Maybe 20?", quality: "weak" }] },
        { question: "A book has 256 pages. If you read 32 pages per day, how many days will it take to finish?", options: [{ label: "Correct", text: "8 days. 256 ÷ 32 = 8.", quality: "good" }, { label: "Working on it", text: "256 divided by 32... 8 days?", quality: "ok" }, { label: "Not sure", text: "About a week? I'm not sure exactly.", quality: "weak" }] },
        { question: "Your test scores this semester are 85, 92, 78, and 95. What's your average?", options: [{ label: "Correct", text: "87.5! Add them up: 350. Divide by 4: 87.5.", quality: "good" }, { label: "Working on it", text: "85 plus 92 plus 78 plus 95 is 350. Divided by 4 is... 87.5?", quality: "ok" }, { label: "Not sure", text: "Around 85 or 90? I'm not sure how to find an average.", quality: "weak" }] },
        { question: "A school fundraiser collected $1,250. If that's 62.5% of the goal, what was the total goal?", options: [{ label: "Correct", text: "$2,000. If $1,250 = 62.5%, then 100% = 1,250 ÷ 0.625 = $2,000.", quality: "good" }, { label: "Working on it", text: "1,250 divided by 0.625... about $2,000?", quality: "ok" }, { label: "Not sure", text: "More than $1,250 but I'm not sure how to reverse a percentage.", quality: "weak" }] },
      ],
      above: [
        { question: "A student's GPA is calculated by averaging: A=4, B=3, C=2. With grades of A, A, B, A, B, C across 6 classes, what's their GPA?", options: [{ label: "Correct", text: "(4+4+3+4+3+2)/6 = 20/6 = 3.33 GPA.", quality: "good" }, { label: "Working on it", text: "4+4+3+4+3+2 = 20. Divided by 6 is about 3.33?", quality: "ok" }, { label: "Not sure", text: "Better than a B average? I'm not sure how to calculate GPA.", quality: "weak" }] },
        { question: "If you study with spaced repetition, you review material at 1 day, 3 days, 7 days, and 14 days. How many total days from first learning to last review? If you have an exam on day 20, when should you START studying to complete all 4 reviews?", options: [{ label: "Correct", text: "Last review on day 14, so 14 days total. To finish by day 20, start by day 6 (20 - 14 = 6).", quality: "good" }, { label: "Working on it", text: "The reviews span 14 days. So start by day 6 to finish on day 20?", quality: "ok" }, { label: "Not sure", text: "A couple weeks before? I'm not sure exactly.", quality: "weak" }] },
        { question: "A school has 1,500 students. Test results show: 22% scored Advanced, 48% Proficient, 23% Basic, and the rest Below Basic. How many students are in each category?", options: [{ label: "Correct", text: "Advanced: 330, Proficient: 720, Basic: 345, Below Basic: 7% = 105. Total: 1,500 ✓", quality: "good" }, { label: "Working on it", text: "22% of 1500 is 330, 48% is 720, 23% is 345... and the rest is 7% which is 105?", quality: "ok" }, { label: "Not sure", text: "I'd need to calculate percentages of 1,500 for each one.", quality: "weak" }] },
        { question: "Research shows retrieval practice improves test scores by 35% compared to re-reading. If students who re-read score an average of 68%, what would retrieval practice students score? Is this realistic?", options: [{ label: "Correct", text: "68% × 1.35 = 91.8%. While the math works, in practice scores max at 100% and the improvement varies by student. The 35% improvement is a relative increase, so realistic in studies but individual results will vary.", quality: "good" }, { label: "Working on it", text: "35% improvement on 68%... 68 times 1.35 is about 92%? That seems really high.", quality: "ok" }, { label: "Not sure", text: "Higher than 68% but I'm not sure if 35% means adding 35 points.", quality: "weak" }] },
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
  const [currentOptions, setCurrentOptions] = useState<{ label: string; text: string; quality: 'good' | 'ok' | 'weak' }[]>([]);
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

  // Load student info from localStorage
  useEffect(() => {
    if (initialized) return;
    const name = localStorage.getItem('pending_student_name') || 'there';
    const by = localStorage.getItem('pending_birth_year');
    const parsedBY = by ? parseInt(by, 10) : 2014;
    setStudentName(name.split(' ')[0]);
    setBirthYear(parsedBY);
    setCurrentDifficulty(getStartingDifficulty(parsedBY));
    setInitialized(true);
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
  }, [messages, isTyping, currentOptions, waitingForInput]);

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

  const handleIcebreakerResponse = useCallback(async (text: string) => {
    addStudentMsg(text);
    setInterest(text);
    const category = matchInterestCategory(text);
    setInterestCategory(category);
    setStep('reading');
    setProgress(15);

    const content = CONTENT[category] || CONTENT.general;
    const passage = content.passages[currentDifficulty];

    const categoryNames: Record<string, string> = {
      gaming: 'gaming', sports: 'sports', animals: 'animals',
      music: 'music', science: 'science', cooking: 'cooking', general: 'learning',
    };
    const catName = categoryNames[category] || 'that';

    await addAiMsg(`Oh awesome, you're into ${catName}! 🎉 That's so cool. I put together something fun for you.`);
    await addAiMsg(`Here's a short passage. Read it and then I'll ask you some questions about it:`);
    await addAiMsg(passage);

    const q = content.readingQuestions[currentDifficulty][0];
    await addAiMsg(q.question);
    setCurrentOptions(q.options);
    setWaitingForInput(true);
    setReadingQIndex(0);
    setProgress(20);
  }, [addAiMsg, addStudentMsg, currentDifficulty]);

  const handleReadingResponse = useCallback(async (text: string, quality: 'good' | 'ok' | 'weak') => {
    addStudentMsg(text);
    const content = CONTENT[interestCategory] || CONTENT.general;
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
    const questions = content.readingQuestions[newDiff];

    if (nextIndex < 3 && nextIndex < questions.length) {
      const q = questions[nextIndex];
      await addAiMsg(q.question);
      setCurrentOptions(q.options);
      setWaitingForInput(true);
      setReadingQIndex(nextIndex);
      setProgress(20 + nextIndex * 10);
    } else {
      // Move to math
      setStep('math');
      setProgress(50);
      setMathQIndex(0);

      await addAiMsg("You did awesome with the reading! 📚 Now let's have some fun with numbers.");

      const mathQ = content.mathQuestions[newDiff][0];
      await addAiMsg(mathQ.question);
      setCurrentOptions(mathQ.options);
      setWaitingForInput(true);
    }
  }, [addAiMsg, addStudentMsg, interestCategory, readingScore, readingQIndex, currentDifficulty, adjustDifficulty]);

  const handleMathResponse = useCallback(async (text: string, quality: 'good' | 'ok' | 'weak') => {
    addStudentMsg(text);
    const content = CONTENT[interestCategory] || CONTENT.general;
    const newMathScore = mathScore + (quality === 'good' ? 2 : quality === 'ok' ? 1 : 0);
    setMathScore(newMathScore);

    setResponses(prev => [...prev, { question: content.mathQuestions[currentDifficulty][mathQIndex].question, answer: text, category: 'math', difficulty: currentDifficulty }]);

    const newDiff = adjustDifficulty(quality, currentDifficulty);
    setCurrentDifficulty(newDiff);

    const encouragements = quality === 'good'
      ? ["Nailed it! 🎯", "You got it! Great math skills! 🧮", "Exactly right! Nice work!"]
      : quality === 'ok'
      ? ["I love how you thought about that! 👏", "You're on the right track!", "Good thinking through the steps!"]
      : ["I love that you tried! Math takes practice. 💪", "No worries! We'll work on this together.", "That's totally OK! Let's keep going. 😊"];
    await addAiMsg(encouragements[Math.floor(Math.random() * encouragements.length)]);

    const nextIndex = mathQIndex + 1;
    const questions = content.mathQuestions[newDiff];

    if (nextIndex < 3 && nextIndex < questions.length) {
      const q = questions[nextIndex];
      await addAiMsg(q.question);
      setCurrentOptions(q.options);
      setWaitingForInput(true);
      setMathQIndex(nextIndex);
      setProgress(50 + nextIndex * 10);
    } else {
      // Move to writing
      setStep('writing');
      setProgress(75);
      setCurrentOptions([]);

      await addAiMsg("You're doing amazing! 🌟 One more thing — I'd love to see your creative side.");
      const prompt = content.writingPrompts[newDiff];
      await addAiMsg(prompt);
      setWaitingForInput(true);
      setInputMode('textarea');
    }
  }, [addAiMsg, addStudentMsg, interestCategory, mathScore, mathQIndex, currentDifficulty, adjustDifficulty]);

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
    setCurrentOptions([]);
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
    setCurrentOptions([]);

    if (step === 'icebreaker') {
      await handleIcebreakerResponse(text);
    } else if (step === 'reading') {
      // Free-text for reading — treat as 'ok' quality
      await handleReadingResponse(text, 'ok');
    } else if (step === 'math') {
      await handleMathResponse(text, 'ok');
    } else if (step === 'writing') {
      await handleWritingResponse(text);
    }
  }, [textInput, step, handleIcebreakerResponse, handleReadingResponse, handleMathResponse, handleWritingResponse]);

  const handleOptionClick = useCallback(async (option: { text: string; quality: 'good' | 'ok' | 'weak' }) => {
    setWaitingForInput(false);
    setCurrentOptions([]);
    setTextInput('');

    if (step === 'reading') {
      await handleReadingResponse(option.text, option.quality);
    } else if (step === 'math') {
      await handleMathResponse(option.text, option.quality);
    }
  }, [step, handleReadingResponse, handleMathResponse]);

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
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-5">
          <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
            <Robot size={24} weight="fill" className="text-white" />
          </div>
          <div className="flex-1">
            <div className="font-heading font-semibold text-sm text-text-primary">Your Learning Assistant</div>
            <div className="text-xs text-text-secondary">Getting to know you</div>
          </div>
          <span className="px-2.5 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold">
            {step === 'icebreaker' ? '👋 Intro' : step === 'reading' ? '📚 Reading' : step === 'math' ? '🧮 Math' : step === 'writing' ? '✍️ Writing' : '🎉 Done!'}
          </span>
        </div>

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
                {msg.role === 'ai' ? <Robot size={16} weight="fill" /> : studentName.charAt(0).toUpperCase()}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'ai'
                  ? 'bg-card-bg dark:bg-[#1A2332] border border-border dark:border-[#2A3A4E] rounded-bl-sm text-text-primary'
                  : 'bg-teal text-white rounded-br-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 self-start max-w-[90%]">
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-1">
                <Robot size={16} weight="fill" className="text-white" />
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

          {/* Response options (secondary/hint style) */}
          {currentOptions.length > 0 && !isTyping && waitingForInput && step !== 'icebreaker' && step !== 'writing' && (
            <div className="self-start w-full mt-2">
              <p className="text-xs text-text-muted dark:text-text-secondary mb-2">💡 Example responses (or type your own below):</p>
              <div className="flex flex-col gap-1.5">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className="flex items-start gap-2 px-3 py-2.5 bg-card-bg dark:bg-[#1A2332] border border-border dark:border-[#2A3A4E] rounded-xl text-left hover:border-teal hover:bg-teal/[0.04] transition-all text-xs text-text-secondary dark:text-text-secondary leading-relaxed"
                  >
                    <span className={`inline-block w-5 h-5 rounded-md flex-shrink-0 mt-0.5 text-center leading-5 text-[9px] font-bold
                      ${opt.quality === 'good' ? 'bg-emerald-500/10 text-emerald-500' : opt.quality === 'ok' ? 'bg-amber-500/10 text-amber-500' : 'bg-orange-400/10 text-orange-400'}`}>
                      ●
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                ))}
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
                <button
                  onClick={handleSubmitText}
                  disabled={!textInput.trim()}
                  className="self-end p-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperPlaneRight size={20} weight="fill" />
                </button>
              </div>
            ) : (
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
                  onClick={handleSubmitText}
                  disabled={!textInput.trim()}
                  className="p-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperPlaneRight size={20} weight="fill" />
                </button>
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