import { z } from 'zod';

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Validates list matches query parameters
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Validates match ID from URL parameters
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Validates creating a new match
export const createMatchSchema = z
  .object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be chronologically after start time',
        path: ['endTime'],
      });
    }
  });

// Validates updating match scores
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
