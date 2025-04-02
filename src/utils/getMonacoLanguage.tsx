const getMonacoLanguage = (lang: string) => {
    const lowerLang = lang.toLowerCase();
    // Map common language identifiers to Monaco's expected values
    if (lowerLang === "c++") return "cpp";
    if (lowerLang === "csharp") return "csharp";
    if (lowerLang === "fsharp") return "fsharp";
    return lowerLang; // default to lowercase version
};

export default getMonacoLanguage