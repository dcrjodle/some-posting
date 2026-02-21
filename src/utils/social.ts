// This is a utility service that handles the actual API formatting and dispatch 
// for each of the major social platforms. 
// Note: Each platform requires specific SDKs or explicit REST API structures, 
// so this acts as the translation layer.

export type PostingCreds = {
    platform: string
    accessToken: string
    secretToken: string | null
}

export async function postToX(creds: PostingCreds, text: string) {
    // Uses Twitter API v2
    console.log(`[X] Simulating post using token ${creds.accessToken.slice(0, 5)}...`)
    // Normally you'd use twitter-api-v2 or native fetch:
    // const res = await fetch('https://api.twitter.com/2/tweets', { ... })
    await new Promise(r => setTimeout(r, 800))
    return { success: true, url: 'https://x.com/post/123' }
}

export async function postToLinkedIn(creds: PostingCreds, text: string) {
    console.log(`[LinkedIn] Simulating post using token ${creds.accessToken.slice(0, 5)}...`)
    await new Promise(r => setTimeout(r, 1000))
    return { success: true, url: 'https://linkedin.com/post/123' }
}

export async function postToInstagram(creds: PostingCreds, text: string) {
    // Requires an image for regular IG posts
    console.log(`[IG] Simulating post using token ${creds.accessToken.slice(0, 5)}...`)
    await new Promise(r => setTimeout(r, 1200))
    return { success: true, url: 'https://instagram.com/p/123' }
}

export async function postToFacebook(creds: PostingCreds, text: string) {
    console.log(`[FB] Simulating post using token ${creds.accessToken.slice(0, 5)}...`)
    await new Promise(r => setTimeout(r, 900))
    return { success: true, url: 'https://facebook.com/post/123' }
}

export async function postToTikTok(creds: PostingCreds, text: string) {
    // Direct posting explicitly requires video
    console.log(`[TikTok] Simulating post using token ${creds.accessToken.slice(0, 5)}...`)
    await new Promise(r => setTimeout(r, 1500))
    return { success: true, url: 'https://tiktok.com/@user/video/123' }
}

export async function dispatchPosts(activePlatforms: string[], keys: PostingCreds[], content: string, hashtags: string) {
    const fullText = hashtags ? `${content}\n\n${hashtags}` : content;
    const results = []

    for (const platform of activePlatforms) {
        // Find the key for this platform
        const platformIdMap: Record<string, string> = {
            'X (Twitter)': 'x',
            'LinkedIn': 'linkedin',
            'Instagram': 'instagram',
            'Facebook': 'facebook',
            'TikTok': 'tiktok'
        }

        const key = keys.find(k => k.platform === platformIdMap[platform])
        if (!key) continue

        try {
            if (platform === 'X (Twitter)') await postToX(key, fullText)
            if (platform === 'LinkedIn') await postToLinkedIn(key, fullText)
            if (platform === 'Instagram') await postToInstagram(key, fullText)
            if (platform === 'Facebook') await postToFacebook(key, fullText)
            if (platform === 'TikTok') await postToTikTok(key, fullText)
            results.push(platform)
        } catch (error) {
            console.error(`Failed to post to ${platform}:`, error)
        }
    }

    return results
}
