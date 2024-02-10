import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import {Campaign} from "@/app/types";
import {kv} from "@vercel/kv";
import satori from "satori";
import { join } from 'path';
import * as fs from "fs";
import axios from 'axios';

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const CampaignId = req.query['id']
        // const fid = parseInt(req.query['fid']?.toString() || '')
        if (!CampaignId) {
            return res.status(400).send('Missing Campaign ID');
        }

        let campaign: Campaign | null = await kv.hgetall(`campaign:${CampaignId}`);

        if (!campaign) {
            return res.status(400).send('Missing Campaign ID');
        }

        const response = await axios.get(campaign.image_url,  { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, "utf-8")
        // Set the content type to PNG and send the response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'max-age=10');
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
}
