import {getCampaign} from "@/app/actions";
import {ReferralCreateButton} from "@/app/form";

export default async function Page({campaign_id, referrer_fid}: {campaign_id: string, referrer_fid: number}) {
    const Campaign = await getCampaign(campaign_id);

    return(
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                    <h1 className="text-lg sm:text-2xl font-bold mb-2">
                        Campaign 
                    </h1>
                    <p className="text-md sm:text-xl mx-4">{JSON.stringify(Campaign)}</p>

                </main>
            </div>
        </>
    );

}