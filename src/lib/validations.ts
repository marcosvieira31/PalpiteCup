import { z } from 'zod'

export const betSchema = z.object({
  gameId: z.number().int().positive(),
  home: z.number().int().min(0).max(99),
  away: z.number().int().min(0).max(99),
})

export const usernameSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_À-ú\s]+$/, 'Apenas letras, números, espaços e _'),
})

export const groupSchema = z.object({
  name: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .trim(),
})

export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(500, 'Máximo 500 caracteres')
    .trim(),
})
