-- Seed SQL for SocialBets
-- Run in Supabase SQL Editor AFTER running the migration
-- Creates sports, leagues, events with markets and odds

-- Helper: generate CUID-like IDs
CREATE OR REPLACE FUNCTION gen_cuid() RETURNS TEXT AS $$
  SELECT LOWER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 25))
$$ LANGUAGE sql;

-- ═══════════════════════════════════════════════════════════════
-- SPORT 1: Calcio
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "Sport" ("id", "name", "slug", "icon", "active") VALUES
('s_calcio', 'Calcio', 'calcio', '⚽', true)
ON CONFLICT ("slug") DO NOTHING;

-- Serie A
INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_seriea', 's_calcio', 'Serie A', 'serie-a', 'Italia', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- Premier League
INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_premier', 's_calcio', 'Premier League', 'premier-league', 'Inghilterra', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- La Liga
INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_laliga', 's_calcio', 'La Liga', 'la-liga', 'Spagna', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- Bundesliga
INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_bundes', 's_calcio', 'Bundesliga', 'bundesliga', 'Germania', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- Ligue 1
INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_ligue1', 's_calcio', 'Ligue 1', 'ligue-1', 'Francia', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SPORT 2: Basket
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "Sport" ("id", "name", "slug", "icon", "active") VALUES
('s_basket', 'Basket', 'basket', '🏀', true)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_nba', 's_basket', 'NBA', 'nba', 'USA', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_lba', 's_basket', 'Lega Basket Serie A', 'lba', 'Italia', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SPORT 3: Tennis
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "Sport" ("id", "name", "slug", "icon", "active") VALUES
('s_tennis', 'Tennis', 'tennis', '🎾', true)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_atp', 's_tennis', 'ATP Tour', 'atp', 'Mondo', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_wta', 's_tennis', 'WTA Tour', 'wta', 'Mondo', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SPORT 4: F1
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "Sport" ("id", "name", "slug", "icon", "active") VALUES
('s_f1', 'F1', 'f1', '🏎️', true)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_f1world', 's_f1', 'Campionato Mondiale', 'f1-world', 'Mondo', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SPORT 5: MMA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "Sport" ("id", "name", "slug", "icon", "active") VALUES
('s_mma', 'MMA', 'mma', '🥊', true)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "League" ("id", "sportId", "name", "slug", "country", "active") VALUES
('l_ufc', 's_mma', 'UFC', 'ufc', 'Mondo', true)
ON CONFLICT ("sportId", "slug") DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- EVENTS - Serie A
-- ═══════════════════════════════════════════════════════════════

-- Helper: create event + 3 markets + all outcomes
DO $$
DECLARE
  ev RECORD;
  m_result TEXT;
  m_overunder TEXT;
  m_btts TEXT;
  o_result TEXT;
  o_overunder TEXT;
  o_btts TEXT;
  ev_id TEXT;
  start_time TIMESTAMP;
BEGIN
  -- Serie A events
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('Inter', 'Milan', 3),
    ('Juventus', 'Napoli', 5),
    ('Roma', 'Lazio', 7),
    ('Atalanta', 'Fiorentina', 4),
    ('Bologna', 'Torino', 6),
    ('Genoa', 'Sampdoria', 8),
    ('Cagliari', 'Lecce', 2),
    ('Verona', 'Parma', 10)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_seriea', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    -- Risultato Finale
    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN')
    ON CONFLICT ("eventId", "slug") DO NOTHING;

    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 2.1),
    (gen_cuid(), m_result, 'Pareggio', 'draw', 3.3),
    (gen_cuid(), m_result, ev.away, 'away', 3.1)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    -- Over/Under 2.5
    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status")
    VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN')
    ON CONFLICT ("eventId", "slug") DO NOTHING;

    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES
    (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.85),
    (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 1.95)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    -- BTTS
    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status")
    VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN')
    ON CONFLICT ("eventId", "slug") DO NOTHING;

    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES
    (gen_cuid(), m_btts, 'Sì', 'yes', 1.75),
    (gen_cuid(), m_btts, 'No', 'no', 2.05)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- Premier League events
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('Arsenal', 'Chelsea', 3),
    ('Liverpool', 'Man City', 5),
    ('Man United', 'Tottenham', 4),
    ('Newcastle', 'Aston Villa', 7),
    ('Brighton', 'West Ham', 6)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_premier', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status")
    VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN')
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES
    (gen_cuid(), m_result, ev.home, 'home', 1.9),
    (gen_cuid(), m_result, 'Pareggio', 'draw', 3.5),
    (gen_cuid(), m_result, ev.away, 'away', 3.8)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status")
    VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN')
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES
    (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.80),
    (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 2.00)
    ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status")
    VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN')
    ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES
    (gen_cuid(), m_btts, 'Sì', 'yes', 1.70),
    (gen_cuid(), m_btts, 'No', 'no', 2.10)
    ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- La Liga events
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('Real Madrid', 'Barcelona', 4),
    ('Atletico Madrid', 'Sevilla', 6),
    ('Real Sociedad', 'Athletic Bilbao', 5)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_laliga', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 2.0), (gen_cuid(), m_result, 'Pareggio', 'draw', 3.4), (gen_cuid(), m_result, ev.away, 'away', 3.5) ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.85), (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 1.95) ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_btts, 'Sì', 'yes', 1.80), (gen_cuid(), m_btts, 'No', 'no', 2.00) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- Bundesliga events
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('Bayern Monaco', 'Borussia Dortmund', 3),
    ('RB Leipzig', 'Bayer Leverkusen', 5),
    ('Eintracht Francoforte', 'Stoccarda', 7)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_bundes', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.8), (gen_cuid(), m_result, 'Pareggio', 'draw', 3.6), (gen_cuid(), m_result, ev.away, 'away', 4.0) ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.75), (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 2.05) ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_btts, 'Sì', 'yes', 1.70), (gen_cuid(), m_btts, 'No', 'no', 2.10) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- Ligue 1 events
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('PSG', 'Olympique Marsiglia', 4),
    ('Lyon', 'Monaco', 6)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_ligue1', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.5), (gen_cuid(), m_result, 'Pareggio', 'draw', 4.0), (gen_cuid(), m_result, ev.away, 'away', 5.5) ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_overunder := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_overunder, ev_id, 'Gol O/U 2.5', 'over-under-25', 'OVER_UNDER', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_overunder, 'Oltre 2.5', 'over', 1.70), (gen_cuid(), m_overunder, 'Sotto 2.5', 'under', 2.10) ON CONFLICT ("marketId", "slug") DO NOTHING;

    m_btts := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_btts, ev_id, 'Entrambe Segnano', 'btts', 'BOTH_TEAMS_SCORE', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_btts, 'Sì', 'yes', 1.65), (gen_cuid(), m_btts, 'No', 'no', 2.15) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════
  -- NBA events
  -- ═══════════════════════════════════════════════════════════════
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('LA Lakers', 'Boston Celtics', 2),
    ('Golden State Warriors', 'Miami Heat', 3),
    ('Milwaukee Bucks', 'Phoenix Suns', 4),
    ('Dallas Mavericks', 'Denver Nuggets', 5),
    ('Philadelphia 76ers', 'New York Knicks', 2)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_nba', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.9), (gen_cuid(), m_result, ev.away, 'away', 1.9) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- LBA events
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('Olimpia Milano', 'Virtus Bologna', 3),
    ('Dinamo Sassari', 'Reyer Venezia', 5)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_lba', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.7), (gen_cuid(), m_result, ev.away, 'away', 2.1) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════
  -- Tennis events
  -- ═══════════════════════════════════════════════════════════════
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('C. Alcaraz', 'J. Sinner', 7),
    ('N. Djokovic', 'D. Medvedev', 5),
    ('A. Zverev', 'C. Ruud', 6)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_atp', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.6), (gen_cuid(), m_result, ev.away, 'away', 2.3) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  FOR ev IN SELECT home, away, days FROM (VALUES
    ('I. Swiatek', 'A. Sabalenka', 4),
    ('C. Gauff', 'E. Rybakina', 6)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_wta', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.7), (gen_cuid(), m_result, ev.away, 'away', 2.1) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════
  -- F1 events
  -- ═══════════════════════════════════════════════════════════════
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('M. Verstappen', 'L. Hamilton', 10),
    ('C. Leclerc', 'L. Norris', 14)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_f1world', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.4), (gen_cuid(), m_result, ev.away, 'away', 2.8) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════
  -- UFC events
  -- ═══════════════════════════════════════════════════════════════
  FOR ev IN SELECT home, away, days FROM (VALUES
    ('I. Adesanya', 'A. Pereira', 8),
    ('C. Oliveira', 'J. Gaethje', 12)
  ) AS t(home, away, days)
  LOOP
    ev_id := gen_cuid();
    start_time := NOW() + (ev.days || ' days')::INTERVAL + INTERVAL '8 hours';

    INSERT INTO "Event" ("id", "leagueId", "externalId", "homeTeamName", "awayTeamName", "startTime", "status", "slug")
    VALUES (ev_id, 'l_ufc', 'seed-' || LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')), ev.home, ev.away, start_time, 'UPCOMING', LOWER(REPLACE(ev.home, ' ', '-')) || '-vs-' || LOWER(REPLACE(ev.away, ' ', '-')))
    ON CONFLICT ("externalId") DO NOTHING;

    m_result := gen_cuid();
    INSERT INTO "Market" ("id", "eventId", "name", "slug", "type", "status") VALUES (m_result, ev_id, 'Risultato Finale', 'match-result', 'MATCH_RESULT', 'OPEN') ON CONFLICT ("eventId", "slug") DO NOTHING;
    INSERT INTO "Outcome" ("id", "marketId", "name", "slug", "odds") VALUES (gen_cuid(), m_result, ev.home, 'home', 1.8), (gen_cuid(), m_result, ev.away, 'away', 2.0) ON CONFLICT ("marketId", "slug") DO NOTHING;
  END LOOP;

END $$;

-- ═══════════════════════════════════════════════════════════════
-- Admin user (password: admin123)
-- ═══════════════════════════════════════════════════════════════
-- bcrypt hash of "admin123" with 12 rounds
INSERT INTO "User" ("id", "email", "username", "name", "passwordHash", "balance", "realBalance", "inviteCode")
VALUES ('usr_admin', 'admin@socialbets.com', 'admin', 'Admin', '$2b$12$/BGMkIge5Pgpj1pI55ioqukoirBm6/jI67R4GszGANKPIurFNEn/.', 100000, 0, 'ADMIN2024')
ON CONFLICT ("email") DO NOTHING;

-- Demo users (password: password123)
INSERT INTO "User" ("id", "email", "username", "name", "passwordHash", "balance", "realBalance", "inviteCode")
VALUES
('usr_marco', 'marco@demo.com', 'marco', 'Marco', '$2b$12$AsLHm7ydqclN5qY/OFWR7OWQDHIsJnY8byP7LZzwFI/PG6hpb0LZ2', 10000, 0, 'MARCO2024'),
('usr_luca', 'luca@demo.com', 'luca', 'Luca', '$2b$12$AsLHm7ydqclN5qY/OFWR7OWQDHIsJnY8byP7LZzwFI/PG6hpb0LZ2', 10000, 0, 'LUCA2024'),
('usr_giulia', 'giulia@demo.com', 'giulia', 'Giulia', '$2b$12$AsLHm7ydqclN5qY/OFWR7OWQDHIsJnY8byP7LZzwFI/PG6hpb0LZ2', 10000, 0, 'GIULIA2024')
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
