'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Get user profile to check plan & limits
    const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

    const plan = profile?.plan || 'free'
    const isPro = plan === 'pro'

    if (!isPro) {
        // Check their monthly usage
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth)

        if ((count || 0) >= 1) {
            redirect('/dashboard/settings?upgrade=true')
        }
    }

    const content = formData.get('content') as string
    const hashtags = formData.get('hashtags') as string

    // Extract platforms selected
    const platforms = []
    if (formData.get('platform_x') === 'on') platforms.push('X (Twitter)')
    if (formData.get('platform_linkedin') === 'on') platforms.push('LinkedIn')
    if (formData.get('platform_instagram') === 'on') platforms.push('Instagram')
    if (formData.get('platform_facebook') === 'on') platforms.push('Facebook')
    if (formData.get('platform_tiktok') === 'on') platforms.push('TikTok')
    if (formData.get('platform_reddit') === 'on') platforms.push('Reddit')
    if (formData.get('platform_youtube') === 'on') platforms.push('YouTube')

    if (!content) {
        throw new Error('Content is required')
    }

    // Fetch keys from DB
    const { data: keys } = await supabase
        .from('platform_keys')
        .select('*')
        .eq('user_id', user.id)

    // Form the posting credentials array
    const creds = (keys || []).map(k => ({
        platform: k.platform,
        accessToken: k.access_token,
        secretToken: k.secret_token
    }))

    // Dispatch posts
    console.log('Dispatching posts to:', platforms)
    const { dispatchPosts } = await import('@/utils/social')
    const successfulPlatforms = await dispatchPosts(platforms, creds, content, hashtags)

    const { error } = await supabase
        .from('posts')
        .insert({
            user_id: user.id,
            content,
            hashtags,
            platforms_posted_to: platforms,
        })

    if (error) {
        console.error('Error saving post:', error)
        throw new Error('Failed to save post')
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
