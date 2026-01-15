import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import './App.css';

// --- CONFIGURATION ---
// I have inserted your specific Sheet ID and Tab GIDs here
const SHEET_ID = "1ktUHYrztco2tRIWerUUwAw3gdrd0rD4dhj7Pj_S81UQ";

const TABS = {
  teams: '0',           // 'Teams' tab
  roster: '1212439371', // 'Roster' tab
  schedule: '209587719' // 'Schedule' tab
};

// --- DATA FETCHING ---
const useLeagueData = () => {
  const [data, setData] = useState({ schedule: [], teams: [], roster: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTab = (gid) => 
      new Promise((resolve) => {
        Papa.parse(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`, {
          download: true, header: true,
          complete: (results) => resolve(results.data),
        });
      });

    Promise.all([
      fetchTab(TABS.schedule),
      fetchTab(TABS.teams),
      fetchTab(TABS.roster)
    ]).then(([schedule, teams, roster]) => {
      setData({ schedule, teams, roster });
      setLoading(false);
    });
  }, []);

  return { ...data, loading };
};

// --- COMPONENTS ---

const NavBar = () => (
  <nav className="navbar">
    <div className="nav-container">
      {/* LINK THE LOGO TO HOME */}
      <Link to="/" className="nav-logo">
        <img src="public/endznlogoWhite (1).png" alt="League Logo" />
      </Link>

      <div className="nav-links">
        <Link to="/">Schedule</Link>
        <Link to="/standings">Standings</Link>
        <Link to="/roster">Rosters</Link>
        <Link to="/rules">Rules</Link>
        <Link to="/photos">Photos</Link>
      </div>
    </div>
  </nav>
);

const ScheduleView = ({ schedule, teamFilter = null }) => {
  // If teamFilter is provided, only show games for that team
  const games = teamFilter 
    ? schedule.filter(g => g.TeamA === teamFilter || g.TeamB === teamFilter)
    : schedule;

  return (
    <div className="games-grid">
      {games.length === 0 ? <p>No games scheduled.</p> : games.map((game, idx) => (
        <div key={idx} className="game-card">
          <div className="date">{game.Date} @ {game.Time}</div>
          <div className="matchup">
            <span className={game.TeamA === teamFilter ? 'highlight' : ''}>{game.TeamA}</span>
            <span className="vs">vs</span>
            <span className={game.TeamB === teamFilter ? 'highlight' : ''}>{game.TeamB}</span>
          </div>
          <div className="scores">
            {game.ScoreA ? `${game.ScoreA} - ${game.ScoreB}` : 'vs'}
          </div>
          <div className="field">📍 {game.Field}</div>
        </div>
      ))}
    </div>
  );
};

const Standings = ({ teams }) => (
  <div className="card">
    <h2>League Standings</h2>
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>W</th>
          <th>L</th>
        </tr>
      </thead>
      <tbody>
        {teams.sort((a,b) => b.Wins - a.Wins).map((team, idx) => (
          <tr key={idx}>
            <td>{team.TeamName}</td>
            <td>{team.Wins}</td>
            <td>{team.Losses}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RosterList = ({ teams }) => (
  <div className="team-grid">
    {teams.map((team, idx) => (
      <Link key={idx} to={`/roster/${team.TeamName}`} className="team-card-link">
        <div className="team-card">
          <h3>{team.TeamName}</h3>
          <p>Record: {team.Wins}-{team.Losses}</p>
          <span className="btn-details">View Roster & Schedule →</span>
        </div>
      </Link>
    ))}
  </div>
);

const TeamDetail = ({ teams, roster, schedule }) => {
  const { teamName } = useParams();
  const team = teams.find(t => t.TeamName === teamName);
  const teamPlayers = roster.filter(p => p.TeamName === teamName);

  if (!team) return <div className="loading">Team not found</div>;

  return (
    <div>
      <div className="team-header">
        <h1>{team.TeamName}</h1>
        <div className="record-badge">{team.Wins}W - {team.Losses}L</div>
      </div>

      <div className="split-view">
        <div className="card">
          <h2>Roster</h2>
          <ul className="player-list">
            {teamPlayers.length > 0 ? teamPlayers.map((p, idx) => (
              <li key={idx}>
                <span className="p-number">#{p.Number}</span>
                <span className="p-name">{p.PlayerName}</span>
                <span className="p-pos">{p.Position}</span>
              </li>
            )) : <p>No players listed.</p>}
          </ul>
        </div>

        <div className="card">
          <h2>Team Schedule</h2>
          <ScheduleView schedule={schedule} teamFilter={teamName} />
        </div>
      </div>
    </div>
  );
};

const SimplePage = ({ title, content }) => (
  <div className="card">
    <h1>{title}</h1>
    <p>{content}</p>
  </div>
);

// --- MAIN APP COMPONENT ---
function App() {
  const { schedule, teams, roster, loading } = useLeagueData();

  if (loading) return <div className="loading">Loading League Data...</div>;

  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <main className="content">
          <Routes>
            <Route path="/" element={<ScheduleView schedule={schedule} />} />
            <Route path="/standings" element={<Standings teams={teams} />} />
            <Route path="/roster" element={<RosterList teams={teams} />} />
            <Route path="/roster/:teamName" element={<TeamDetail teams={teams} roster={roster} schedule={schedule} />} />
            <Route path="/rules" element={<SimplePage title="League Rules" content="1.Play football" />} />
            <Route path="/about" element={<SimplePage title="About Us" content="Recreational Flag Football League. Est 2026." />} />
            <Route path="/photos" element={<SimplePage title="Photos" content="Photo gallery coming soon!" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;