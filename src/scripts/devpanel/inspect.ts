export const getGenericPageInfo = `
({
    origin: location.origin,
    hostname: location.hostname,
    pathname: location.pathname,
    href: location.href,
    encoding: document.inputEncoding.toLowerCase(),
    
    sessId: (typeof BX === "function") && (typeof BX.bitrix_sessid === "function") && BX.bitrix_sessid(),
    language: (typeof BX === "function") && (typeof BX.bitrix_sessid === "function") && BX.message("LANGUAGE_ID"),
});
`;
