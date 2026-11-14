const blocked = new Set('ASS CUM FAG FGT FUK FUC FCK FUX KKK KYS NIG NGR NZI PNS PUS SEX SHT TIT WOP XXX'.split(' '));
const lookalikes = { '0': 'O', '1': 'I', '3': 'E', '4': 'A', '5': 'S', '7': 'T', '@': 'A', '$': 'S' };

export function blockedInitials(value) {
    return blocked.has(value.toUpperCase().replace(/[013457@$]/g, (letter) => lookalikes[letter]));
}
