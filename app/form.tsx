'use client';

import clsx from "clsx";
import {useOptimistic, useRef, useState, useTransition} from "react";
import {redirectToCampaigns, saveCampaign, saveReferral} from "./actions";
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
            <label>Campaign Title <input
                aria-label="Campaign Title"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={150}
                placeholder="My Referral Campaign"
                required
                type="text"
                name="title"
            />
            </label>
            <label>Image URL <input
                aria-label="Image URL"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={300}
                placeholder="https://example.com/image.png"
                required
                type="text"
                name="image_url"
            />
            </label>
            <label>Button Display Phrase <input
                aria-label="Button Display Phrase"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={50}
                placeholder="Check it out!"
                required
                type="text"
                name="button_title"
            />
            </label>
            <label>Redirect URL 
            <input
                aria-label="Redirect URL"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={300}
                required
                placeholder="https://example.com/"
                type="text"
                name="redirect_url"
            />
            </label>
            <label>Cost Per Click
            <input
                aria-label="Cost Per Click"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={100}
                placeholder="0.001"
                required
                type="text"
                name="cpc"
            />
            </label>
            <label>Denomination Currency
            <input
                aria-label="Denomination Currency"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={10}
                placeholder="ETH or USDC"
                required
                type="text"
                name="denomination_currency"
            />
            </label>
            <label>Max Referrals Per Referrer (Negative is uncapped)
            <input
                aria-label="Max Referrals Per Referrer (Negative is uncapped)"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                maxLength={10}
                required
                placeholder="-1"
                type="text"
                name="max_referrals_per_referrer"
            />
            </label>
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

type ReferralState = {
    newReferral: Referral;
    updatedReferral?: Referral;
    pending: boolean;
  };
  
  
  export function ReferralCreateButton({campaign_id, referrer_fid} : {campaign_id: string, referrer_fid: number}) {
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
      referrer_fid: 0,
    };
    let saveWithNewReferral = saveReferral.bind(null, referralStub);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let [isPending, startTransition] = useTransition();
  
    return (
        <>

                    <button
                        className={clsx(
                            "flex items-center p-1 justify-center px-20 h-15 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                            state.pending && "bg-gray-700 cursor-not-allowed",
                        )}
                        type="submit"
                        disabled={state.pending}
                        onClick={async () => {
                            let newReferral = {
                                ...referralStub,
                                campaign_id: campaign_id,
                                referrer_fid: referrer_fid,
                            };
                            startTransition(async () => {
                                mutate({
                                    newReferral,
                                    pending: true,
                                });
                                await saveReferral(newReferral);
                            });
                        }}
                    >
                        Create Referral
                    </button>
            <div className="w-full">
            </div>
        </>
    );
  }