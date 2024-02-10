"use client";

import clsx from "clsx";
import {useOptimistic, useRef, useState, useTransition} from "react";
import {redirectToCampaigns, saveCampaign, voteCampaign, saveReferral} from "./actions";
import { v4 as uuidv4 } from "uuid";
import {Campaign, Referral, Currency} from "./types";
import {useRouter, useSearchParams} from "next/navigation";

type CampaignState = {
  newCampaign: Campaign;
  updatedCampaign?: Campaign;
  pending: boolean;
};


export function CampaignCreateForm() {
  let formRef = useRef<HTMLFormElement>(null);
  let [state, mutate] = useOptimistic(
      { pending: false },
      function createReducer(state, newCampaign: CampaignState) {
        if (newCampaign.newCampaign) {
          return {
            pending: newCampaign.pending,
          };
        } else {
          return {
            pending: newCampaign.pending,
          };
        }
      },
  );

  let CampaignStub = {
    id: uuidv4(),
    created_at: new Date().getTime(),
    title: "",
    image_url: "",
    button_title: "",
    redirect_url: "",
    max_referrals_per_referrer: 0,
    total_views: 0,
    referrals_ids: [],
    max_referrers: -1,
    cpc: 0.0001,
    denomination_currency: "USDC" as Currency,
    current_pool_size: 0,
  };
  let saveWithNewCampaign = saveCampaign.bind(null, CampaignStub);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let [isPending, startTransition] = useTransition();

  return (
      <>
        <div className="mx-8 w-full">
          <form
              className="relative my-8"
              ref={formRef}
              action={saveWithNewCampaign}
              onSubmit={(event) => {
                event.preventDefault();
                let formData = new FormData(event.currentTarget);
                let newCampaign = {
                  ...CampaignStub,
                  title: formData.get("title") as string,
                  image_url: formData.get("image_url") as string,
                  button_title: formData.get("button_title") as string,
                  redirect_url: formData.get("redirect_url") as string,
                  max_referrals_per_referrer: parseInt(formData.get("max_referrals_per_referrer") as string, 10),
                  max_referrers: parseInt(formData.get("max_referrers") as string, 10),
                  cpc: parseFloat(formData.get("cpc") as string),
                  denomination_currency: formData.get("denomination_currency") as Currency,   
                  current_pool_size: 0,
                };

                formRef.current?.reset();
                startTransition(async () => {
                  mutate({
                    newCampaign,
                    pending: true,
                  });

                  await saveCampaign(newCampaign);
                });
              }}
          >
            <input
                aria-label="Campaign Title"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="Title..."
                required
                type="text"
                name="title"
            />
            <input
                aria-label="Image URL"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="..."
                required
                type="text"
                name="image_url"
            />
            <input
                aria-label="Button Display Phrase"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="Check it out!"
                required
                type="text"
                name="button_title"
            />
            <input
                aria-label="Redirect URL"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="..."
                required
                type="text"
                name="redirect_url"
            />
            <input
                aria-label="Cost Per Click"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="..."
                required
                type="text"
                name="cpc"
            />
            <input
                aria-label="Denomination Currency"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="..."
                required
                type="text"
                name="denomination_currency"
            />
            <input
                aria-label="Max Referrals Per Referrer (Negative is uncapped)"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="-1"
                required
                type="text"
                name="max_referrals_per_referrer"
            />
            <input
                aria-label="Max Referrers (Negative is uncapped)"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="-1"
                required
                type="text"
                name="max_referrers"
            />
              <div className={"pt-2 flex justify-end"}>
                  <button
                      className={clsx(
                          "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                          state.pending && "bg-gray-700 cursor-not-allowed",
                      )}
                      type="submit"
                      disabled={state.pending}
                  >
                      Create
                  </button>
              </div>
          </form>
        </div>
          <div className="w-full">
          </div>
      </>
  );
}

function CampaignResults({Campaign} : {Campaign: Campaign}) {
    return (
        <div className="mb-4">
            <img src={`/api/image?id=${Campaign.id}&results=true&date=${Date.now()}`} alt='Campaign results'/>
        </div>
    );
}

type ReferralState = {
    newReferral: Referral;
    updatedReferral?: Referral;
    pending: boolean;
  };
  
  
  export function ReferralCreateForm() {
    let formRef = useRef<HTMLFormElement>(null);
    let [state, mutate] = useOptimistic(
        { pending: false },
        function createReducer(state, newReferral: ReferralState) {
          if (newReferral.newReferral) {
            return {
              pending: newReferral.pending,
            };
          } else {
            return {
              pending: newReferral.pending,
            };
          }
        },
    );
  
    let referralStub = {
      id: uuidv4(),
      created_at: new Date().getTime(),
      campaign_id: "",
      referrer_fid: "",
      total_referrals: 0,
    };
    let saveWithNewReferral = saveReferral.bind(null, referralStub);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let [isPending, startTransition] = useTransition();
  
    return (
        <>
          <div className="mx-8 w-full">
            <form
                className="relative my-8"
                ref={formRef}
                action={saveWithNewReferral}
                onSubmit={(event) => {
                  event.preventDefault();
                  let formData = new FormData(event.currentTarget);
                  let newReferral = {
                    ...referralStub,
                    campaign_id: "", // TODO get this from form creation parameters
                    referrer_fid: formData.get("referrer_fid") as string,
                  };
  
                  formRef.current?.reset();
                  startTransition(async () => {
                    mutate({
                      newReferral,
                      pending: true,
                    });
  
                    await saveReferral(newReferral, formData);
                  });
                }}
            >
              <input
                  aria-label="What's your FID?"
                  className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                  maxLength={150}
                  placeholder="..."
                  required
                  type="text"
                  name="referrer_fid"
              />
                <div className={"pt-2 flex justify-end"}>
                    <button
                        className={clsx(
                            "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                            state.pending && "bg-gray-700 cursor-not-allowed",
                        )}
                        type="submit"
                        disabled={state.pending}
                    >
                        Create
                    </button>
                </div>
            </form>
          </div>
            <div className="w-full">
            </div>
        </>
    );
  }

  function ReferralResults({Referral} : {Referral: Referral}) {
      return (
          <div className="mb-4">
              <img src={`/api/image?id=${Referral.id}&results=true&date=${Date.now()}`} alt='Referral results'/>
          </div>
      );
  }


export function CampaignVoteForm({Campaign, viewResults}: { Campaign: Campaign, viewResults?: boolean }) {
    const [selectedOption, setSelectedOption] = useState(-1);
    const router = useRouter();
    const searchParams = useSearchParams();
    viewResults = true;     // Only allow voting via the api
    let formRef = useRef<HTMLFormElement>(null);
    let voteOnCampaign = voteCampaign.bind(null, Campaign);
    let [isPending, startTransition] = useTransition();
    let [state, mutate] = useOptimistic(
        { showResults: viewResults },
        function createReducer({showResults}, state: CampaignState) {
            if (state.voted || viewResults) {
                return {
                    showResults: true,
                };
            } else {
                return {
                    showResults: false,
                };
            }
        },
    );

    const handleVote = (index: number) => {
        setSelectedOption(index)
    };

    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 m-4">
            <div className="font-bold text-xl mb-2">{Campaign.title}</div>
            <form
                className="relative my-8"
                ref={formRef}
                action={ () => voteOnCampaign(selectedOption)}
                onSubmit={(event) => {
                    event.preventDefault();
                    let formData = new FormData(event.currentTarget);
                    let newCampaign = {
                        ...Campaign,
                    };

                    // @ts-ignore
                    newCampaign[`votes${selectedOption}`] += 1;


                    formRef.current?.reset();
                    startTransition(async () => {
                        mutate({
                            newCampaign,
                            pending: false,
                            voted: true,
                        });

                        await redirectToCampaigns();
                        // await voteCampaign(newCampaign, selectedOption);
                    });
                }}
            >
                {state.showResults ? <CampaignResults Campaign={Campaign}/> : <CampaignOptions Campaign={Campaign} onChange={handleVote}/>}
                {state.showResults ? <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                    >Back</button> :
                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" + (selectedOption < 1 ? " cursor-not-allowed" : "")}
                        type="submit"
                        disabled={selectedOption < 1}
                    >
                        Vote
                    </button>
                }
            </form>
        </div>
);
}