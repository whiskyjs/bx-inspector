export const getGenericPageInfo = `
({
    origin: location.origin,
    protocol: location.protocol,
    hostname: location.hostname,
    pathname: location.pathname,
    href: location.href,
    encoding: document.inputEncoding.toLowerCase(),
    
    sessId: (typeof BX === "function") && (typeof BX.bitrix_sessid === "function") && BX.bitrix_sessid(),
    language: (typeof BX === "function") && (typeof BX.bitrix_sessid === "function") && BX.message("LANGUAGE_ID"),
});
`;

export const setCookie = (name: string, value: string): string => `
document.cookie = '${name}=${value}';
`;
