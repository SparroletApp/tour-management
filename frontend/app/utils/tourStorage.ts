
const KEY = "selectedTourId";

export const setSelectedTourId = (id: number | string): void => {
    try {
        localStorage.setItem(KEY, String(id));
    } catch {
    }
};

export const getSelectedTourId = (): string | null => {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
};

export const clearSelectedTourId = (): void => {
    try {
        localStorage.removeItem(KEY);
    } catch {
    
    }
};
