import type { NextApiRequest, NextApiResponse } from 'next';
import {Campaign, Campaign_EXPIRY, Referral} from "@/app/types";
import {kv} from "@vercel/kv";
import {getSSLHubRpcClient, Message} from "@farcaster/hub-nodejs";
import {redirectToReferral, saveReferral} from "@/app/actions";

const HUB_URL = process.env['HUB_URL']
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Process the vote
        // For example, let's assume you receive an option in the body
        try {
            const campaignId = req.query['id']
            if (!campaignId) {
                return res.status(400).send('Missing Campaign ID');
            }
            if(typeof campaignId !== 'string') {
                return res.status(400).send('Malformmated Campaign ID');
             }

            let validatedMessage : Message | undefined = undefined;
            try {
                const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
                const result = await client?.validateMessage(frameMessage);
                if (result && result.isOk() && result.value.valid) {
                    validatedMessage = result.value.message;
                }

                // Also validate the frame url matches the expected url
                let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
                const urlString = Buffer.from(urlBuffer).toString('utf-8');
                if (validatedMessage && !urlString.startsWith(process.env['HOST'] || '')) {
                    return res.status(400).send(`Invalid frame url: ${urlBuffer}`);
                }
            } catch (e)  {
                return res.status(400).send(`Failed to validate message: ${e}`);
            }

            let buttonId = 0, fid = 0;
            // If HUB_URL is not provided, don't validate and fall back to untrusted data
            if (client) {
                buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
                fid = validatedMessage?.data?.fid || 0;
            } else {
                buttonId = req.body?.untrustedData?.buttonIndex || 0;
                fid = req.body?.untrustedData?.fid || 0;
            }

            let Campaign: Campaign | null = await kv.hgetall(`campaign:${campaignId}`);
            if (!Campaign) {
                return res.status(400).send('Could not find Campaign ID');
            }
            const imageUrl = `${process.env['HOST']}/api/images/referral_create?id=${Campaign.id}&date=${Date.now()}${ fid > 0 ? `&fid=${fid}` : '' }`;

            if (fid <= 0 || buttonId <= 0) {
                // Return an HTML response
                let create_referral_url = `${process.env['HOST']}/api/referral_create?id=${Campaign.id}`
                res.setHeader('Content-Type', 'text/html');
                res.status(200).send(`
                <!DOCTYPE html>
                <html>
                    <head>
                    <title>Referral Created</title>
                    <meta property="og:title" content="Vote Recorded">
                    <meta property="og:image" content="${imageUrl}">
                    <meta name="fc:frame" content="vNext">
                    <meta name="fc:frame:image" content="${imageUrl}">
                    <meta name="fc:frame:post_url" content="${create_referral_url}">
                    <meta name="fc:frame:button:1" content="Create Referral">
                    </head>
                    <body>
                    <a href="${create_referral_url}">Create Referral</a>
                    </body>
                </html>
                `);
            }

            var referral: Referral | null = await kv.hgetall(`referral:${campaignId}-${fid}`)
            let buttonText = "View your Referral"
            // Referral already exists
            if (!!referral || referral === null) {
                referral = {
                    id: `${campaignId}-${fid}`,
                    campaign_id: campaignId,
                    referrer_fid: fid,
                    created_at: Date.now()
                }
                await saveReferral(referral)
            }
            let see_referral_url = `${process.env['HOST']}/referrals/${referral.id}`

            // Return an HTML response
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Referral Created</title>
          <meta property="og:title" content="Referral Created">
          <meta property="og:image" content="${imageUrl}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${imageUrl}">
          <meta name="fc:frame:post_url" content="${see_referral_url}">
          <meta name="fc:frame:button:1" content="${buttonText}">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="${see_referral_url}">
        </head>
        <body>
            <a href="${see_referral_url}">${buttonText}</a>
        </body>
      </html>
    `);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
