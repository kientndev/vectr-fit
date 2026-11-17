import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Athlete Profile & Long-term Telemetry
  athleteProfiles: defineTable({
    userId: v.string(),
    modality: v.union(v.literal('bodyweight'), v.literal('gym')),
    tier: v.number(), // 1 to 5
    objective: v.string(),
    coachPersona: v.string(), // "TACTICAL_SCIENTIST" | "DRILL_SERGEANT"
    streakCount: v.number(),
    xp: v.optional(v.number()),
    athleteName: v.optional(v.string()),
    lastCompletedDate: v.optional(v.string()),
    isPro: v.boolean(),
    muscleReadiness: v.any(), // 6-zone readiness percentages
    onboardingCompleted: v.optional(v.boolean()),
    critiqueScores: v.optional(
      v.object({
        overall: v.number(),
        strength: v.number(),
        discipline: v.number(),
        form: v.number(),
        recovery: v.number(),
      })
    ),
    biometrics: v.optional(
      v.object({
        weightKg: v.number(),
        heightCm: v.number(),
        maxPullups: v.string(),
        maxPushups: v.string(),
        targetSkill: v.string(),
        equipment: v.array(v.string()),
      })
    ),
  }).index('by_userId', ['userId']),

  // Daily Blueprints (DO / NEED / AVOID)
  dailyProtocols: defineTable({
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
    checkIn: v.object({
      energy: v.number(),
      duration: v.number(),
      soreJoints: v.array(v.string()),
    }),
    coachBriefing: v.string(),
    blocks: v.any(), // structured workout blocks, exercises, sets, reps, RPE, cues, and checked set states
    needQuests: v.any(), // 3 nutrition/recovery targets + checked state
    avoidRules: v.any(), // 3 discipline guardrails + checked state
    completionPct: v.number(),
  }).index('by_user_date', ['userId', 'date']),

  // Historical Session Archives
  workoutHistory: defineTable({
    userId: v.string(),
    date: v.string(),
    modality: v.string(),
    tier: v.number(),
    objective: v.string(),
    completionPct: v.number(),
  }).index('by_userId', ['userId']),

  // Live Global Social Proof & Funnel Telemetry Counters
  globalTelemetry: defineTable({
    key: v.string(), // "live_stats"
    repsAnalyzedToday: v.number(),
    apksDownloadedToday: v.number(),
    sandboxInteractions: v.number(),
    webcamSessions: v.number(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  // Funnel Analytics Events
  funnelEvents: defineTable({
    eventType: v.string(), // "sandbox_interacted" | "webcam_enabled" | "apk_download_clicked" | "rep_analyzed"
    timestamp: v.number(),
    platform: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index('by_eventType', ['eventType']),

  // iOS TestFlight & Early Access Waitlist
  waitlistSubmissions: defineTable({
    email: v.string(),
    platform: v.string(), // "ios" | "android" | "web"
    createdAt: v.number(),
  }).index('by_email', ['email']),
});

