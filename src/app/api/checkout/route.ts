import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
})

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        let defaultCustomerId = profile?.stripe_customer_id

        const priceId = process.env.STRIPE_PRICE_ID

        if (!priceId) {
            console.error('Missing STRIPE_PRICE_ID inside .env')
            return new NextResponse('Server configuration error', { status: 500 })
        }

        const host = req.headers.get('host')
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
        const appUrl = `${protocol}://${host}`

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${appUrl}/dashboard/settings?success=true`,
            cancel_url: `${appUrl}/dashboard/settings?canceled=true`,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: defaultCustomerId ? undefined : user.email,
            customer: defaultCustomerId || undefined,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
            },
        })

        return NextResponse.redirect(stripeSession.url!, { status: 303 })
    } catch (error) {
        console.error('Error in checkout:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
