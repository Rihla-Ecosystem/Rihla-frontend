# Rihla App — User Scenarios


---

## 1. Onboarding & Authentication

### Scenario 1.1 — First-time visitor discovers the app
1. User lands on the **Landing Page**, sees the Rihla brand tagline ("Your safe, smart companion for exploring Egypt").
2. User taps **Get Started** → goes to **Sign Up**.
3. User fills in Full Name, Email, Password, Confirm Password, agrees to Terms & Privacy Policy.
4. User taps **Create Account** (or **Continue with Google**) → account created.

### Scenario 1.2 — Returning user logs in
1. User lands on the **Landing Page**.
2. User taps **I already have an account** → goes to **Login**.
3. User enters Email and Password (or **Continue with Google**), or taps **Forgot password?**.
4. User taps **Log In** → redirected into the app (Airport Arrival flow or Home, depending on state).

### Scenario 1.3 — Switching between Sign Up and Login
- From **Sign Up**, user taps "Already have an account?" → goes to **Login**.
- From **Login**, user taps "Don't have an account? Sign Up" → goes to **Sign Up**.

---

## 2. Airport Arrival Onboarding

### Scenario 2.1 — New arrival gets first-arrival safety tips
1. Upon detected arrival (location pin: Cairo Intl Airport), user sees **"Welcome to Egypt"** screen with a **First-Arrival Check** card.
2. The card rotates through practical scam/safety tips:
   - **SIM card kiosks** — which to trust (recommended carriers: official booths for Vodafone/Orange/Etisalat/WE, avoid unlicensed "helpers").
   - **Official taxi vs ride-hailing** — fair price estimate for Cairo airport to downtown.
   - **Currency exchange counters vs ATMs** — fair exchange rate range, avoiding airport kiosk markups.
3. Below the main tip, a **"More Arrival Tips"** list lets the user tap into the other tip categories (SIM pricing, taxi/ride-hailing, currency exchange, SIM kiosks).
4. User taps **Got it, take me to the app** → proceeds to **Home**.

*Purpose: reduce the chance that a jet-lagged, unfamiliar tourist gets scammed within their first hour in the country.*

---

## 3. Home & Safety Status

### Scenario 3.1 — Checking current safety status
1. User opens **Home**, sees a greeting ("Good afternoon, Sara") and current location (Giza Plateau, Cairo Governorate).
2. A safety status badge (**SECURE**) is shown, along with live indicators (e.g. SOS heat, air, effects) and last-updated timestamp.
3. User sees a **Nearby Sites** list (Great Sphinx of Giza, Khufu Ship Museum, Solar Boat Pyramid) with distances.
4. Bottom navigation lets user jump to Home, Explore, Alerts, Profile.

### Scenario 3.2 — Quick access to emergency SOS
- From **Home**, user taps the floating SOS/emergency icon → goes to **Emergency Help**.

---

## 4. Emergency Help

### Scenario 4.1 — User needs urgent help
1. User opens **Emergency Help**, current location is auto-shared with emergency services (Giza Plateau, Cairo Governorate).
2. User sees a categorized list of emergency contacts, each with a one-tap **Call** button:
   - Police (immediate police assistance)
   - Ambulance (medical emergency response)
   - Tourist Police (tourist support & protection)
   - Fire Department (fire and rescue response)
   - Anti-Harassment Hotline (harassment/protection line)
3. A warning note reminds the user: if in immediate danger, call the appropriate service now and keep location enabled.
4. Once resolved, user taps **"I'm safe, go back"** to return to Home.

*Purpose: give tourists instant, categorized access to the right emergency contact without searching, with location context pre-shared.*

---

## 5. Explore & Site Discovery

### Scenario 5.1 — Exploring nearby sites
1. From Home, user taps into **Nearby Sites**, sees "Explore Nearby: within 500m of Giza Plateau."
2. User filters by category chips (All, Temples, Museums, Hidden gems).
3. User browses a list of sites with images and names (Great Sphinx of Giza, Khufu Ship Museum, Solar Boat Pyramid, Khafre Valley Temple).
4. User taps a site card → opens **Site Detail**.

### Scenario 5.2 — Viewing site detail & scam warning
1. **Site Detail** shows the site name, location, rating, and review count (e.g. "Great Sphinx of Giza, Giza Plateau, Cairo · 4.8, 2,740 reviews").
2. Tabs let the user switch between **Story** (historical background) and **Safety**.
3. A **scam alert card** warns about a known local scam pattern (e.g. "Scam here: 'The Free Gift'" — vendors offering a "free" scarab or item, then demanding payment and being pushy).
4. An **"Area secure"** status badge confirms current safety status, with time since last update.
5. User taps **Directions** → goes to **Direction** screen for turn-by-turn navigation to the site.

### Scenario 5.3 — Getting directions
1. **Direction** screen shows a map with a route line from the user's current location to the destination site.
2. User follows the route visually to navigate to the site safely.

---

## 6. Restricted Zones & Environmental Safety

### Scenario 6.1 — User enters a restricted area
1. User's location is detected inside a military-restricted zone.
2. **Restricted Zone** alert appears: "You've entered a military-restricted area. Photography and filming are prohibited here for security reasons."
3. Instruction: "Please turn back to the marked path."
4. User taps **Guide me back** to receive directions back to safe/permitted territory.

### Scenario 6.2 — Checking environmental & site safety conditions
1. User opens **Environmental** safety screen for current site (e.g. Giza — "Secure" status, continuously monitored).
2. Live-sourced hazard indicators are shown as toggled statuses (OK/Alert), including:
   - Earthquake activity
   - Extreme heat
   - Sandstorm risk
   - Air quality index
   - Flooding risk
   - Disease outbreak alerts
   - Civil unrest signals
   - Official travel advisory
3. User can tap **View 30-day history** for a historical trend of these conditions.

---

## 7. Reporting

### Scenario 7.1 — Reporting a safety issue or scam
1. From a site or alert screen, user taps **Report an Issue**.
2. User selects an issue type (e.g. Safety concern, Wrong location data, Scam not listed, Site closed/changed).
3. Location is auto-attached (e.g. "Great Sphinx of Giza, Giza detected").
4. User writes a free-text description of what happened.
5. User can attach a photo as optional evidence.
6. User taps **Submit Report** → report is sent for review, helping keep site data accurate for other travelers.

---

## 8. Rihla Buddy (AI Agent Chat)

### Scenario 8.1 — Asking the AI assistant for live guidance
1. User opens **Agent Chat** ("Rihla Buddy").
2. Assistant proactively greets with context (e.g. "Welcome to the Valley of the Kings! I've loaded the verified historical records for this site. What would you like to know?").
3. Assistant surfaces a relevant **live scam alert** inline in the chat if one applies to the current location (e.g. "The Free Gift" scam warning), with an actionable quick-reply ("Is it safe to walk back to the ferry now?").
4. Assistant answers live-condition questions (e.g. checked live conditions for Luxor: "No heat, protest, or advisory alerts right now. The riverside path is clear.").
5. User can type free-form questions in the chat input at any time.

*Purpose: an always-available, location-aware AI guide that combines historical info, live safety data, and scam warnings in one conversational interface.*

---

## 9. Currency Helper

### Scenario 9.1 — Understanding local currency
1. User opens **Currency**, sees "Egyptian currency" reference guide.
2. Shows the Egyptian Pound (EGP · ج.م), issuing authority (Central Bank of Egypt), and current denomination counts (e.g. "3 coins, 9 banknotes" in view).
3. Tabs: **Overview**, **Coins**, **Banknotes**.
4. Under Overview, denominations are visually listed (coins: 25pt, 50pt, 1, 5, 10; banknotes: 20, 50, 100, 200) so travelers can visually identify currency and avoid being shortchanged.

---

## 10. Profile, Gamification & History

### Scenario 10.1 — Viewing profile and travel achievements
1. User opens **Profile & Gamification**, sees name, avatar, and a title/badge (e.g. "Giza Explorer").
2. Stats shown: total points (e.g. 1,250) and sites visited (e.g. 12).
3. **Badges** section shows earned vs locked badges (e.g. Pyramid Pioneer, Nile Navigator, Desert Rider, plus locked/unknown badges).
4. **Travel Timeline** lists recent visited sites with points earned per visit (e.g. Egyptian Museum +100, Khan El-Khalili +100, Citadel of Saladin +150).

### Scenario 10.2 — Reviewing full visit history
1. From Profile, user taps into **Visit History**, sees "Your journey so far" — sites visited across governorates (e.g. Giza, Cairo, Luxor, Aswan).
2. **Recommended for You** section suggests a next site based on visit patterns (e.g. Karnak Temple, "Since you enjoyed Ancient Egyptian Temples, this is a strong match").
3. **Full Timeline** lists every visited site chronologically with points (Egyptian Museum, Khan El-Khalili, Citadel of Saladin, Karnak Temple area, Philae Temple, etc.).

---

## 11. Settings

### Scenario 11.1 — Managing account preferences
1. User opens **Settings**.
2. **Preferences**: change Language (e.g. English) and Currency display.
3. **Account**: access **Privacy and Data** settings, or **Logout**.

---

## Summary of Core User Goals

| Goal | Key Screens |
|---|---|
| Arrive safely & avoid scams on Day 1 | Airport Arrival (x4 tip variants) |
| Know current safety status at all times | Home, Environmental, Restricted Zone |
| Get emergency help fast | Emergency Help |
| Discover & navigate to sites safely | Nearby Sites, Site Detail, Direction |
| Avoid getting scammed at sites | Site Detail (scam alerts), Agent Chat, Report an Issue |
| Get live, conversational guidance | Agent Chat (Rihla Buddy) |
| Understand local currency | Currency |
| Track progress & stay motivated | Profile & Gamification, Visit History |
| Manage account | Settings, Sign Up, Login |


---

# 12. Wallet & Token Economy

## Scenario 12.1 — Signup Reward
1. User completes registration.
2. Rihla awards **100 Free Tokens**.
3. Welcome screen explains what tokens can be used for.
4. User starts exploring.

## Scenario 12.2 — Wallet
- Current Token Balance
- Current Points
- Subscription Status
- Monthly Tokens
- Transaction History
- Buy Tokens
- Convert Points

## Scenario 12.3 — AI Usage
1. User starts an AI feature.
2. Token cost is shown before execution.
3. Tokens are deducted after success.
4. Remaining balance is updated.

## Scenario 12.4 — Out of Tokens
When tokens reach zero the user is never blocked.
The app offers:
- Subscribe
- Buy Tokens
- Earn Tokens through Challenges

---

# 13. Subscription & Payments

## Scenario 13.1 — Subscribe
1. User compares Explorer, Adventurer and Voyager plans.
2. User completes payment.
3. Monthly tokens are added.

## Scenario 13.2 — Buy Token Pack
1. User selects a token pack.
2. Payment succeeds.
3. Wallet updates immediately.

---

# 14. Gamification

## Scenario 14.1 — Daily Challenges
Users complete daily missions, gain XP, points and badges.

## Scenario 14.2 — Convert Points
100 pts → 10 tokens
500 pts → 60 tokens
1000 pts → 150 tokens

## Scenario 14.3 — Leaderboard
Users compare progress with other travelers.

---

# 15. Referral

## Scenario 15.1
Invite a friend.
Friend registers.
User receives referral rewards.

---

# 16. AI Transparency

Every premium AI feature displays its token cost before execution.

Low token balance always shows:
- Upgrade Plan
- Buy Tokens
- Earn Tokens

---

# Updated Core User Goals

| Goal | Key Screens |
|---|---|
| Explore Egypt safely | Home, Explore, Site Detail |
| AI Assistance | Buddy AI |
| Wallet Management | Wallet |
| Subscription | Plans |
| Buy Tokens | Store |
| Earn Rewards | Challenges, Badges, Leaderboard |
| Referral | Invite Friends |
| Journey Progress | Profile, Visit History |
