import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Baseline fallback telemetry so landing page always displays energetic social proof
const BASELINE_TELEMETRY = {
  repsAnalyzedToday: 1420,
  apksDownloadedToday: 84,
  sandboxInteractions: 389,
  webcamSessions: 215,
};

/**
 * Live Global Telemetry Query
 * Powers the real-time social proof badge across the Hero, Bento Grid, and Live Arena.
 */
export const getLiveTelemetry = query({
  args: {},
  handler: async (ctx) => {
    const record = await ctx.db
      .query('globalTelemetry')
      .withIndex('by_key', (q) => q.eq('key', 'live_stats'))
      .first();

    if (!record) {
      return {
        repsAnalyzedToday: BASELINE_TELEMETRY.repsAnalyzedToday,
        apksDownloadedToday: BASELINE_TELEMETRY.apksDownloadedToday,
        sandboxInteractions: BASELINE_TELEMETRY.sandboxInteractions,
        webcamSessions: BASELINE_TELEMETRY.webcamSessions,
        isLive: true,
      };
    }

    return {
      repsAnalyzedToday: record.repsAnalyzedToday,
      apksDownloadedToday: record.apksDownloadedToday,
      sandboxInteractions: record.sandboxInteractions,
      webcamSessions: record.webcamSessions,
      isLive: true,
    };
  },
});

/**
 * Record a Funnel Event & Atomically Tick Aggregate Counters
 * Tracks: 'sandbox_interacted' | 'webcam_enabled' | 'apk_download_clicked' | 'rep_analyzed'
 */
export const recordFunnelEvent = mutation({
  args: {
    eventType: v.string(),
    platform: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Log event entry for funnel telemetry
    await ctx.db.insert('funnelEvents', {
      eventType: args.eventType,
      timestamp: now,
      platform: args.platform,
      metadata: args.metadata,
    });

    // 2. Fetch or initialize global aggregate counter
    let stats = await ctx.db
      .query('globalTelemetry')
      .withIndex('by_key', (q) => q.eq('key', 'live_stats'))
      .first();

    if (!stats) {
      const id = await ctx.db.insert('globalTelemetry', {
        key: 'live_stats',
        repsAnalyzedToday: BASELINE_TELEMETRY.repsAnalyzedToday,
        apksDownloadedToday: BASELINE_TELEMETRY.apksDownloadedToday,
        sandboxInteractions: BASELINE_TELEMETRY.sandboxInteractions,
        webcamSessions: BASELINE_TELEMETRY.webcamSessions,
        updatedAt: now,
      });
      stats = await ctx.db.get(id);
    }

    if (!stats) return { success: true };

    // 3. Atomically update counters
    const updates: Partial<{
      repsAnalyzedToday: number;
      apksDownloadedToday: number;
      sandboxInteractions: number;
      webcamSessions: number;
      updatedAt: number;
    }> = {
      updatedAt: now,
    };

    if (args.eventType === 'rep_analyzed') {
      const count = typeof args.metadata?.reps === 'number' ? args.metadata.reps : 1;
      updates.repsAnalyzedToday = stats.repsAnalyzedToday + count;
    } else if (args.eventType === 'apk_download_clicked') {
      updates.apksDownloadedToday = stats.apksDownloadedToday + 1;
    } else if (args.eventType === 'sandbox_interacted') {
      updates.sandboxInteractions = stats.sandboxInteractions + 1;
    } else if (args.eventType === 'webcam_enabled') {
      updates.webcamSessions = stats.webcamSessions + 1;
    }

    await ctx.db.patch(stats._id, updates);

    return {
      success: true,
      liveReps: updates.repsAnalyzedToday ?? stats.repsAnalyzedToday,
      liveDownloads: updates.apksDownloadedToday ?? stats.apksDownloadedToday,
    };
  },
});

/**
 * Fast Dedicated Rep Increment Mutation
 */
export const recordRepAnalyzed = mutation({
  args: {
    reps: v.optional(v.number()),
    exerciseName: v.optional(v.string()),
    accuracy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const count = args.reps || 1;

    let stats = await ctx.db
      .query('globalTelemetry')
      .withIndex('by_key', (q) => q.eq('key', 'live_stats'))
      .first();

    if (!stats) {
      await ctx.db.insert('globalTelemetry', {
        key: 'live_stats',
        repsAnalyzedToday: BASELINE_TELEMETRY.repsAnalyzedToday + count,
        apksDownloadedToday: BASELINE_TELEMETRY.apksDownloadedToday,
        sandboxInteractions: BASELINE_TELEMETRY.sandboxInteractions,
        webcamSessions: BASELINE_TELEMETRY.webcamSessions,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(stats._id, {
        repsAnalyzedToday: stats.repsAnalyzedToday + count,
        updatedAt: now,
      });
    }

    await ctx.db.insert('funnelEvents', {
      eventType: 'rep_analyzed',
      timestamp: now,
      metadata: {
        reps: count,
        exerciseName: args.exerciseName,
        accuracy: args.accuracy,
      },
    });

    return { success: true };
  },
});

/**
 * Submit iOS / TestFlight Waitlist Email
 */
export const submitWaitlist = mutation({
  args: {
    email: v.string(),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleanEmail = args.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    const existing = await ctx.db
      .query('waitlistSubmissions')
      .withIndex('by_email', (q) => q.eq('email', cleanEmail))
      .first();

    if (existing) {
      return { success: true, alreadyRegistered: true };
    }

    await ctx.db.insert('waitlistSubmissions', {
      email: cleanEmail,
      platform: args.platform || 'ios',
      createdAt: Date.now(),
    });

    return { success: true, alreadyRegistered: false };
  },
});
