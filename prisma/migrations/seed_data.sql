-- Seed SQL for SocialBets
-- Run in Supabase SQL Editor AFTER running the migration
-- Creates sports, leagues, events with markets and odds

-- Helper: generate CUID-like IDs
CREATE OR REPLACE FUNCTION gen_cuid() RETURNS TEXT AS $$
  SELECT LOWER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 25))
$$ LANGUAGE sql;

-- ═══════════════════════════════════════════════════════════════
-- SPORTS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "Sport" ("id", "name", "slug", "icon", "active") VALUES
('s_calcio', 'Calcio', 'calcio', '⚽', true),
('s_basket', 'Basket', 'basket', '🏀', true),
('s_tennis', 'Tennis', 'tennis', '🎾', true),
('s_f1', 'F1', 'f1', '🏎️', true),
('s_mma', 'MMA', 'mma', '🥊', true)
ON CONFLICT ("slug") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- LEAGUES
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_seriea',  's_calcio', 'Serie A',              'serie-a',        'Italia',    true),
('l_premier', 's_calcio', 'Premier League',       'premier-league', 'Inghilterra', true),
('l_laliga',  's_calcio', 'La Liga',              'la-liga',        'Spagna',    true),
('l_bundes',  's_calcio', 'Bundesliga',           'bundesliga',     'Germania',  true),
('l_ligue1',  's_calcio', 'Ligue 1',              'ligue-1',        'Francia',   true),
('l_nba',     's_basket', 'NBA',                   'nba',            'USA',       true),
('l_lba',     's_basket', 'Lega Basket Serie A',  'lba',            'Italia',    true),
('l_atp',     's_tennis', 'ATP Tour',              'atp',            'Mondo',     true),
('l_wta',     's_tennis', 'WTA Tour',              'wta',            'Mondo',     true),
('l_f1world', 's_f1',     'Campionato Mondiale',   'f1-world',       'Mondo',     true),
('l_ufc',     's_mma',    'UFC',                   'ufc',            'Mondo',     true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- EVENTS + MARKETS + OUTCOMES
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  ev RECORD;
  m_result TEXT;
  m_overunder TEXT;
  m_btts TEXT;
  ev_id TEXT;
  start_time TIMESTAMP;
  now_ts TIMESTAMP := NOW();
  slug_h TEXT;
  slug_a TEXT;
  slug_full TEXT;
BEGIN

  -- ─── Serie A ──────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('Inter', 'Milan', 3, 'l_seriea'),
    ('Juventus', 'Napoli', 5, 'l_seriea'),
    ('Roma', 'Lazio', 7, 'l_seriea'),
    ('Atalanta', 'Fiorentina', 4, 'l_seriea'),
    ('Bologna', 'Torino', 6, 'l_seriea'),
    ('Genoa', 'Sampdoria', 8, 'l_seriea'),
    ('Cagliari', 'Lecce', 2, 'l_seriea'),
    ('Verona', 'Parma', 10, 'l_seriea')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 2.1, now_ts, now_ts),
    (gen_cuid(), m_result, 'Pareggio', 'draw', 3.3, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 3.1, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.85, now_ts, now_ts),
    (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 1.95, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_btts, 'Sì', 'yes', 1.75, now_ts, now_ts),
    (gen_cuid(), m_btts, 'No', 'no', 2.05, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── Premier League ───────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('Arsenal', 'Chelsea', 3, 'l_premier'),
    ('Liverpool', 'Man City', 5, 'l_premier'),
    ('Man United', 'Tottenham', 4, 'l_premier'),
    ('Newcastle', 'Aston Villa', 7, 'l_premier'),
    ('Brighton', 'West Ham', 6, 'l_premier')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.9, now_ts, now_ts),
    (gen_cuid(), m_result, 'Pareggio', 'draw', 3.5, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 3.8, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.80, now_ts, now_ts),
    (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 2.00, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_btts, 'Sì', 'yes', 1.70, now_ts, now_ts),
    (gen_cuid(), m_btts, 'No', 'no', 2.10, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── La Liga ──────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('Real Madrid', 'Barcelona', 4, 'l_laliga'),
    ('Atletico Madrid', 'Sevilla', 6, 'l_laliga'),
    ('Real Sociedad', 'Athletic Bilbao', 5, 'l_laliga')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 2.0, now_ts, now_ts),
    (gen_cuid(), m_result, 'Pareggio', 'draw', 3.4, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 3.5, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.85, now_ts, now_ts),
    (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 1.95, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_btts, 'Sì', 'yes', 1.80, now_ts, now_ts),
    (gen_cuid(), m_btts, 'No', 'no', 2.00, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── Bundesliga ───────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('Bayern Monaco', 'Borussia Dortmund', 3, 'l_bundes'),
    ('RB Leipzig', 'Bayer Leverkusen', 5, 'l_bundes'),
    ('Eintracht Francoforte', 'Stoccarda', 7, 'l_bundes')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.8, now_ts, now_ts),
    (gen_cuid(), m_result, 'Pareggio', 'draw', 3.6, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 4.0, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.75, now_ts, now_ts),
    (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 2.05, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_btts, 'Sì', 'yes', 1.70, now_ts, now_ts),
    (gen_cuid(), m_btts, 'No', 'no', 2.10, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── Ligue 1 ──────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('PSG', 'Olympique Marsiglia', 4, 'l_ligue1'),
    ('Lyon', 'Monaco', 6, 'l_ligue1')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.5, now_ts, now_ts),
    (gen_cuid(), m_result, 'Pareggio', 'draw', 4.0, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 5.5, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.70, now_ts, now_ts),
    (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 2.10, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_btts, 'Sì', 'yes', 1.65, now_ts, now_ts),
    (gen_cuid(), m_btts, 'No', 'no', 2.15, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── NBA ──────────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('LA Lakers', 'Boston Celtics', 2, 'l_nba'),
    ('Golden State Warriors', 'Miami Heat', 3, 'l_nba'),
    ('Milwaukee Bucks', 'Phoenix Suns', 4, 'l_nba'),
    ('Dallas Mavericks', 'Denver Nuggets', 5, 'l_nba'),
    ('Philadelphia 76ers', 'New York Knicks', 2, 'l_nba')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.9, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 1.9, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── LBA ──────────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('Olimpia Milano', 'Virtus Bologna', 3, 'l_lba'),
    ('Dinamo Sassari', 'Reyer Venezia', 5, 'l_lba')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.7, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 2.1, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── ATP ──────────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('C. Alcaraz', 'J. Sinner', 7, 'l_atp'),
    ('N. Djokovic', 'D. Medvedev', 5, 'l_atp'),
    ('A. Zverev', 'C. Ruud', 6, 'l_atp')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.6, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 2.3, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── WTA ──────────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('I. Swiatek', 'A. Sabalenka', 4, 'l_wta'),
    ('C. Gauff', 'E. Rybakina', 6, 'l_wta')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.7, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 2.1, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── F1 ───────────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('M. Verstappen', 'L. Hamilton', 10, 'l_f1world'),
    ('C. Leclerc', 'L. Norris', 14, 'l_f1world')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.4, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 2.8, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ─── UFC ──────────────────────────────────────────────────
  FOR ev IN SELECT home, away, days, league FROM (VALUES
    ('I. Adesanya', 'A. Pereira', 8, 'l_ufc'),
    ('C. Oliveira', 'J. Gaethje', 12, 'l_ufc')
  ) AS t(home, away, days, league)
  LOOP
    slug_h := LOWER(REPLACE(ev.home, ' ', '-'));
    slug_a := LOWER(REPLACE(ev.away, ' ', '-'));
    slug_full := slug_h || '-vs-' || slug_a;
    ev_id := gen_cuid();
    start_time := now_ts + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug", "createdAt", "updatedAt")
    VALUES (ev_id, ev.league, 'seed-' || slug_full, ev.home, ev.away, start_time, 'UPCOMING', slug_full, now_ts, now_ts)
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status", "createdAt", "updatedAt")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN', now_ts, now_ts)
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds", "createdAt", "updatedAt") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.8, now_ts, now_ts),
    (gen_cuid(), m_result, ev.away, 'away', 2.0, now_ts, now_ts)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

END $$;

-- ═══════════════════════════════════════════════════════════════
-- Admin user (password: admin123)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO "User" ("id", "email", "username", "name", "passwordHash", "balance", "realBalance", "inviteCode", "createdAt", "updatedAt")
VALUES ('usr_admin', 'admin@socialbets.com', 'admin', 'Admin', '$2b$12$/BGMkIge5Pgpj1pI55ioqukoirBm6/jI67R4GszGANKPIurFNEn/.', 100000, 0, 'ADMIN2024', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Demo users (password: password123)
INSERT INTO "User" ("id", "email", "username", "name", "passwordHash", "balance", "realBalance", "inviteCode", "createdAt", "updatedAt")
VALUES
('usr_marco', 'marco@demo.com', 'marco', 'Marco', '$2b$12$AsLHm7ydqclN5qY/OFWR7OWQDHIsJnY8byP7LZzwFI/PG6hpb0LZ2', 10000, 0, 'MARCO2024', NOW(), NOW()),
('usr_luca', 'luca@demo.com', 'luca', 'Luca', '$2b$12$AsLHm7ydqclN5qY/OFWR7OWQDHIsJnY8byP7LZzwFI/PG6hpb0LZ2', 10000, 0, 'LUCA2024', NOW(), NOW()),
('usr_giulia', 'giulia@demo.com', 'giulia', 'Giulia', '$2b$12$AsLHm7ydqclN5qY/OFWR7OWQDHIsJnY8byP7LZzwFI/PG6hpb0LZ2', 10000, 0, 'GIULIA2024', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Verify
-- ═══════════════════════════════════════════════════════════════
SELECT 'Sports: ' || COUNT(*) FROM "Sport"
UNION ALL
SELECT 'Leagues: ' || COUNT(*) FROM "League"
UNION ALL
SELECT 'Events: ' || COUNT(*) FROM "Event"
UNION ALL
SELECT 'Markets: ' || COUNT(*) FROM "Market"
UNION ALL
SELECT 'Outcomes: ' || COUNT(*) FROM "Outcome"
UNION ALL
SELECT 'Users: ' || COUNT(*) FROM "User";
