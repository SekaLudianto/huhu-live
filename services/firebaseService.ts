import { LeaderboardEntry, User } from '../types';

const STORAGE_KEY = 'katlaLeaderboard';

const getLeaderboard = (): LeaderboardEntry[] => {
    try {
        const leaderboardDataString = localStorage.getItem(STORAGE_KEY);
        if (leaderboardDataString) {
            const data = JSON.parse(leaderboardDataString);
            if(Array.isArray(data)) {
                return data;
            }
        }
        return [];
    } catch (error) {
        console.error("Error reading leaderboard from localStorage: ", error);
        return [];
    }
};

const updateWinnerScore = (winner: User): LeaderboardEntry[] => {
    try {
        let leaderboard = getLeaderboard();
        const userIndex = leaderboard.findIndex(entry => entry.user.uniqueId === winner.uniqueId);

        if (userIndex > -1) {
            // Pengguna ada, perbarui skor dan info pengguna
            const updatedUser = { 
                user: winner,
                wins: leaderboard[userIndex].wins + 1 
            };
            leaderboard[userIndex] = updatedUser;
        } else {
            // Pengguna baru, tambahkan ke papan peringkat
            const newWinner = { user: { ...winner }, wins: 1 };
            leaderboard.push(newWinner);
        }

        // Urutkan dan simpan
        const sortedLeaderboard = leaderboard.sort((a, b) => b.wins - a.wins);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedLeaderboard));
        
        return sortedLeaderboard;
    } catch (error) {
        console.error("Error updating winner score in localStorage: ", error);
        return getLeaderboard(); // Kembalikan data yang ada jika terjadi galat
    }
};

const initialize = () => {
    console.log("Leaderboard service initialized (localStorage-based).");
};

export const leaderboardService = {
    initialize,
    getLeaderboard,
    updateWinnerScore,
};
