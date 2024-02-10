"use server";

import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import {Campaign, Campaign_EXPIRY, REFERRAL_EXPIRY, Referral, Currency} from "./types";
import {redirect} from "next/navigation";

const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7;

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

export async function clickReferral(referral: Referral, fid: number) {
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

export async function getCampaigns() {
  try {
      let CampaignIds = await kv.zrange("campaigns_by_date", Date.now(), Date.now() - SEVEN_DAYS_IN_MS, {byScore: true, rev: true, count: 100, offset: 0});

      if (!CampaignIds.length) {
          return [];
      }

      let multi = kv.multi();
      CampaignIds.forEach((id) => {
          multi.hgetall(`campaign:${id}`);
      });

      let items: Campaign[] = await multi.exec();
      return items.map((item) => {
          return {...item};
      });
  } catch (error) {
      console.error(error);
      return [];
  }
}

export async function getReferral(id: string): Promise<Referral> {
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

export async function getCampaign(id: string): Promise<Campaign> {
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