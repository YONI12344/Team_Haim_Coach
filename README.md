# Team Haim / צוות חיים

Running coach web app built with Next.js 15 + TypeScript + Tailwind + Supabase.

## English Setup

1. Copy env file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in Supabase values inside `.env.local`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations in Supabase SQL editor from:
   - `supabase/migrations/001_initial_schema.sql`
5. Configure Supabase Auth providers:
   - Google OAuth
   - Email magic link
6. Run locally:
   ```bash
   npm run dev
   ```
7. Build check:
   ```bash
   npm run build
   ```

## הוראות התקנה בעברית

1. העתיקו קובץ סביבה:
   ```bash
   cp .env.local.example .env.local
   ```
2. הכניסו את ערכי Supabase בתוך `.env.local`.
3. התקינו חבילות:
   ```bash
   npm install
   ```
4. הריצו את הסכמה מקובץ:
   - `supabase/migrations/001_initial_schema.sql`
5. הפעילו ב-Supabase Auth:
   - Google OAuth
   - Magic Link באימייל
6. הרצה מקומית:
   ```bash
   npm run dev
   ```
7. בדיקת Build:
   ```bash
   npm run build
   ```
