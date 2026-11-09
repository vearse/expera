export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.DB_HOST?.trim() &&
      process.env.DB_DATABASE?.trim() &&
      process.env.DB_USERNAME?.trim(),
  );
}
