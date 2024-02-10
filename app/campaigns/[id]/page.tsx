import {kv} from "@vercel/kv";
import {Campaign} from "@/app/types";
import {CampaignVoteForm} from "@/app/form";
import Head from "next/head";
import {Metadata, ResolvingMetadata} from "next";
import {redirect} from "next/navigation";

// TODO change to a normal webpage that displays the campaign and allows creating referrals

async function getCampaign(id: string): Promise<Campaign> {

    try {
        let Campaign: Campaign | null = await kv.hgetall(`campaign:${id}`);

        if (!Campaign) {
            throw new Error("Campaign not found");
        }

        return Campaign;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = params.id
    const Campaign = await getCampaign(id)

    const fcMetadata: Record<string, string> = {
        "fc:frame": "vNext",
        "fc:frame:post_url": `${process.env['HOST']}/api/vote?id=${id}`,
        "fc:frame:image": `${process.env['HOST']}/api/image?id=${id}`,
    };
    [Campaign.option1, Campaign.option2, Campaign.option3, Campaign.option4].filter(o => o !== "").map((option, index) => {
        fcMetadata[`fc:frame:button:${index + 1}`] = option;
    })


    return {
        title: Campaign.title,
        openGraph: {
            title: Campaign.title,
            images: [`/api/image?id=${id}`],
        },
        other: {
            ...fcMetadata,
        },
        metadataBase: new URL(process.env['HOST'] || '')
    }
}


export default async function Page({params}: { params: {id: string}}) {
    const Campaign = await getCampaign(params.id);

    return(
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                    <h1 className="text-lg sm:text-2xl font-bold mb-2">
                        Campaign 
                        {JSON.stringify(Campaign)}
                    </h1>
                    <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {redirect(`/referrals/create_referral/${params.id}`)}}
                        >
                        Create Referral
                    </button>
                </main>
            </div>
        </>
    );

}