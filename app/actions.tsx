"use server";

import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import {Campaign, Campaign_EXPIRY, REFERRAL_EXPIRY, Referral} from "./types";
import {redirect} from "next/navigation";

export async function saveCampaign(campaign: Campaign) {
  await kv.hset(`campaign:${campaign.id}`, campaign);
  await kv.expire(`campaign:${campaign.id}`, Campaign_EXPIRY);
  await kv.zadd("campaigns_by_date", {
    score: Number(campaign.created_at),
    member: campaign.id,
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaign.id}`);
}

export async function clickReferral(referral: Referral, fid: string) {
  await kv.sadd(`campaign:${referral.campaign_id}:clicked`, fid);

  let campaign: Campaign | null = await kv.hgetall(`campaign:${referral.campaign_id}`);
  if (!campaign) {
    throw new Error("Campaign not found");
  }
  redirect(campaign.redirect_url);
}

export async function redirectToCampaigns() {
  redirect("/campaigns");
}

export async function saveReferral(referral: Referral) {
  await kv.hset(`referral:${referral.id}`, referral);
  await kv.expire(`referral:${referral.id}`, REFERRAL_EXPIRY);
  await kv.sadd(`campaign:${referral.campaign_id}:referrals`, referral.id);

  revalidatePath("/referrals");
  redirect(`/referrals/${referral.id}`);
}


export async function redirectToReferrals() {
  redirect("/referrals");
}
export async function redirectToReferral(referralId: string) {
  redirect(`/referrals/${referralId}`);
}