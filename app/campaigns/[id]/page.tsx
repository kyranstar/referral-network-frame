import {kv} from "@vercel/kv";
import {Campaign} from "@/app/types";
import Head from "next/head";
import {Metadata, ResolvingMetadata} from "next";
import {redirect} from "next/navigation";
import {getCampaign} from "@/app/actions";

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