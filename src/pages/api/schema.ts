import { z } from 'zod';

// Add new schema for arena and dormitory allocation
export const teamAllocationSchema = z.object({
  teamId: z.string(),
  boysDormitory: z.enum(['NC61', 'NC62', 'NC63', 'SMV54', 'SMV55', 'SMV56', 'NOT_ASSIGNED']).optional(),
  girlsDormitory: z.enum(['NC61', 'NC62', 'NC63', 'SMV54', 'SMV55', 'SMV56', 'NOT_ASSIGNED']).optional(),
  arena: z.enum(['ADL01', 'ADL03', 'ADL04', 'SMV54', 'SMV55', 'NOT_ASSIGNED']).optional(),
});

// ...other schemas
