const fs = require('fs');

function replaceFile(path, replacer) {
  try {
    let content = fs.readFileSync(path, 'utf8');
    content = replacer(content);
    fs.writeFileSync(path, content);
    console.log('Updated ' + path);
  } catch(e) {
    console.error('Error in ' + path, e.message);
  }
}

// 1. game/[id]/page.tsx
replaceFile('src/app/(app)/game/[id]/page.tsx', (content) => {
  return content.replace(
    /  const \{ data: jokerPick \}[\s\S]*?import\('@\/types\/database'\)\.Bet\} \/>/,
    '  return <MatchLive game={game} bet={bet} />'
  );
});

// 2. types/database.ts
replaceFile('src/types/database.ts', (content) => {
  return content
    .replace(/.*scoring_joker: boolean\r?\n/g, '')
    .replace(/.*scoring_joker\?: boolean\r?\n/g, '')
    .replace(/.*has_joker\?: boolean\r?\n/g, '');
});

// 3. palpites/usuario/[id]/page.tsx
replaceFile('src/app/(app)/palpites/usuario/[id]/page.tsx', (content) => {
  content = content.replace(/filter_teams, filter_phases, scoring_joker/g, 'filter_teams, filter_phases');
  
  content = content.replace(
    /  \/\/ Busca scoring_joker do grupo[\s\S]*?groupScoringJoker = groupConfig\?\.scoring_joker \?\? true\r?\n  }\r?\n/,
    ''
  );

  content = content.replace(
    /  \/\/ Busca joker_picks do usuário[\s\S]*?return \{ \.\.\.b, has_joker, points_earned \}\r?\n  \}\)\r?\n/,
    ''
  );

  content = content.replace(/betsWithJoker\.reduce/g, '(bets ?? []).reduce');
  content = content.replace(/calculateBetPoints\(b\.home_bet, b\.away_bet, game\.home_score, game\.away_score, b\.has_joker && groupScoringJoker\)/g, 'calculateBetPoints(b.home_bet, b.away_bet, game.home_score, game.away_score)');
  
  content = content.replace(/betsWithJoker\.filter/g, '(bets ?? []).filter');
  content = content.replace(/betsWithJoker\.find/g, '(bets ?? []).find');
  
  content = content.replace(/calculateBetPoints\(bet\.home_bet, bet\.away_bet, game\.home_score, game\.away_score, \(bet\.has_joker \?\? false\) && groupScoringJoker\)/g, 'calculateBetPoints(bet.home_bet, bet.away_bet, game.home_score, game.away_score)');
  
  content = content.replace(/.*\{bet\.has_joker && groupScoringJoker && ' ⚡'\}.*\r?\n/g, '');
  
  return content;
});

// 4. group/[id]/page.tsx
replaceFile('src/app/(app)/group/[id]/page.tsx', (content) => {
  content = content.replace(
    /  \/\/ Busca joker_picks para os jogos ao vivo[\s\S]*?jp => String\(jp\.game_id\) === String\(b\.game_id\) && jp\.user_id === b\.user_id\r?\n    \)\r?\n  \}\)\)/,
    '  const liveBets = liveBetsData'
  );

  content = content.replace(
    /  \/\/ Busca joker_picks de todos os membros[\s\S]*?away_team: \(jp\.games as \{ home_team: string \| null; away_team: string \| null \} \| null\)\?\.away_team \?\? null,\r?\n  \}\)\)\r?\n/,
    ''
  );

  content = content.replace(/.*jokerAudit=\{jokerAudit as import\('@\/components\/group\/GroupModals'\)\.JokerAuditEntry\[\]\}.*\r?\n/g, '');
  return content;
});

// 5. group/[id]/actions.ts
replaceFile('src/app/(app)/group/[id]/actions.ts', (content) => {
  content = content.replace(/scoring_joker, /g, '');
  
  content = content.replace(/      \/\/ Busca joker_picks do membro[\s\S]*?jokerPickGameIds\.add\(Number\(jp\.game_id\)\)\)\r?\n      \}\r?\n/g, '');
  
  content = content.replace(/        if \(group\.scoring_joker === false && jokerPickGameIds\.has\(Number\(bet\.game_id\)\)\) \{\r?\n          points = Math\.floor\(points \/ 2\)\r?\n        \}\r?\n/g, '');
  
  content = content.replace(/      return groupPreds\.reduce\(\(acc, bet\) => \{\r?\n        let points = bet\.points_earned \?\? 0\r?\n\r?\n        acc \+= points\r?\n        return acc\r?\n      \}, 0\)/g, '      return groupPreds.reduce((acc, bet) => acc + (bet.points_earned ?? 0), 0)');

  content = content.replace(/const scoringJokerSchema = z\.object\(\{[\s\S]*?export async function saveScoringJoker[\s\S]*?\}\r?\n/g, '');
  return content;
});

// 6. GroupModals.tsx
replaceFile('src/components/group/GroupModals.tsx', (content) => {
  content = content.replace(/export interface JokerAuditEntry \{[\s\S]*?\}\r?\n\r?\n/, '');
  content = content.replace(/  jokerAudit\?: JokerAuditEntry\[\]\r?\n/, '');
  content = content.replace(/, jokerAudit = \[\] /, ' ');
  content = content.replace(/  const \[scoringJoker, setScoringJoker\] = useState\(group\?\.scoring_joker \?\? true\)\r?\n/, '');
  content = content.replace(/  const \[jokerConfirmPending, setJokerConfirmPending\] = useState<boolean \| null>\(null\)\r?\n/, '');
  content = content.replace(/ \| 'scoring_joker'/g, '');
  content = content.replace(/      scoring_joker: setScoringJoker,\r?\n/, '');
  
  // Cut blocks by markers
  let startCoringa = content.indexOf('{/* 5. Coringa */}');
  let startHistorico = content.indexOf('{/* Histórico de Coringas dos Membros */}');
  let endCoringa = startHistorico > -1 ? startHistorico : content.length; // assuming Histórico is right after
  
  if (startCoringa > -1) {
    // Find the end of Histórico. Histórico ends before the outer </div> of the modals content.
    // We can just find the end of it by looking for `<div className="mt-8">` which comes after.
    let nextSection = content.indexOf('<div className="mt-8">', startCoringa);
    if (nextSection > -1) {
       let sectionToCut = content.substring(startCoringa, nextSection);
       content = content.replace(sectionToCut, '');
    }
  }

  return content;
});
