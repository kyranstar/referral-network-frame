import type { NextApiRequest, NextApiResponse } from 'next';
import {Campaign, Campaign_EXPIRY} from "@/app/types";
import {kv} from "@vercel/kv";
import {getSSLHubRpcClient, Message} from "@farcaster/hub-nodejs";
import {redirectToReferral, getReferral, getCampaign, clickReferral} from "@/app/actions";

const HUB_URL = process.env['HUB_URL']
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Process the vote
        // For example, let's assume you receive an option in the body
        try {
            const referralId = req.query['referral_id']
            if (!referralId) {
                return res.status(400).send('Missing Referral ID');
            }
            if (typeof referralId !== 'string') {
                return res.status(400).send('Malformmated Referral ID');
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
            // TODO should validate here for security?
            if (client) {
                buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
                fid = validatedMessage?.data?.fid || 0;
            } else {
                buttonId = req.body?.untrustedData?.buttonIndex || 0;
                fid = req.body?.untrustedData?.fid || 0;
            }
            const referral = await getReferral(referralId);
            const campaign = await getCampaign(referral.campaign_id)

            const imageUrl = `${process.env['HOST']}/api/images/refer?id=${referralId}&date=${Date.now()}${ fid > 0 ? `&fid=${fid}` : '' }`;

            // Clicked create Campaign
            if (fid <= 0 || buttonId <= 0) {
                res.setHeader('Content-Type', 'text/html');
                res.status(200).send(`
        <!DOCTYPE html>
        <html>
            <head>
            <title>Vote Recorded</title>
            <meta property="og:title" content="Vote Recorded">
            <meta property="og:image" content="${imageUrl}">
            <meta name="fc:frame" content="vNext">
            <meta name="fc:frame:image" content="${imageUrl}">
            <meta name="fc:frame:post_url" content="${process.env['HOST']}/api/vote?id=${campaign.id}">
            <meta name="fc:frame:button:1" content="${campaign.button_title}">
            <meta name="fc:frame:button:2" content="Visit Link">
            <meta name="fc:frame:button:2:action" content="link">
            <meta name="fc:frame:button:2:target" content="${campaign.redirect_url}">
            </head>
            <body>
            <p>Referral view</p>
            </body>
        </html>
        `);
        return;
            }

            await clickReferral(referral, fid);

            
            // Return an HTML response
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Recorded</title>
          <meta property="og:title" content="Vote Recorded">
          <meta property="og:image" content="${imageUrl}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${imageUrl}">
          <meta name="fc:frame:post_url" content="${process.env['HOST']}/api/vote">
          <meta name="fc:frame:button:1" content="${campaign.button_title}">
          <meta name="fc:frame:button:2" content="Visit Link">
          <meta name="fc:frame:button:2:action" content="link">
          <meta name="fc:frame:button:2:target" content="${campaign.redirect_url}">
        </head>
        <body>
          <p>Referral clicked!</p>
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
