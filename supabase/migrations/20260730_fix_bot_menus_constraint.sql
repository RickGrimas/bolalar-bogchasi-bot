-- Fix bot_menus action_type constraint to allow AI_APPLICATION, AI_FORM, and AI_CRM
ALTER TABLE public.bot_menus DROP CONSTRAINT IF EXISTS bot_menus_action_type_check;

ALTER TABLE public.bot_menus ADD CONSTRAINT bot_menus_action_type_check 
  CHECK (action_type IN ('TEXT', 'URL', 'FILE', 'AI_APPLICATION', 'AI_FORM', 'AI_CRM'));
