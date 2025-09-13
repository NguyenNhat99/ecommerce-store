import api from "./api";

const weatherService = {
    getSuggestion: async (city) => {
        try {
            const res = await api.get(`/weathers?city=${encodeURIComponent(city)}`);
            return res.data;
        } catch (error) {
            console.error("API weather error:", error);
            return null;
        }
    },
};

export default weatherService;