export type Currency = "ETH" | "USDC"

export type Campaign = {
  id: string;
  created_at: number;
  title: string;
  image_url: string;
  button_title: string;
  redirect_url: string;
  max_referrals_per_referrer: number;
  current_pool_size: number;
  cpc: number;
  denomination_currency: Currency;
};

export const Campaign_EXPIRY = 60 * 60 * 24 * 180; // Expire Campaigns after 3 months

export type Referral = {
  id: string;
  created_at: number;
  campaign_id: string;
  referrer_fid: number;
};

export const REFERRAL_EXPIRY = 60 * 60 * 24 * 180; // Expire Campaigns after 3 months
