# CodeDuel Arena

Build CodeDuel, a production-quality, responsive frontend for a 1v1 competitive programming platform based on the attached specification:

Product Overview & Design System:
- Real-time 1v1 competitive coding platform combining LeetCode, Codeforces, and esports gaming aesthetics.
- Visual direction: Deep charcoal/near-black background (#09090B), dark gray cards (#18181B), electric purple primary accent (#8B5CF6), cyan secondary accent (#06B6D4), green success, red error, Inter typography, subtle glows and clean borders.
- Skill Tier system: Beginner (0-999), Intermediate (1000-1399), Advanced (1400-1799), Expert (1800-2199), Master (2200+).

Pages & Features to build:
1. Landing Page (/): Navbar with CodeDuel logo, Hero ("Challenge Developers. Prove Your Skills") with primary "Start Battling" CTA and "Explore Leaderboard", animated 1v1 duel preview/illustration, How It Works (Enter matchmaking, matched by rating, solve challenge, first accepted wins), feature cards, platform stats, footer.
2. User Dashboard (/dashboard): Sidebar navigation, greeting and player card with current rating/tier/win rate, stats cards (Total Matches, Wins, Losses, Win Rate), prominent "Find a Match" action card, weekly activity chart (Recharts), recent matches, leaderboard snippet.
3. Matchmaking (/matchmaking): Premium animated radar/circular scanning indicator ("Finding Your Opponent..."), rating range display, live duration counter, cycling mock opponent avatars, Cancel Search button, transitioning into:
4. Match Found Screen: Dynamic VS battle screen with Left (User avatar, rating, skill tier, win rate) vs Right (Opponent avatar, rating, win rate), center VS glow animation, 3-2-1 countdown, and simulated Accept/Decline and Enter Battle buttons.
5. Coding Arena (/arena/:matchId): Desktop-optimized 3-panel workspace:
   - Top Bar: CodeDuel logo, match ID, remaining countdown timer, rating stakes, match status.
   - Left Panel: Problem description (Title, difficulty tag, problem statement, input/output format, constraints, formatted examples).
   - Center Panel: Code editor with language selector (Python, JavaScript, C++, Java), default starter code templates, Run Code and Submit Solution buttons, Reset button, test case tabs and console execution output (frontend simulated with realistic test results).
   - Right Panel: Live Match Status (Opponent avatar, rating, live progress indicator, submission status, simulated opponent events).
6. Match Result Screen (/result/:matchId): Victory or Defeat screens with rating delta (+25 / -18), match duration, solved problem recap, opponent stats, "Play Again" and "Return to Dashboard" actions.
7. Leaderboard (/leaderboard): Global rankings with top 3 podium highlight, user cards, rating, wins, streak, filterable by Weekly / Monthly / All-Time, and user search.
8. Profile Page (/profile): User card, rating badge, bio, total stats, rating progression chart over time, language preferences, recent match history.
9. Match History (/history): Full match log with filters for outcome (Win/Loss) and difficulty, displaying opponent, problem, rating delta, duration, date.

Use realistic mock coding problems (Two Sum, Valid Parentheses, Longest Substring, etc.), responsive layouts, Lucide icons, Framer Motion transitions, and localStorage persistence for player stats and match history.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d81d9cee-376f-426e-987e-60baa5b5b000).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
