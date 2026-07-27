const crypto = require('crypto');

class MomoService {
  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE;
    this.accessKey = process.env.MOMO_ACCESS_KEY;
    this.secretKey = process.env.MOMO_SECRET_KEY;
    this.apiEndpoint = process.env.MOMO_API_ENDPOINT;
  }

  async createPaymentLink(orderId, amount, orderInfo, redirectUrl, ipnUrl, requestType = "captureWallet") {
    const requestId = this.partnerCode + new Date().getTime();
    const extraData = ""; // pass empty string if no extra data

    // String for generating signature
    const rawSignature = "accessKey=" + this.accessKey +
      "&amount=" + amount +
      "&extraData=" + extraData +
      "&ipnUrl=" + ipnUrl +
      "&orderId=" + orderId +
      "&orderInfo=" + orderInfo +
      "&partnerCode=" + this.partnerCode +
      "&redirectUrl=" + redirectUrl +
      "&requestId=" + requestId +
      "&requestType=" + requestType;

    // Create HMAC SHA256 signature
    const signature = crypto.createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      amount: Number(amount),
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: 'vi'
    });

    const response = await fetch(`${this.apiEndpoint}/v2/gateway/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    });

    return await response.json();
  }

  verifySignature(data) {
    // rawSignature order matters according to Momo docs
    const rawSignature = "accessKey=" + this.accessKey +
      "&amount=" + data.amount +
      "&extraData=" + data.extraData +
      "&message=" + data.message +
      "&orderId=" + data.orderId +
      "&orderInfo=" + data.orderInfo +
      "&orderType=" + data.orderType +
      "&partnerCode=" + data.partnerCode +
      "&payType=" + data.payType +
      "&requestId=" + data.requestId +
      "&responseTime=" + data.responseTime +
      "&resultCode=" + data.resultCode +
      "&transId=" + data.transId;

    const signature = crypto.createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    return signature === data.signature;
  }
}

module.exports = new MomoService();
