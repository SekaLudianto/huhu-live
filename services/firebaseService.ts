import { LeaderboardEntry, User } from '../types';

const COOKIE_NAME = 'katlaLeaderboard';

// Fungsi bantuan untuk mengatur cookie
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}

// Fungsi bantuan untuk mendapatkan cookie
function getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}


const getLeaderboard = (): LeaderboardEntry[] => {
    try {
        const leaderboardDataString = getCookie(COOKIE_NAME);
        if (leaderboardDataString) {
            const data = JSON.parse(leaderboardDataString);
            if(Array.isArray(data)) {
                return data;
            }
        }
        return [];
    } catch (error) {
        console.error("Error reading leaderboard cookie: ", error);
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
        setCookie(COOKIE_NAME, JSON.stringify(sortedLeaderboard), 365); // Simpan selama 1 tahun
        
        return sortedLeaderboard;
    } catch (error) {
        console.error("Error updating winner score in cookie: ", error);
        return getLeaderboard(); // Kembalikan data yang ada jika terjadi galat
    }
};

const initialize = () => {
    console.log("Leaderboard service initialized (Cookie-based).");
};

export const leaderboardService = {
    initialize,
    getLeaderboard,
    updateWinnerScore,
};