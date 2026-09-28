import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Determine mode based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';

// Select appropriate key based on environment
const secretKey = isProduction
    ? process.env.STRIPE_SECRET_KEY_LIVE
    : (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY_LIVE);

if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY is missing in environment variables!');
    console.error('   Make sure STRIPE_SECRET_KEY_TEST or STRIPE_SECRET_KEY_LIVE is set.');
} else {
    const isLiveKey = secretKey.startsWith('sk_live');
    console.log('------------------------------------------------');
    console.log(`🔌 Stripe Mode: ${isLiveKey ? '🔴 LIVE' : '🔵 TEST'}`);
    console.log(`🔌 NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`🔌 Key used: ${secretKey.substring(0, 12)}...`);
    console.log('------------------------------------------------');
}

export const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16'
});