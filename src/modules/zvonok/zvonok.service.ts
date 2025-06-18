import { Injectable } from '@nestjs/common';
import axios from 'axios'
import * as process from "node:process";
import * as qs from "qs";

@Injectable()
export class ZvonokService {

  async sendCall(phone: string): Promise<string> {
    const publicKey = process.env.ZVONOK_PUBLIC_KEY;
    const campaignId = process.env.ZVONOK_CAMPAIGN_ID;

    const data = {
      public_key: publicKey,
      campaign_id: campaignId,
      phone
    }

    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
    }

    const response = await axios.post('https://zvonok.com/manager/cabapi_external/api/v1/phones/flashcall/', qs.stringify(data), { headers });

    if (response.status !== 200) {
      throw new Error(`Ошибка Zvonok: ${response.status || 'Неизвестная ошибка'}`);
    }

    const code = response.data.data?.pincode;
    if (!code) {
      throw new Error(`Zvonok не вернул код`);
    }

    return code.toString();

  }

}
