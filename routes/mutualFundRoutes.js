import express from "express";

import {
    searchMutualFunds,
    getMutualFundDetails,
    getLatestNav,
    getNavHistory,
    getStoredMutualFunds,
    getReturns
} from "../controller/mutualFundController.js";


const router = express.Router();


// =====================================================
// 1. SEARCH MUTUAL FUNDS
// =====================================================

router.get(
    "/search",
    searchMutualFunds
);


// =====================================================
// 2. RETURNS
// Example:
// /api/mutual-funds/125497/returns?years=3
// =====================================================

router.get(
    "/:schemeCode/returns",
    getReturns
);


// =====================================================
// 3. LATEST NAV
// =====================================================

router.get(
    "/:schemeCode/latest",
    getLatestNav
);


// =====================================================
// 4. NAV HISTORY
// =====================================================

router.get(
    "/:schemeCode/nav-history",
    getNavHistory
);


// =====================================================
// 5. SCHEME DETAILS
// =====================================================

router.get(
    "/:schemeCode",
    getMutualFundDetails
);


// =====================================================
// 6. GET STORED MUTUAL FUNDS
// =====================================================

router.get(
    "/",
    getStoredMutualFunds
);

router.get(
    "/:schemeCode/returns",
    getReturns
);


export default router;