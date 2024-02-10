import {kv} from "@vercel/kv";
import {Referral, Campaign, Currency} from "@/app/types";
import Head from "next/head";
import {Metadata, ResolvingMetadata} from "next";

async function getReferral(id: string): Promise<Referral> {
    let nullReferral = {
        id: "",
        created_at: 0,
        campaign_id: "",
        referrer_fid: 0,
    };

    try {
        let Referral: Referral | null = await kv.hgetall(`referral:${id}`);

        if (!Referral) {
            return nullReferral;
        }

        return Referral;
    } catch (error) {
        console.error(error);
        return nullReferral;
    }
}

async function getCampaign(id: string): Promise<Campaign> {
    let nullCampaign = {
        id: "",
        created_at: 0,
        title: "",
        image_url: "",
        button_title: "",
        redirect_url: "",
        max_referrals_per_referrer: 0,
        current_pool_size: 0,
        cpc: 0,
        denomination_currency: "USDC" as Currency,
        max_referrers: 0,
    };

    try {
        let campaign: Campaign | null = await kv.hgetall(`campaign:${id}`);

        if (!campaign) {
            return nullCampaign;
        }

        return campaign;
    } catch (error) {
        console.error(error);
        return nullCampaign;
    }
}



export default async function Page({params}: { params: {id: string}}) {
    const referral = await getReferral(params.id);
    const campaign = await getCampaign(referral.campaign_id);

    let referralLink = `${process.env['HOST']}/api/refer?id=${referral.id}`

    return(
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                    <h1>Referral ${referral.id}</h1>
                    <a href={`/campaigns/${referral.campaign_id}`} className="underline">Campaign for ${campaign.title}</a>
                    <p>Share link to refer: ${referralLink}</p>
                </main>
            </div>
        </>
    );

}