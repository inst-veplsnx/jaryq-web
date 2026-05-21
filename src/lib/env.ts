export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var: ${name}. See .env.example for setup instructions.`
    );
  }
  return value;
}

// For client-bundled code: caller must pass the literal `process.env.X` lookup so
// Next.js can inline NEXT_PUBLIC_* values at build time. Dynamic lookups via
// `process.env[name]` are not inlined and become undefined in the browser.
export function requireEnvValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required env var: ${name}. See .env.example for setup instructions.`
    );
  }
  return value;
}
