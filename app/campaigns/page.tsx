import {kv} from "@vercel/kv";
import {Campaign} from "@/app/types";
import Link from "next/link";
import {getCampaigns} from "@/app/actions";



export default async function Page() {
    const Campaigns = await getCampaigns();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                <h1 className="text-lg sm:text-2xl font-bold mb-2">
                    Created Campaigns
                </h1>
                <div className="flex-1 flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
                    {
                        Campaigns.map((Campaign) => {
                        // returns links to Campaign ids
                        return (<div key={Campaign.id}>
                            <a href={`/campaigns/${Campaign.id}`} className="underline">
                                <p className="text-md sm:text-xl mx-4">{Campaign.title}</p>
                            </a>
                        </div>)
                        })
                    }
                </div>
                <Link href="/">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Create Campaign
                    </button>
                </Link>
            </main>
        </div>
    );
}