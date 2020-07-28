import React from 'react'
import { paths } from './paths'
import Link from 'next/link'

export const core = {
  About: `About`,
  anonymous: `anonymous`,
  Cancel: `Cancel`,
  Checkout: `Checkout`,
  clips: `clips`,
  Clips: `Clips`,
  complete: `complete`,
  confirmed: `confirmed`,
  Contact: `Contact`,
  ContactSupport: () => (<span>If it still doesn't appear, please email <a href={paths.web.support_podverse_fm}>{core.SupportEmail}</a> for help.</span>),
  ContentMayBeNSFW: `content may not be safe for your work!`,
  CopyLinkToProfile: `Copy Link to your Profile`,
  Delete: `Delete`,
  DeleteAccount: `Delete Account`,
  Download: `Download`,
  Email: `Email`,
  EmailSending: `Email sending... `,
  EmailSent: `Email Sent! Please check your inbox.`,
  Episodes: `Episodes`,
  FAQ: `FAQ`,
  FromThisEpisode: `From this episode`,
  FromThisPodcast: `From this podcast`,
  GetItOnGooglePlay: `Get it on Google Play`,
  IHaveTheApp: `I have the app`,
  Login:  `Login`,
  LoginToViewYour: (itemType) => `Login to view your ${itemType}`,
  Logout: `Log out`,
  MakeProfilePublic: (instance) => (<p>Visit the <Link as={ paths.web.settings } href = { paths.web.settings } > <a onClick={ instance.linkClick }> Settings page </a></Link> to make your profile public </p>),
  MyClips: `My Clips`,
  MyPlaylists: `My Playlists`,
  MyPodcasts: `My Podcasts`,
  MyProfile: `My Profile`,
  Name: `Name`,
  noResultsMessage: (itemType, extraText?) => `No ${itemType}${extraText ? ` ${extraText} ` : ''} found.`,
  NSFWConfirmPopup: `NSFW Confirm Popup`,
  NSFWModeOn: `NSFW mode on`,
  OpenInTheApp: `Open in the app`,
  playlistOnPodverse: ` - playlist on Podverse `,
  playlists: `playlists`,
  Playlists: `Playlists`,
  PleaseCheckInbox: `If it does not appear in the next 5 minutes, please check your inbox's Spam or Promotions folders.`,
  PleaseVerifyEmail: `Please verify your email address to login.`,
  podcasts: `podcasts`,
  Podcasts: `Podcasts`,
  Premium: `Premium`,
  PremiumFreeTrial: `Premium (Free Trial)`,
  PremiumMembershipRequired: `Premium Membership Required`,
  Private: `Private`,
  Profiles: `Profiles`,
  Public: `Public`,
  RatingsProvidedByPodcasters: `Ratings are provided by the podcasters themselves,`,
  RefreshToHideNSFW: `Refresh your browser to hide NSFW content`,
  RefreshToIncludeNSFW: `Refresh your browser to include NSFW content`,
  Renew: `Renew`,
  RequestAPodcast: `Request a podcast`,
  Save: `Save`,
  SearchError: `Search failed. Please check your internet connection and try again later.`,
  SendVerificationEmail: `send verification email`,
  Settings: `Settings`,
  SFWModeOn: `SFW mode on`,
  SharableProfileLink: `Sharable Profile Link`,
  Submit: `Submit`,
  SupportEmail: `support@podverse.fm`,
  Terms: `Terms`,
  TryPremium1Year: () => (<p style = {{ textAlign: 'center' }}> Try premium free for 1 year! < br /> $10 per year after that </p>),
  TurnOnDark: `Turn on dark mode`,
  TurnOnLight: `Turn on light mode`,
  untitledClip: `untitled clip`,
  untitledPlaylist: `untitled playist`,
  untitledPodcast: `untitled podcast`,
  Update: `Update`,
  YourFreeTrialHasEnded: (renewLink) => `Your free trial has ended. ${renewLink} to continue using premium features.`,
  YourFreeTrialWillEndSoon: (renewLink) => `Your free trial will end soon. ${renewLink} to continue using premium features.`,
  YourMembershipHasExpired: (renewLink) => `Your membership has expired. ${renewLink} to continue using premium features.`,
  YourMembershipWillExpireSoon: (renewLink) => `Your membership will expire soon. ${renewLink} to continue using premium features.`
}
