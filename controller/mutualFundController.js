import MutualFund from "../model/mutualFundModel.js";

import {
    searchFunds,
    getSchemeDetails,
    getLatestNAV,
    getNAVHistory
} from "../services/mfapiService.js";


// =====================================================
// 1. SEARCH MUTUAL FUNDS
// GET /api/mutual-funds/search?q=HDFC
// =====================================================

export const searchMutualFunds = async (req, res) => {

    try {

        const { q } = req.query;

        // Validation
        if (!q || q.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Search keyword is required"
            });
        }

        console.log("Searching mutual funds:", q);

        // Call MFAPI
        const data = await searchFunds(q.trim());

        // Return MFAPI response
        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {

        console.error(
            "SEARCH CONTROLLER ERROR:",
            error.message
        );

        return res.status(502).json({
            success: false,
            message: "Unable to get mutual funds from MFAPI",
            error: error.message
        });
    }
};


// =====================================================
// 2. GET SCHEME DETAILS + SAVE TO MONGODB
// GET /api/mutual-funds/:schemeCode
// =====================================================

export const getMutualFundDetails = async (req, res) => {

    try {

        const { schemeCode } = req.params;

        // Validate scheme code
        if (!schemeCode || !/^\d+$/.test(schemeCode)) {

            return res.status(400).json({
                success: false,
                message: "Valid numeric scheme code is required"
            });
        }

        console.log(
            "Getting scheme details:",
            schemeCode
        );

        // Call MFAPI
        const data = await getSchemeDetails(schemeCode);

        // Check response
        if (!data || !data.meta) {

            return res.status(404).json({
                success: false,
                message: "Mutual fund scheme not found"
            });
        }

        const meta = data.meta;

        console.log("Scheme received:", meta.scheme_name);

        // Save / Update MongoDB
        const mutualFund = await MutualFund.findOneAndUpdate(

            {
                schemeCode: Number(meta.scheme_code)
            },

            {
                schemeCode: Number(meta.scheme_code),

                schemeName: meta.scheme_name,

                fundHouse: meta.fund_house,

                schemeType: meta.scheme_type,

                schemeCategory: meta.scheme_category,

                isinGrowth: meta.isin_growth || null,

                isinDivReinvestment:
                    meta.isin_div_reinvestment || null
            },

            {
                new: true,

                // If record doesn't exist,
                // create it
                upsert: true,

                runValidators: true
            }
        );

        return res.status(200).json({

            success: true,

            message:
                "Mutual fund details fetched and saved successfully",

            data: mutualFund
        });

    } catch (error) {

        console.error(
            "SCHEME DETAILS ERROR:",
            error.message
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch and save mutual fund details",

            error: error.message
        });
    }
};


// =====================================================
// 3. GET LATEST NAV + SAVE TO MONGODB
// GET /api/mutual-funds/:schemeCode/latest
// =====================================================

export const getLatestNav = async (req, res) => {

    try {

        const { schemeCode } = req.params;

        // Validate scheme code
        if (!schemeCode || !/^\d+$/.test(schemeCode)) {

            return res.status(400).json({
                success: false,
                message: "Valid numeric scheme code is required"
            });
        }

        console.log(
            "Getting latest NAV for:",
            schemeCode
        );

        // Call MFAPI
        const data = await getLatestNAV(schemeCode);

        console.log(
            "Latest NAV data received:",
            data
        );

        // Check response
        if (
            !data ||
            !data.data ||
            !Array.isArray(data.data) ||
            data.data.length === 0
        ) {

            return res.status(404).json({
                success: false,
                message: "Latest NAV not found"
            });
        }

        const latest = data.data[0];

        // Update existing MongoDB record
        const mutualFund =
            await MutualFund.findOneAndUpdate(

                {
                    schemeCode: Number(schemeCode)
                },

                {
                    latestNav: latest.nav,

                    latestNavDate: latest.date
                },

                {
                    new: true
                }
            );

        // If scheme details haven't been saved yet
        if (!mutualFund) {

            return res.status(404).json({

                success: false,

                message:
                    "Scheme is not stored in MongoDB. Please call the scheme details API first."
            });
        }

        return res.status(200).json({

            success: true,

            message:
                "Latest NAV fetched and saved successfully",

            data: {

                schemeCode: Number(schemeCode),

                nav: latest.nav,

                date: latest.date
            }
        });

    } catch (error) {

        console.error(
            "LATEST NAV CONTROLLER ERROR:",
            error.message
        );

        return res.status(502).json({

            success: false,

            message:
                "Failed to fetch latest NAV",

            error: error.message
        });
    }
};


// =====================================================
// 4. GET NAV HISTORY
// GET /api/mutual-funds/:schemeCode/nav-history
// =====================================================

export const getNavHistory = async (req, res) => {

    try {

        const { schemeCode } = req.params;

        const {
            startDate,
            endDate
        } = req.query;


        // Validate scheme code
        if (!schemeCode || !/^\d+$/.test(schemeCode)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid numeric scheme code is required"
            });
        }


        console.log(
            "Getting NAV history:",
            schemeCode
        );


        // Call MFAPI
        const data = await getNAVHistory(
            schemeCode,
            startDate,
            endDate
        );


        // IMPORTANT:
        // NAV HISTORY IS NOT SAVED IN MONGODB.


        return res.status(200).json({

            success: true,

            data: data
        });

    } catch (error) {

        console.error(
            "NAV HISTORY ERROR:",
            error.message
        );

        return res.status(502).json({

            success: false,

            message:
                "Failed to fetch NAV history",

            error: error.message
        });
    }
};


// =====================================================
// 5. GET MUTUAL FUNDS FROM MONGODB
// GET /api/mutual-funds
// =====================================================

export const getStoredMutualFunds = async (req, res) => {

    try {

        console.log(
            "Getting mutual funds from MongoDB"
        );

        // IMPORTANT:
        // This API DOES NOT call MFAPI.

        const funds = await MutualFund
            .find()
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            count: funds.length,

            data: funds
        });

    } catch (error) {

        console.error(
            "MONGODB GET ERROR:",
            error.message
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch mutual funds from MongoDB",

            error: error.message
        });
    }
};

// =====================================================
// 6. GET RETURNS BASED ON SELECTED YEARS
//
// GET
// /api/mutual-funds/:schemeCode/returns?years=3
//
// Supported:
// 1 year
// 3 years
// 5 years
// 10 years
// =====================================================

export const getReturns = async (req, res) => {

    try {

        const { schemeCode } = req.params;
        const { years } = req.query;


        // =================================================
        // 1. VALIDATE SCHEME CODE
        // =================================================

        if (
            !schemeCode ||
            !/^\d+$/.test(schemeCode)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid numeric scheme code is required"

            });
        }


        // =================================================
        // 2. CHECK YEARS
        // =================================================

        if (!years) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide years. Example: ?years=3"

            });
        }


        const numberOfYears = Number(years);


        // =================================================
        // 3. ALLOWED YEARS
        // =================================================

        const allowedYears = [1, 3, 5, 10];


        if (!allowedYears.includes(numberOfYears)) {

            return res.status(400).json({

                success: false,

                message:
                    "Years must be 1, 3, 5, or 10"

            });
        }


        console.log(
            `Calculating ${numberOfYears} year return for scheme ${schemeCode}`
        );


        // =================================================
        // 4. CALCULATE START DATE
        // =================================================

        const today = new Date();

        const startDateObject = new Date(today);


        startDateObject.setFullYear(
            today.getFullYear() - numberOfYears
        );


        // =================================================
        // 5. FORMAT DATE
        // =================================================

        const formatDate = (date) => {

            const year = date.getFullYear();

            const month = String(
                date.getMonth() + 1
            ).padStart(2, "0");

            const day = String(
                date.getDate()
            ).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };


        const startDate =
            formatDate(startDateObject);

        const endDate =
            formatDate(today);


        // =================================================
        // 6. GET NAV HISTORY FROM MFAPI
        // =================================================

        const data = await getNAVHistory(

            schemeCode,

            startDate,

            endDate

        );


        // =================================================
        // 7. CHECK DATA
        // =================================================

        if (
            !data ||
            !data.data ||
            !Array.isArray(data.data) ||
            data.data.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    `NAV data not available for ${numberOfYears} years`

            });
        }


        const navData = data.data;


        // =================================================
        // 8. MFAPI RETURNS DATA LATEST → OLDEST
        //
        // First item = latest NAV
        // Last item = oldest NAV
        // =================================================

        const latestNAV = navData[0];

        const oldestNAV =
            navData[navData.length - 1];


        const currentNAV =
            parseFloat(latestNAV.nav);

        const startNAV =
            parseFloat(oldestNAV.nav);


        // =================================================
        // 9. CHECK NAV VALUES
        // =================================================

        if (
            isNaN(currentNAV) ||
            isNaN(startNAV) ||
            startNAV <= 0
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Invalid NAV values received from MFAPI"

            });
        }


        // =================================================
        // 10. CALCULATE ABSOLUTE RETURN
        // =================================================

        const absoluteReturn =

            (
                (currentNAV - startNAV)
                / startNAV
            ) * 100;


        // =================================================
        // 11. CALCULATE CAGR
        // =================================================

        const cagr =

            (
                Math.pow(
                    currentNAV / startNAV,
                    1 / numberOfYears
                ) - 1
            ) * 100;


        // =================================================
        // 12. SEND RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            schemeCode: Number(schemeCode),

            period:
                `${numberOfYears} year${numberOfYears > 1 ? "s" : ""}`,

            startDate:
                oldestNAV.date,

            endDate:
                latestNAV.date,

            startNav:
                startNAV.toFixed(4),

            currentNav:
                currentNAV.toFixed(4),

            absoluteReturn:
                `${absoluteReturn.toFixed(2)}%`,

            cagr:
                `${cagr.toFixed(2)}%`

        });


    } catch (error) {

        console.error(
            "RETURNS ERROR:",
            error.message
        );


        return res.status(502).json({

            success: false,

            message:
                "Failed to calculate mutual fund returns",

            error:
                error.message

        });
    }
};