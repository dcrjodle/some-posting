'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePlatformKeys(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const platform = formData.get('platform') as string
    const accessToken = formData.get('accessToken') as string

    if (!platform || !accessToken) {
        throw new Error('Missing required fields')
    }

    // Extract all other fields into a JSON string for secret_token
    const extraData: Record<string, string> = {}
    formData.forEach((value, key) => {
        // Skip default fields or empty values
        if (key !== 'platform' && key !== 'accessToken' && typeof value === 'string' && value.trim() !== '') {
            extraData[key] = value.trim()
        }
    })

    const secretToken = Object.keys(extraData).length > 0 ? JSON.stringify(extraData) : null;

    const { error } = await supabase
        .from('platform_keys')
        .upsert({
            user_id: user.id,
            platform,
            access_token: accessToken,
            secret_token: secretToken || null,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,platform'
        })

    if (error) {
        console.error('Error saving keys:', error)
        throw new Error('Failed to save keys')
    }

    revalidatePath('/dashboard/settings')
}
