// This is a utility service that handles the actual API formatting and dispatch 
// for each of the major social platforms. 

export type PostingCreds = {
    platform: string
    accessToken: string
    secretToken: string | null
}

export async function postToX(creds: PostingCreds, text: string) {
    // Requires OAuth 2.0 User Access Token with tweet.write scope
    const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })

    if (!res.ok) {
        throw new Error(`X API Error: ${await res.text()}`)
    }
    const data = await res.json()
    return { success: true, url: `https://x.com/post/${data.data?.id || 'unknown'}` }
}

export async function postToLinkedIn(creds: PostingCreds, text: string) {
    // 1. Fetch user profile URN (Requires w_member_social scope)
    const meRes = await fetch('https://api.linkedin.com/v2/me', {
        headers: { 'Authorization': `Bearer ${creds.accessToken}` }
    })

    if (!meRes.ok) throw new Error(`LinkedIn Auth Error: ${await meRes.text()}`)
    const meData = await meRes.json()
    const authorUrn = `urn:li:person:${meData.id}`

    // 2. Publish post via UGC Posts API
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${creds.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        })
    })

    if (!res.ok) throw new Error(`LinkedIn API Error: ${await res.text()}`)
    return { success: true, url: 'https://linkedin.com/' }
}

export async function postToInstagram(creds: PostingCreds, text: string, mediaUrl?: string) {
    if (!mediaUrl) throw new Error('Instagram requires a media URL (image or video).')

    // 1. Get Facebook Pages managed by the user
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${creds.accessToken}`)
    if (!pagesRes.ok) throw new Error(`IG FB Pages Error: ${await pagesRes.text()}`)
    const pagesData = await pagesRes.json()
    const pageId = pagesData.data?.[0]?.id

    if (!pageId) throw new Error('No Facebook Page found for Instagram.')

    // 2. Get IG Business Account ID from Page
    const igRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${creds.accessToken}`)
    const igData = await igRes.json()
    const igUserId = igData.instagram_business_account?.id

    if (!igUserId) throw new Error('No Instagram Business Account linked to the Facebook Page.')

    // 3. Create Media Container (cURL hosted image/video)
    const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')
    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(mediaUrl)}&caption=${encodeURIComponent(text)}&access_token=${creds.accessToken}${isVideo ? '&media_type=VIDEO' : ''}`, { method: 'POST' })
    if (!containerRes.ok) throw new Error(`IG Media Container Error: ${await containerRes.text()}`)
    const containerData = await containerRes.json()

    // 4. Publish Media Container
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${containerData.id}&access_token=${creds.accessToken}`, { method: 'POST' })
    if (!publishRes.ok) throw new Error(`IG Publish Error: ${await publishRes.text()}`)
    const publishData = await publishRes.json()

    return { success: true, url: `https://instagram.com/p/${publishData.id}` }
}

export async function postToFacebook(creds: PostingCreds, text: string) {
    // Assumes creds.accessToken is a valid Page Access Token with pages_manage_posts scope
    const res = await fetch(`https://graph.facebook.com/v19.0/me/feed?access_token=${creds.accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    })

    if (!res.ok) throw new Error(`Facebook API Error: ${await res.text()}`)
    const data = await res.json()
    return { success: true, url: `https://facebook.com/${data.id}` }
}

export async function postToTikTok(creds: PostingCreds, text: string, mediaUrl?: string) {
    if (!mediaUrl) throw new Error('TikTok requires a video media URL.')

    // Requires OAuth 2.0 with video.publish scope
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_info: {
                title: text.substring(0, 2200), // TikTok title equivalent to caption
                privacy_level: 'MUTUAL_FOLLOW_FRIENDS',
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false
            },
            source_info: {
                source: 'PULL_FROM_URL',
                video_url: mediaUrl
            }
        })
    })

    if (!res.ok) throw new Error(`TikTok API Error: ${await res.text()}`)
    return { success: true, url: 'https://tiktok.com/' }
}

export async function postToReddit(creds: PostingCreds, text: string, subreddit: string, mediaUrl?: string) {
    if (!subreddit) throw new Error('Reddit requires a subreddit to post to.')

    const payload: any = {
        sr: subreddit,
        title: text.substring(0, 300), // Reddit title limit
        kind: mediaUrl ? 'link' : 'self',
    }

    if (mediaUrl) {
        payload.url = mediaUrl
    } else {
        payload.text = text
    }

    const res = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'SupaSocialPoster/1.0.0'
        },
        body: new URLSearchParams(payload)
    })

    if (!res.ok) throw new Error(`Reddit API Error: ${await res.text()}`)
    const data = await res.json()
    return { success: true, url: data.json?.data?.url || 'https://reddit.com' }
}

export async function postToYouTube(creds: PostingCreds, text: string, mediaUrl?: string) {
    if (!mediaUrl) throw new Error('YouTube requires a video media URL.')

    // Requires OAuth 2.0 with youtube.upload scope
    // Note: A real YouTube integration requires downloading the media to a buffer and sending it via multipart/form-data
    // This is a placeholder for the actual API call logic
    console.log(`[YouTube] Simulating upload using token ${creds.accessToken.slice(0, 5)}...`)
    await new Promise(r => setTimeout(r, 2000))

    return { success: true, url: 'https://youtube.com/watch?v=123' }
}

export async function dispatchPosts(activePlatforms: string[], keys: PostingCreds[], content: string, hashtags: string, mediaUrl?: string) {
    const fullText = hashtags ? `${content}\n\n${hashtags}` : content;
    const results = []

    for (const platform of activePlatforms) {
        // Find the key for this platform
        const platformIdMap: Record<string, string> = {
            'X (Twitter)': 'x',
            'LinkedIn': 'linkedin',
            'Instagram': 'instagram',
            'Facebook': 'facebook',
            'TikTok': 'tiktok',
            'Reddit': 'reddit',
            'YouTube': 'youtube'
        }

        const key = keys.find(k => k.platform === platformIdMap[platform])
        if (!key) continue

        let extraParams: Record<string, string> = {}
        if (key.secretToken) {
            try {
                extraParams = JSON.parse(key.secretToken)
            } catch (e) {
                // Ignore parse errors
            }
        }

        try {
            if (platform === 'X (Twitter)') await postToX(key, fullText)
            if (platform === 'LinkedIn') await postToLinkedIn(key, fullText)
            if (platform === 'Instagram') await postToInstagram(key, fullText, mediaUrl)
            if (platform === 'Facebook') await postToFacebook(key, fullText)
            if (platform === 'TikTok') await postToTikTok(key, fullText, mediaUrl)
            if (platform === 'Reddit') await postToReddit(key, fullText, extraParams.subreddit || 'test', mediaUrl)
            if (platform === 'YouTube') await postToYouTube(key, fullText, mediaUrl)

            results.push(platform)
        } catch (error) {
            console.error(`Failed to post to ${platform}:`, error)
        }
    }

    return results
}
