import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-01-28.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

export async function POST(req: Request) {
    try {
        // We must use the service role key to bypass RLS when updating the DB
        // because the webhook comes directly from Stripe, not an authenticated user.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
            process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
        )

        const body = await req.text()
        const signature = req.headers.get('stripe-signature') as string

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`)
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
        }

        const session = event.data.object as Stripe.Checkout.Session
        const subscription = event.data.object as Stripe.Subscription

        if (event.type === 'checkout.session.completed') {
            const userId = session.metadata?.userId
            if (userId) {
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                        plan: 'pro'
                    })
                    .eq('id', userId)
            }
        }

        if (event.type === 'customer.subscription.updated') {
            const status = subscription.status
            if (status !== 'active') {
                await supabaseAdmin
                    .from('profiles')
                    .update({ plan: 'free' })
                    .eq('stripe_subscription_id', subscription.id)
            } else {
                await supabaseAdmin
                    .from('profiles')
                    .update({ plan: 'pro' })
                    .eq('stripe_subscription_id', subscription.id)
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            await supabaseAdmin
                .from('profiles')
                .update({
                    plan: 'free',
                    stripe_subscription_id: null
                })
                .eq('stripe_subscription_id', subscription.id)
        }

        return new NextResponse('OK', { status: 200 })
    } catch (error) {
        console.error('Error handling webhook', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
