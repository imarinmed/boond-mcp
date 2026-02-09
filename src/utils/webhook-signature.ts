import { createHmac } from 'crypto';

/**
 * Generate HMAC signature for webhook payload
 * Uses SHA-256 with the webhook's secret key
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verify webhook signature from received request
 * @param signature - The signature from the X-Webhook-Signature header
 * @param payload - The raw request body as string
 * @param secret - The webhook's secret key
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(signature: string, payload: string, secret: string): boolean {
  try {
    const expectedSignature = generateWebhookSignature(payload, secret);
    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return sigBuffer.equals(expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate timestamp-based signature for replay attack prevention
 */
export function generateWebhookSignatureWithTimestamp(
  payload: string,
  secret: string,
  timestamp: number
): string {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},sha256=${signature}`;
}

/**
 * Verify webhook signature with timestamp
 * @param signature - Format: "t=1234567890,sha256=abc123..."
 * @param payload - Raw request body
 * @param secret - Webhook secret
 * @param toleranceSeconds - How old the timestamp can be (default: 300 = 5 minutes)
 */
export function verifyWebhookSignatureWithTimestamp(
  signature: string,
  payload: string,
  secret: string,
  toleranceSeconds: number = 300
): boolean {
  try {
    // Parse signature
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const sigPart = parts.find(p => p.startsWith('sha256='));
    
    if (!timestampPart || !sigPart) {
      return false;
    }
    
    const timestamp = parseInt(timestampPart.replace('t=', ''), 10);
    const receivedSig = sigPart.replace('sha256=', '');
    
    // Check timestamp tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return false; // Timestamp too old or in future
    }
    
    // Reconstruct expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = createHmac('sha256', secret).update(signedPayload).digest('hex');
    
    // Constant-time comparison
    const sigBuffer = Buffer.from(receivedSig);
    const expectedBuffer = Buffer.from(expectedSig);
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return sigBuffer.equals(expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Create webhook payload with signature headers
 */
export function createWebhookPayload(
  event: string,
  data: unknown,
  secret: string
): { payload: string; headers: Record<string, string> } {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    event,
    timestamp,
    data,
  });
  
  const signature = generateWebhookSignatureWithTimestamp(payload, secret, timestamp);
  
  return {
    payload,
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': event,
      'X-Webhook-Timestamp': timestamp.toString(),
    },
  };
}
