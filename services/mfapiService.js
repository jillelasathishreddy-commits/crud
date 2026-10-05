import axios from "axios";

const BASE_URL = "https://api.mfapi.in";


// =====================================================
// 1. SEARCH MUTUAL FUNDS
// MFAPI: GET /mf/search?q=HDFC
// =====================================================

export const searchFunds = async (keyword) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/mf/search`,
            {
                params: {
                    q: keyword
                },
                
            }
        );

        return response.data;

    } catch (error) {

        console.error("MFAPI SEARCH ERROR:", error.message);

        if (error.response) {
            console.error("MFAPI STATUS:", error.response.status);
            console.error("MFAPI DATA:", error.response.data);
        }

        throw new Error("MFAPI search request failed");
    }
};


// =====================================================
// 2. GET MUTUAL FUND SCHEME DETAILS
// MFAPI: GET /mf/{schemeCode}
// =====================================================

export const getSchemeDetails = async (schemeCode) => {
    try {

        const response = await axios.get(
            `${BASE_URL}/mf/${schemeCode}`,
            {
                timeout: 30000
            }
        );

        return response.data;

    } catch (error) {

        console.error("MFAPI SCHEME ERROR:", error.message);

        if (error.response) {
            console.error("MFAPI STATUS:", error.response.status);
            console.error("MFAPI DATA:", error.response.data);
        }

        throw new Error("MFAPI scheme request failed");
    }
};



// 3. GET LATEST NAV
// MFAPI: GET /mf/{schemeCode}/latest


export const getLatestNAV = async (schemeCode) => {
    try {

        console.log(
            `Calling MFAPI latest NAV: ${BASE_URL}/mf/${schemeCode}/latest`
        );

        const response = await axios.get(
            `${BASE_URL}/mf/${schemeCode}/latest`,
            {
                timeout: 30000
            }
        );

        console.log("MFAPI latest NAV response received");

        return response.data;

    } catch (error) {

        console.error("MFAPI LATEST NAV ERROR:", error.message);

        if (error.response) {
            console.error(
                "MFAPI STATUS:",
                error.response.status
            );

            console.error(
                "MFAPI DATA:",
                error.response.data
            );
        }

        throw new Error("MFAPI request timed out or failed");
    }
};


// =====================================================
// 4. GET NAV HISTORY
// MFAPI: GET /mf/{schemeCode}
// =====================================================

export const getNAVHistory = async (
    schemeCode,
    startDate,
    endDate
) => {

    try {

        const params = {};

        if (startDate) {
            params.startDate = startDate;
        }

        if (endDate) {
            params.endDate = endDate;
        }

        const response = await axios.get(
            `${BASE_URL}/mf/${schemeCode}`,
            {
                params,
                timeout: 30000
            }
        );

        return response.data;

    } catch (error) {

        console.error("MFAPI HISTORY ERROR:", error.message);

        if (error.response) {
            console.error(
                "MFAPI STATUS:",
                error.response.status
            );

            console.error(
                "MFAPI DATA:",
                error.response.data
            );
        }

        throw new Error("MFAPI NAV history request failed");
    }
};