import { decryptContent } from "../cryptography/encrypt";
import { parseDate } from "../Time";

export function verifyAppToken(encryptedToken: string): boolean {
    try {
        const decryptedToken = decryptContent(encryptedToken);

        const tokenParts = decryptedToken.split(',');
        if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
        }

        const [datePart, randomPart, identifier] = tokenParts;

        const isValidDate = !isNaN(parseDate(datePart).getTime());
        const isValidRandom = !isNaN(parseInt(randomPart, 10)) && parseInt(randomPart, 10) >= 1000000000 && parseInt(randomPart, 10) <= 5000000000;
        const isValidIdentifier = identifier.startsWith('app-');

        return isValidDate && isValidRandom && isValidIdentifier;
    } catch (error) {
        console.error('Error verifying token');
        return false;
    }
}
