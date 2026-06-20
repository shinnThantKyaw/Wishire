# Birthday Wish Generator

A small generator that writes a short, personalized birthday wish — funny, sincere, poetic, or chaotic-roast — using real zodiac/birthstone/birth-flower flair instead of generic filler.

---

# The Problem

Generic "Happy Birthday!" texts feel low-effort. Writing something genuinely funny or sincere takes more time than most people have before the group chat notices it's someone's birthday.

---

# Live Demo — Input

[screenshot: the form — name, relationship, tone, birth month/day]

You pick who it's for and how it should sound. That's the whole interface.

---

# Live Demo — Output

[screenshot: generated wish + zodiac/birthstone/flower chips]

Notice the flair isn't a random fact dump — it's woven into the sentence.

---

# How It's Built

- **React + Vite** frontend, **Node/Express** backend
- **MCP server** (`birthday-facts`) — looks up zodiac sign, birthstone, birth flower for a given date
- **Skill** (`birthday-wish-style`) — defines tone, length, and structure rules for every generated wish
- **Subagent** (`tone-checker`) — reviews each wish for cringe or mean-spirited lines before it ships

---

# What's Next

- Save favorite wishes / share as an image
- Add more tones (e.g. "haiku")
- Let the tone-checker subagent auto-trigger a regeneration loop instead of just flagging
