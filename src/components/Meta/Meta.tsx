import Head from 'next/head'
import { PV } from '~/resources'
import { seoMetaDescription, seoMetaTitle } from '~/lib/utility/metaTags'
import { Config } from '~/resources/Config'

type Props = {
  description?: string
  iphoneCustomScheme?: string
  isVideo?: boolean
  ogDescription?: string
  ogImage?: string
  ogImageAlt?: string
  ogTitle?: string
  ogType?: string
  ogUrl?: string
  robotsNoIndex?: boolean
  title?: string
  twitterDescription?: string
  twitterImage?: string
  twitterImageAlt?: string
  twitterPlayerUrl?: string
  twitterTitle?: string
}

export const Meta = ({
  description = '',
  iphoneCustomScheme = '',
  isVideo = false,
  ogDescription = '',
  ogImage = '',
  ogImageAlt = '',
  ogTitle = '',
  ogType = '',
  ogUrl = '',
  robotsNoIndex = false,
  title = '',
  twitterDescription = '',
  twitterImage = '',
  twitterImageAlt = '',
  twitterPlayerUrl = '',
  twitterTitle = ''
}: Props) => {
  // Twitter images are cached by URL, and do not update. To make sure the latest image is used,
  // we're setting the cacheBustUrlParam as a url parameter in the meta tag.
  // const cacheBustUrlParam = '?cacheBust=' + new Date().toISOString().slice(0, 10) + '-' + new Date().getHours()
  // NOTE: disabling cacheBust as it appears to have been breaking twitter image previews

  const ogImg = !ogImage ? PV.Config.metaDefaultImageUrl1200x630 : ogImage
  const twitterImg = !twitterImage ? PV.Config.metaDefaultImageUrl1200x630 : twitterImage // + cacheBustUrlParam

  const seoTitle = seoMetaTitle(title)
  const seoOGTitle = seoMetaTitle(ogTitle)
  const seoTwitterTitle = seoMetaTitle(twitterTitle)

  const seoDescription = seoMetaDescription(description)
  const seoOGDescription = seoMetaDescription(ogDescription)
  const seoTwitterDescription = seoMetaDescription(twitterDescription)

  return (
    <Head>
      <title>{seoTitle}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name='no-email-collection' content={PV.RoutePaths.web.unspam} />
      {robotsNoIndex && <meta name='robots' content='noindex' />}

      {/* Favicons - updated to use bubbl-icon */}
      <link rel='apple-touch-icon' sizes='180x180' href='/images/bubbl-icon.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/images/bubbl-icon.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/images/bubbl-icon.png' />
      <link rel='manifest' href='/site.webmanifest' />
      {/* Remove safari-pinned-tab if you don't have an SVG version */}
      {/* <link rel='mask-icon' href='/images/safari-pinned-tab.svg' color='#7FB5AA' /> */}
      <meta name='msapplication-TileColor' content='#04081A' />
      <meta name='theme-color' content='#04081A' />

      <meta name='description' content={seoDescription} />

      {/* Open Graph meta tags - updated for Bubbl */}
      <meta property='og:title' content={seoOGTitle} />
      <meta property='og:type' content={ogType} />
      <meta property='og:image' content={ogImg} />
      <meta property='og:image:alt' content={ogImageAlt || 'Bubbl FM logo'} />
      <meta property='og:image:secure_url' content={ogImg} />
      <meta property='og:description' content={seoOGDescription} />
      <meta property='og:site_name' content={Config.SITE_NAME} />
      <meta property='og:url' content={ogUrl} />
      {/* Remove or update FB app ID if needed */}
      {/* <meta property='fb:app_id' content='300336890140007' /> */}

      {/* Twitter global meta tags - updated for Bubbl */}
      {twitterPlayerUrl && (
        <>
          <meta name='twitter:card' content='player' />
          <meta name='twitter:player' content={twitterPlayerUrl} />
          <meta name='twitter:player:height' content={isVideo ? '675' : '166'} />
          <meta name='twitter:player:width' content={isVideo ? '1200' : '500'} />
        </>
      )}
      <meta name='twitter:site' content='@bubbl_fm' />  {/* Update with your Twitter handle */}
      {/* Remove or update Twitter IDs if needed */}
      {/* <meta name='twitter:site:id' content='2555941009' /> */}
      <meta name='twitter:creator' content='@bubbl_fm' />  {/* Update with your Twitter handle */}
      {/* <meta name='twitter:creator:id' content='2555941009' /> */}
      <meta name='twitter:app:name:iphone' content={Config.SITE_NAME} />
      {/* Update or remove app IDs if needed */}
      {/* <meta name='twitter:app:id:iphone' content='1390888454' /> */}
      {iphoneCustomScheme && <meta name='twitter:app:url:iphone' content={iphoneCustomScheme} />}

      {/* Twitter page-specific meta tags */}
      {!twitterPlayerUrl && <meta name='twitter:card' content='summary' />}
      <meta name='twitter:description' content={seoTwitterDescription} />
      <meta name='twitter:title' content={seoTwitterTitle} />
      <meta name='twitter:image' content={twitterImg} />
      <meta name='twitter:image:alt' content={twitterImageAlt || 'Bubbl FM logo'} />
    </Head>
  )
}
