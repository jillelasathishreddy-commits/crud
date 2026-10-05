import mongoose from "mongoose";


const mutualFundSchema = new mongoose.Schema(

    {

        schemeCode: {
            type: Number,
            required: true,
            unique: true
        },

        schemeName: {
            type: String,
            required: true
        },

        fundHouse: {
            type: String
        },

        schemeType: {
            type: String
        },

        schemeCategory: {
            type: String
        },

        isinGrowth: {
            type: String,
            default: null
        },

        isinDivReinvestment: {
            type: String,
            default: null
        },

        latestNav: {
            type: String,
            default: null
        },

        latestNavDate: {
            type: String,
            default: null
        }

    },

    {
        timestamps: true
    }

);


const MutualFund = mongoose.model(
    "MutualFund",
    mutualFundSchema
);


export default MutualFund;