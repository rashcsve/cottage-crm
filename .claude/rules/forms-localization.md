---
paths:
  - "features/**/components/forms/**"
  - "features/**/schemas/**"
  - "shared/ui/Form/**"
  - "shared/ui/FormMessage.tsx"
  - "i18n/**"
  - "app/[locale]/components/auth/**"
---

# Forms, Schemas, And Localization

- Forms use `react-hook-form` with Zod through `zodResolver`. Build the localized schema with `useMemo` and default to `mode: "onBlur"` unless the existing code already differs for a good reason.
- Define feature schemas in `features/<domain>/schemas/index.ts` and localized schema-message factories in `get-*-schema-messages.ts`. `features/visits/schemas/create-visit-schema-messages.ts` is the existing naming exception.
- Apply returned server `fieldErrors` through `applyFieldErrors`, set form-level errors with `setError("root", ...)`, and render them with `FormMessage`.
- Prefer the shared form primitives in `shared/ui/Form/` before creating new wrappers.
- Keep `i18n/locales/cs.json` and `i18n/locales/en.json` synchronized whenever translation keys change.
- Do not hardcode user-facing validation or schema messages.
