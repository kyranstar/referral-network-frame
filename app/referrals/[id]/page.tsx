import {kv} from "@vercel/kv";
import {Referral, Campaign, Currency} from "@/app/types";
import Head from "next/head";
import {Metadata, ResolvingMetadata} from "next";
import {getReferral, getCampaign} from "@/app/actions";


export default async function Page({params}: { params: {id: string}}) {
    const referral = await getReferral(params.id);
    const campaign = await getCampaign(referral.campaign_id);

    let referralLink = `${process.env.VERCEL_URL}/api/refer?id=${referral.id}`

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