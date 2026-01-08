export const getCountryFromDestination = (dest: string | undefined): { country: string; flag: string } | null => {
    if (!dest) return null;
    const d = dest.toUpperCase().trim();

    // Common Prefixes (LOCODE-ish)
    if (d.startsWith("US ")) return { country: "UNITED STATES", flag: "🇺🇸" };
    if (d.startsWith("CN ")) return { country: "CHINA", flag: "🇨🇳" };
    if (d.startsWith("NL ")) return { country: "NETHERLANDS", flag: "🇳🇱" };
    if (d.startsWith("JP ")) return { country: "JAPAN", flag: "🇯🇵" };
    if (d.startsWith("KR ")) return { country: "SOUTH KOREA", flag: "🇰🇷" };
    if (d.startsWith("GB ")) return { country: "UNITED KINGDOM", flag: "🇬🇧" };
    if (d.startsWith("DE ")) return { country: "GERMANY", flag: "🇩🇪" };
    if (d.startsWith("FR ")) return { country: "FRANCE", flag: "🇫🇷" };
    if (d.startsWith("SG ")) return { country: "SINGAPORE", flag: "🇸🇬" };
    if (d.startsWith("MY ")) return { country: "MALAYSIA", flag: "🇲🇾" };
    if (d.startsWith("AU ")) return { country: "AUSTRALIA", flag: "🇦🇺" };
    if (d.startsWith("CA ")) return { country: "CANADA", flag: "🇨🇦" };
    if (d.startsWith("AE ")) return { country: "UAE", flag: "🇦🇪" };
    if (d.startsWith("IN ")) return { country: "INDIA", flag: "🇮🇳" };
    if (d.startsWith("BR ")) return { country: "BRAZIL", flag: "🇧🇷" };
    if (d.startsWith("RU ")) return { country: "RUSSIA", flag: "🇷🇺" };

    // Explicit Port Names
    if (d.includes("ROTTERDAM") || d.includes("RTM")) return { country: "NETHERLANDS", flag: "🇳🇱" };
    if (d.includes("SINGAPORE")) return { country: "SINGAPORE", flag: "🇸🇬" };
    if (d.includes("SHANGHAI") || d.includes("NINGBO")) return { country: "CHINA", flag: "🇨🇳" };
    if (d.includes("BUSAN") || d.includes("PUSAN")) return { country: "SOUTH KOREA", flag: "🇰🇷" };
    if (d.includes("LOS ANGELES") || d.includes("LAX") || d.includes("LONG BEACH")) return { country: "USA (CALIFORNIA)", flag: "🇺🇸" };
    if (d.includes("NEW YORK") || d.includes("NYC")) return { country: "USA (NEW YORK)", flag: "🇺🇸" };
    if (d.includes("HOUSTON")) return { country: "USA (TEXAS)", flag: "🇺🇸" };
    if (d.includes("ANTWERP")) return { country: "BELGIUM", flag: "🇧🇪" };
    if (d.includes("HAMBURG")) return { country: "GERMANY", flag: "🇩🇪" };
    if (d.includes("TOKYO") || d.includes("YOKOHAMA")) return { country: "JAPAN", flag: "🇯🇵" };
    if (d.includes("PANAMA")) return { country: "PANAMA", flag: "🇵🇦" };
    if (d.includes("SUEZ") || d.includes("SAID")) return { country: "EGYPT", flag: "🇪🇬" };

    return null;
};
