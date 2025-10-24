// services/participationService.ts
const PARTICIPANTS_KEY = 'katlaParticipants';

/**
 * Mengambil daftar ID unik peserta dari localStorage.
 * @returns {Set<string>} Set berisi ID unik peserta.
 */
const getParticipants = (): Set<string> => {
    try {
        const data = localStorage.getItem(PARTICIPANTS_KEY);
        if (data) {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                return new Set(parsedData);
            }
        }
    } catch (error) {
        console.error("Gagal membaca daftar peserta dari localStorage:", error);
    }
    return new Set<string>();
};

/**
 * Menambahkan ID unik pengguna ke dalam daftar peserta di localStorage.
 * @param {string} uniqueId ID unik pengguna.
 */
const addParticipant = (uniqueId: string): void => {
    try {
        const participants = getParticipants();
        if (!participants.has(uniqueId)) {
            participants.add(uniqueId);
            localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(Array.from(participants)));
        }
    } catch (error) {
        console.error("Gagal menambahkan peserta ke localStorage:", error);
    }
};

/**
 * Memeriksa apakah seorang pengguna sudah menjadi peserta.
 * @param {string} uniqueId ID unik pengguna.
 * @returns {boolean} True jika sudah menjadi peserta, false jika belum.
 */
const isParticipant = (uniqueId: string): boolean => {
    return getParticipants().has(uniqueId);
};

export const participationService = {
    getParticipants,
    addParticipant,
    isParticipant,
};
