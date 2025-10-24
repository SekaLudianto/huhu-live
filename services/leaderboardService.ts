import { LeaderboardEntry, User } from '../types';

const STORAGE_KEY = 'katlaLeaderboard';

// Fungsi bantuan untuk mengatur localStorage
function setLocalStorage(key: string, value: any) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

// Fungsi bantuan untuk mendapatkan dari localStorage
function getLocalStorage(key: string): any | null {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        return null;
    }
}


const getLeaderboard = (): LeaderboardEntry[] => {
    try {
        const data = getLocalStorage(STORAGE_KEY);
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (error) {
        console.error("Error reading leaderboard from storage: ", error);
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
        setLocalStorage(STORAGE_KEY, sortedLeaderboard);
        
        return sortedLeaderboard;
    } catch (error) {
        console.error("Error updating winner score in storage: ", error);
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