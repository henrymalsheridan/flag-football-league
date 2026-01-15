import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';

/// 1. YOUR SHEET ID (Extracted from your link)
const SHEET_ID = "1ktUHYrztco2tRIWerUUwAw3gdrd0rD4dhj7Pj_S81UQ";

// 2. YOUR TAB GIDs 
// Check your browser URL when you click each tab to get the correct numbers!
const TABS = {
  teams: '0',       // Usually the first tab created
  roster: '1212439371',    // REPLACE with the GID for your 'Roster' tab
  schedule: '209587719',  // REPLACE with the GID for your 'Schedule' tab
};

function App() {
  const [schedule, setSchedule] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Helper function to fetch a single tab
      const fetchTab = (gid) => 
        new Promise((resolve) => {
          Papa.parse(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`, {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
          });
        });

      // Fetch both tabs
      const scheduleData = await fetchTab(TABS.schedule);
      const teamData = await fetchTab(TABS.teams);

      setSchedule(scheduleData);
      setTeams(teamData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <h1>Loading League Data...</h1>;

  return (
    <div className="container">
      <header>
        <h1>🏈 ENDZN Flag Football League 🏈</h1>
      </header>

      <section>
        <h2>Standings</h2>
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>W</th>
              <th>L</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr key={idx}>
                <td>{team.TeamName}</td>
                <td>{team.Wins}</td>
                <td>{team.Losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Upcoming Games</h2>
        <div className="games-grid">
          {schedule.map((game, idx) => (
            <div key={idx} className="game-card">
              <div className="date">{game.Date} @ {game.Time}</div>
              <div className="matchup">
                <span>{game.TeamA}</span> vs <span>{game.TeamB}</span>
              </div>
              <div className="field">📍 {game.Field}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;