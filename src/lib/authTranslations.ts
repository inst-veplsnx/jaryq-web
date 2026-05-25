/**
 * Translates English authentication error messages (primarily from Supabase/GoTrue)
 * into natural, user-friendly Kazakh.
 */
export function translateAuthError(message: string | null | undefined): string {
  if (!message) {
    return "Белгісіз қате орын алды";
  }

  const msg = message.toLowerCase().trim();

  // 1. Invalid credentials
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid email or password") ||
    msg.includes("invalid credentials")
  ) {
    return "Электрондық пошта немесе пароль қате";
  }

  // 2. User/Email already exists
  if (
    msg.includes("user already registered") ||
    msg.includes("email already in use") ||
    msg.includes("user_already_exists")
  ) {
    return "Бұл электрондық пошта арқылы тіркелген пайдаланушы бар";
  }

  // 3. Password requirements
  if (msg.includes("password should be at least")) {
    return "Пароль кемінде 6 таңбадан тұруы керек";
  }
  if (msg.includes("password is too weak")) {
    return "Пароль тым әлсіз. Күрделірек пароль енгізіңіз.";
  }

  // 4. Email validation
  if (
    msg.includes("unable to validate email address") ||
    msg.includes("invalid email format") ||
    msg.includes("invalid email address") ||
    msg.includes("email format is invalid")
  ) {
    return "Электрондық пошта форматы қате";
  }

  // 5. Email not confirmed
  if (
    msg.includes("email not confirmed") ||
    msg.includes("confirm your email") ||
    msg.includes("email_not_confirmed")
  ) {
    return "Электрондық поштаңыз расталмаған. Поштаңызды тексеріңіз.";
  }

  // 6. Rate limits & Too many requests
  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("rate_limit_exceeded") ||
    msg.includes("security purposes") ||
    msg.includes("request this once every")
  ) {
    return "Сұраныс саны тым көп. Біраз уақыттан соң қайталап көріңіз.";
  }

  // 7. Network errors
  if (
    msg.includes("failed to fetch") ||
    msg.includes("network error") ||
    msg.includes("networkrequestfailed") ||
    msg.includes("network_error")
  ) {
    return "Желілік байланыс қатесі. Интернет байланысын тексеріңіз.";
  }

  // 8. User not found / not registered
  if (msg.includes("user not found")) {
    return "Пайдаланушы табылмады";
  }

  // 9. Signups disabled
  if (
    msg.includes("email signup is disabled") ||
    msg.includes("signups not allowed") ||
    msg.includes("signup_disabled")
  ) {
    return "Электрондық пошта арқылы тіркелу өшірілген";
  }

  // 10. Anonymous sign-ins disabled
  if (msg.includes("anonymous sign-ins are disabled")) {
    return "Анонимді кіру өшірілген";
  }

  // 11. Auth session missing or token expired
  if (
    msg.includes("auth session missing") ||
    msg.includes("token expired") ||
    msg.includes("invalid refresh token")
  ) {
    return "Сессия мерзімі аяқталды немесе жарамсыз. Қайта кіріңіз.";
  }

  // Fallback to the original message if it doesn't match any English signature
  // (e.g., if it's already a Kazakh message or custom error)
  return message;
}
