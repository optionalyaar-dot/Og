import { Timestamp } from 'firebase/firestore';

export const OWNER_EMAIL = 'optionalyaar@gmail.com';
export const OFFICIAL_WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb9ts3f8vd1JGYu08v3k';
export const OFFICIAL_SUPPORT_PHONE = '+91 63595 73865';
export const COINS_PER_RUPEE = 10;
export const PLAYER_REFERRAL_BONUS_COINS = 2;
export const OWNER_DEFAULT_BONUS_CODE = 'OGBONUS10';
export const OWNER_DEFAULT_BONUS_COINS = 10;
export const PENDING_REFERRAL_STORAGE_KEY = 'og_pending_referral_code';

export function coinsToRupees(coins: number): string {
  const rupees = coins / COINS_PER_RUPEE;
  return Number.isInteger(rupees) ? `₹${rupees}` : `₹${rupees.toFixed(1)}`;
}

export const SCHEMA_LIMITS = {
  DISPLAY_NAME_MAX: 60,
  FF_IGN_MAX: 40,
  FF_UID_MAX: 30,
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  SCHEDULE_MAX: 80,
  STREAM_URL_MAX: 300,
  WINNER_SUMMARY_MAX: 500,
  ROOM_ID_MAX: 64,
  ROOM_PASSWORD_MAX: 64,
  INSTRUCTIONS_MAX: 300,
  DESTINATION_MAX: 160,
  UPI_ID_MAX: 100,
  IMAGE_DATA_MAX: 200000,
  IMPS_HOLDER_MAX: 80,
  IMPS_ACCOUNT_MAX: 30,
  IMPS_IFSC_MAX: 20,
  IMPS_BANK_MAX: 80,
  PAYMENT_NOTE_MAX: 200,
  UTR_REF_MAX: 60,
  ADMIN_NOTE_MAX: 200,
  HOW_TO_WORK_MAX: 1200,
  REFERRAL_CODE_MIN: 3,
  REFERRAL_CODE_MAX: 20,
  EVIDENCE_DATA_MAX: 650000,
  EVIDENCE_LINK_MAX: 300,
  REPORT_DESC_MAX: 600,
  BAN_REASON_MAX: 300,
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
} as const;

export type GameMode = 'Solo' | 'Duo' | 'Squad';
export type MapName = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Nexterra' | 'Clash Squad';
export type TournamentStatus = 'upcoming' | 'live' | 'completed';
export type WithdrawalMethod = 'UPI' | 'QR Code' | 'IMPS' | 'Redeem Code';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';
export type DepositMethod = 'UPI' | 'UPI ID' | 'QR Scan' | 'GPay / PhonePe' | 'Card / NetBanking';
export type DepositStatus = 'pending' | 'approved' | 'rejected';

export const HACK_TYPES = [
  'Aimbot / Headshot',
  'Wallhack / ESP',
  'Speed / Fly Hack',
  'Damage / Ammo Hack',
  'Teaming / Ghosting',
  'Other',
] as const;

export type HackType = (typeof HACK_TYPES)[number];
export type EvidenceType = 'image' | 'video' | 'none';
export type HackerReportStatus = 'pending' | 'confirmed_banned' | 'dismissed';

export interface HackerReport {
  id: string;
  reporterUid: string;
  reporterName: string;
  suspectUserId?: string;
  suspectIgn: string;
  suspectFfUid?: string;
  tournamentId?: string;
  tournamentTitle?: string;
  hackType: HackType;
  description?: string;
  evidenceType: EvidenceType;
  evidenceUrl?: string;
  evidenceLink?: string;
  status: HackerReportStatus;
  adminNote?: string;
  reviewedByUid?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BannedFfUidRecord {
  ffUid: string;
  suspectIgn: string;
  userId?: string;
  reason: string;
  reportId?: string;
  bannedByUid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  ffIgn?: string;
  ffUid?: string;
  photoUrl?: string;
  winningCoins: number;
  addedCoins?: number;
  bonusCoins: number;
  totalKills: number;
  matchesPlayed: number;
  notifyMatchStart: boolean;
  notifyRoomCredentials: boolean;
  referralCode?: string;
  referredByUid?: string;
  referredByCode?: string;
  referralCount?: number;
  referralEarningsCoins?: number;
  lastBonusCode?: string;
  lastJoinedTournamentId?: string;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: Timestamp;
  bannedByReportId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  ffIgn?: string;
  totalKills: number;
  matchesPlayed: number;
  totalWinningsCoins: number;
  isPublic: boolean;
  updatedAt: Timestamp;
}

export interface Tournament {
  id: string;
  title: string;
  gameMode: GameMode;
  mapName: MapName;
  scheduledAt: string;
  prizePool: number;
  perKill: number;
  entryFee: number;
  maxSpots: number;
  joinedCount: number;
  status: TournamentStatus;
  streamUrl?: string;
  winnerSummary?: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TournamentRoomSecret {
  tournamentId: string;
  roomId: string;
  roomPassword: string;
  instructions?: string;
  updatedAt: Timestamp;
}

export interface TournamentRegistration {
  tournamentId: string;
  userId: string;
  ffIgn: string;
  ffUid: string;
  slotNumber: number;
  kills: number;
  winnings: number;
  placement: number;
  joinedAt: Timestamp;
}

export interface UserMatchEntry {
  tournamentId: string;
  userId: string;
  ffIgn: string;
  ffUid: string;
  slotNumber: number;
  joinedAt: Timestamp;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amountInr: number;
  coins: number;
  method: DepositMethod;
  payerUpiId: string;
  proofImageUrl: string;
  utrRef?: string;
  status: DepositStatus;
  adminNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: WithdrawalMethod;
  destination: string;
  qrImageUrl?: string;
  impsAccountHolder?: string;
  impsAccountNumber?: string;
  impsIfsc?: string;
  impsBankName?: string;
  status: WithdrawalStatus;
  adminNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SiteSettings {
  announcementTitle: string;
  announcementSubtitle?: string;
  bannerImageUrl?: string;
  ownerUpiId?: string;
  ownerQrCodeUrl?: string;
  ownerPaymentNote?: string;
  howToWorkText?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  telegramUrl?: string;
  youtubeUrl?: string;
  playStoreUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  updatedAt: Timestamp;
}

export type ReferralCodeType = 'player' | 'owner';

export interface ReferralCodeRecord {
  code: string;
  type: ReferralCodeType;
  ownerUid: string;
  ownerName: string;
  coinValue: number;
  referrerBonusCoins: number;
  isActive: boolean;
  usesCount: number;
  maxUses: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReferralRedemption {
  id: string;
  redeemerUid: string;
  code: string;
  codeType: ReferralCodeType;
  referrerUid: string;
  rewardCoins: number;
  referrerCoins: number;
  createdAt: Timestamp;
}

export type AppTab = 'home' | 'matches' | 'leaderboard' | 'wallet' | 'studio' | 'settings' | 'owner';
