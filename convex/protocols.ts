import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Default 6-Zone Readiness Baseline
const DEFAULT_READINESS = [
  { name: 'Chest & Push', readiness: 96, status: 'Optimal' },
  { name: 'Back & Pull', readiness: 94, status: 'Optimal' },
  { name: 'Shoulders & Delts', readiness: 92, status: 'Optimal' },
  { name: 'Legs & Posterior', readiness: 95, status: 'Optimal' },
  { name: 'Core & Trunk', readiness: 98, status: 'Optimal' },
  { name: 'CNS Readiness', readiness: 95, status: 'Optimal' },
];

/**
 * getOrCreateAthlete: Fetches or initializes the user's profile and today's protocol.
 */
export const getOrCreateAthlete = query({
  args: {
    userId: v.string(),
    todayDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    let profile = await ctx.db
      .query('athleteProfiles')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .first();

    const todayProtocol = await ctx.db
      .query('dailyProtocols')
      .withIndex('by_user_date', q =>
        q.eq('userId', args.userId).eq('date', args.todayDate)
      )
      .first();

    const history = await ctx.db
      .query('workoutHistory')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .order('desc')
      .take(14);

    return {
      profile,
      todayProtocol,
      history,
    };
  },
});

/**
 * upsertAthleteProfile: Initialize or update athlete profile configuration
 */
export const upsertAthleteProfile = mutation({
  args: {
    userId: v.string(),
    modality: v.union(v.literal('bodyweight'), v.literal('gym')),
    tier: v.number(),
    objective: v.string(),
    coachPersona: v.string(),
    streakCount: v.optional(v.number()),
    isPro: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('athleteProfiles')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        modality: args.modality,
        tier: args.tier,
        objective: args.objective,
        coachPersona: args.coachPersona,
        streakCount: args.streakCount ?? existing.streakCount,
        isPro: args.isPro ?? existing.isPro,
      });
      return existing._id;
    } else {
      return await ctx.db.insert('athleteProfiles', {
        userId: args.userId,
        modality: args.modality,
        tier: args.tier,
        objective: args.objective,
        coachPersona: args.coachPersona,
        streakCount: args.streakCount ?? 1,
        isPro: args.isPro ?? false,
        muscleReadiness: DEFAULT_READINESS,
      });
    }
  },
});

/**
 * saveDailyProtocol: Upserts the daily protocol for today
 */
export const saveDailyProtocol = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    checkIn: v.object({
      energy: v.number(),
      duration: v.number(),
      soreJoints: v.array(v.string()),
    }),
    coachBriefing: v.string(),
    blocks: v.any(),
    needQuests: v.any(),
    avoidRules: v.any(),
    completionPct: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('dailyProtocols')
      .withIndex('by_user_date', q =>
        q.eq('userId', args.userId).eq('date', args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        checkIn: args.checkIn,
        coachBriefing: args.coachBriefing,
        blocks: args.blocks,
        needQuests: args.needQuests,
        avoidRules: args.avoidRules,
        completionPct: args.completionPct ?? existing.completionPct,
      });
      return existing._id;
    } else {
      return await ctx.db.insert('dailyProtocols', {
        userId: args.userId,
        date: args.date,
        checkIn: args.checkIn,
        coachBriefing: args.coachBriefing,
        blocks: args.blocks,
        needQuests: args.needQuests,
        avoidRules: args.avoidRules,
        completionPct: args.completionPct ?? 0,
      });
    }
  },
});

/**
 * toggleSetOrTask: Real-time mutation that toggles a workout set, NEED quest, or AVOID guardrail,
 * recalculates completion percentage and muscle readiness, and increments streak count when reaching 100%.
 */
export const toggleSetOrTask = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    type: v.union(v.literal('set'), v.literal('fuel'), v.literal('avoid')),
    itemId: v.string(), // For set: "exId_set_0", for fuel: "fuel_1", etc.
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const protocol = await ctx.db
      .query('dailyProtocols')
      .withIndex('by_user_date', q =>
        q.eq('userId', args.userId).eq('date', args.date)
      )
      .first();

    if (!protocol) return null;

    let blocks = [...(protocol.blocks || [])];
    let needQuests = [...(protocol.needQuests || [])];
    let avoidRules = [...(protocol.avoidRules || [])];

    if (args.type === 'set') {
      // Find matching exercise and toggle set index
      for (const block of blocks) {
        if (!block.exercises) continue;
        for (const ex of block.exercises) {
          if (args.itemId.startsWith(ex.id)) {
            const setIndex = parseInt(args.itemId.split('_set_')[1], 10);
            if (!ex.checkedSets) ex.checkedSets = {};
            ex.checkedSets[setIndex] = args.completed;
          }
        }
      }
    } else if (args.type === 'fuel') {
      needQuests = needQuests.map((q: any) =>
        q.id === args.itemId ? { ...q, completed: args.completed } : q
      );
    } else if (args.type === 'avoid') {
      avoidRules = avoidRules.map((r: any) =>
        r.id === args.itemId ? { ...r, completed: args.completed } : r
      );
    }

    // Calculate completion percentage
    let totalSets = 0;
    let completedSets = 0;
    for (const b of blocks) {
      if (!b.exercises) continue;
      for (const e of b.exercises) {
        totalSets += e.sets || 0;
        if (e.checkedSets) {
          completedSets += Object.values(e.checkedSets).filter(Boolean).length;
        }
      }
    }

    const totalFuel = needQuests.length;
    const completedFuel = needQuests.filter((q: any) => q.completed).length;
    const totalAvoid = avoidRules.length;
    const completedAvoid = avoidRules.filter((r: any) => r.completed).length;

    const totalItems = totalSets + totalFuel + totalAvoid;
    const totalDone = completedSets + completedFuel + completedAvoid;
    const completionPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

    await ctx.db.patch(protocol._id, {
      blocks,
      needQuests,
      avoidRules,
      completionPct,
    });

    // Check if 100% completed and update profile streak if not already logged today
    if (completionPct === 100) {
      const profile = await ctx.db
        .query('athleteProfiles')
        .withIndex('by_userId', q => q.eq('userId', args.userId))
        .first();

      if (profile && profile.lastCompletedDate !== args.date) {
        await ctx.db.patch(profile._id, {
          streakCount: profile.streakCount + 1,
          lastCompletedDate: args.date,
        });

        // Archive into workout history
        await ctx.db.insert('workoutHistory', {
          userId: args.userId,
          date: args.date,
          modality: profile.modality,
          tier: profile.tier,
          objective: profile.objective,
          completionPct: 100,
        });
      }
    }

    return { completionPct, completedSets, totalSets };
  },
});

/**
 * swapExercise: Swaps a single exercise in today's protocol and persists it
 */
export const swapExercise = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    blockIndex: v.number(),
    exerciseIndex: v.number(),
    swappedExercise: v.any(),
  },
  handler: async (ctx, args) => {
    const protocol = await ctx.db
      .query('dailyProtocols')
      .withIndex('by_user_date', q =>
        q.eq('userId', args.userId).eq('date', args.date)
      )
      .first();

    if (!protocol || !protocol.blocks) return null;

    const nextBlocks = [...protocol.blocks];
    if (nextBlocks[args.blockIndex]?.exercises?.[args.exerciseIndex]) {
      nextBlocks[args.blockIndex].exercises[args.exerciseIndex] = args.swappedExercise;
      await ctx.db.patch(protocol._id, { blocks: nextBlocks });
    }

    return nextBlocks;
  },
});

/**
 * completeOnboarding: Saves questionnaire answers, computes recommended Tier,
 * marks onboarding as complete, and updates athlete profile.
 */
export const completeOnboarding = mutation({
  args: {
    userId: v.string(),
    biometrics: v.object({
      weightKg: v.number(),
      heightCm: v.number(),
      maxPullups: v.string(),
      maxPushups: v.string(),
      targetSkill: v.string(),
      equipment: v.array(v.string()),
    }),
    modality: v.union(v.literal('bodyweight'), v.literal('gym')),
    tier: v.number(),
    objective: v.string(),
    coachPersona: v.string(),
    soreJoints: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('athleteProfiles')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .first();

    const profileData = {
      userId: args.userId,
      modality: args.modality,
      tier: args.tier,
      objective: args.objective,
      coachPersona: args.coachPersona,
      streakCount: existing?.streakCount ?? 1,
      lastCompletedDate: existing?.lastCompletedDate,
      isPro: existing?.isPro ?? false,
      muscleReadiness: existing?.muscleReadiness ?? DEFAULT_READINESS,
      onboardingCompleted: true,
      biometrics: args.biometrics,
    };

    if (existing) {
      await ctx.db.patch(existing._id, profileData);
      return existing._id;
    } else {
      return await ctx.db.insert('athleteProfiles', profileData);
    }
  },
});


