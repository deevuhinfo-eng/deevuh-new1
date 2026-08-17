import crypto from 'crypto';

export function payuConfig() {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_SALT;
  const env = process.env.PAYU_ENV || 'test';
  if (!key || !salt) throw new Error('PayU keys not configured (PAYU_MERCHANT_KEY / PAYU_SALT)');
  return {
    key,
    salt,
    endpoint: env === 'live' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment',
  };
}

export function payuEndpoint() {
  return payuConfig().endpoint;
}

// Request hash: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
export function generatePayuHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  salt: string;
}): string {
  const { key, txnid, amount, productinfo, firstname, email, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '', salt } = params;
  const str = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash('sha512').update(str).digest('hex');
}

// Response verify hash: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
export function verifyPayuHash(params: {
  salt: string;
  status: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
}): string {
  const { salt, status, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '', email, firstname, productinfo, amount, txnid, key } = params;
  const str = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  return crypto.createHash('sha512').update(str).digest('hex');
}

// PayU expects amount in rupees as string (e.g. "1899.00")
export function formatPayuAmount(amount: number): string {
  return amount.toFixed(2);
}
