export function validateEmail(email) {
  // 1. Basic Format Check (must look like x@y.z)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }

  // 2. Block Common Typos
  const domain = email.split("@")[1].toLowerCase();
  const typoDomains = [
    "gnail.com", "gamil.com", "gmai.com", "hgmail.com", 
    "yaho.com", "yahooo.com", "hotnail.com", "outlookk.com"
  ];

  if (typoDomains.includes(domain)) {
    // Auto-suggest the correct one
    const corrected = domain
      .replace(/gnail|gamil|gmai|hgmail/, "gmail")
      .replace(/yaho|yahooo/, "yahoo")
      .replace("hotnail", "hotmail")
      .replace("outlookk", "outlook");
      
    return `Did you mean @${corrected}?`;
  }

  return null; // No error
}