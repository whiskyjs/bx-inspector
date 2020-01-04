export class PHPHelper {
    public static stripWhitespacePhpTags(source: string): string {
        return source
            .replace(/^[\s\n\r]*<\?php[\s\n\r]*/gm, "")
            .replace(/^[\s\n\r]*<\?[\s\n\r]*/gm, "")
            .replace(/[\s\n\r]*?>[\s\n\r]*$/gm, "");
    }
}
