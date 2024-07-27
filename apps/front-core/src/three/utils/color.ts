const convertNumberToHex = (n: number) => {
  const hex = n.toString(16);
  return hex.padStart(2, "0"); // 2자리로 맞춤
};

const convertHexToRgb = (hex: `#${string}`) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b] as const;
};

const convertRgbToHex = (r: number, g: number, b: number) => {
  return `#${convertNumberToHex(r)}${convertNumberToHex(g)}${convertNumberToHex(b)}` as const;
};

export const convertHexColorToPastelColor = (hex: `#${string}`) => {
  const [r, g, b] = convertHexToRgb(hex);

  // 파스텔 색상을 위해 50% 흰색을 추가
  const pastelR = Math.floor((r + 255) / 2);
  const pastelG = Math.floor((g + 255) / 2);
  const pastelB = Math.floor((b + 255) / 2);

  return convertRgbToHex(pastelR, pastelG, pastelB);
};

export const convertStringToHexColor = (str: string) => {
  const hexString = [...str]
    .reduce((acc, str) => {
      return acc + str.charCodeAt(0);
    }, 0)
    .toString(16);
  const color = `#${hexString.slice(0, 6).padStart(6, hexString)}` as const;

  return convertHexColorToPastelColor(color);
};

const updateHexPiece = (amount: number) => {
  if (amount > 0) {
    return (hexPiece: string) => {
      const value = Math.min(255, parseInt(hexPiece, 16) + amount)
        .toString(16)
        .padStart(2, "0");
      return value;
    };
  } else {
    return (hexPiece: string) => {
      const value = Math.max(0, parseInt(hexPiece, 16) + amount)
        .toString(16)
        .padStart(2, "0");
      return value;
    };
  }
};

export const lighter = (hex: `#${string}`, amount: number = 30) => {
  if (amount < 0) {
    throw new Error("1이상의 양수만 입력해주세요.");
  }
  const pureHex = hex.replace(/^#/, "");

  return `#${pureHex.replace(/../g, updateHexPiece(amount))}`;
};

export const darker = (hex: `#${string}`, amount: number = -30) => {
  if (amount > 0) {
    throw new Error("-1이하의 음수만 입력해주세요.");
  }
  const pureHex = hex.replace(/^#/, "");

  return `#${pureHex.replace(/../g, updateHexPiece(amount))}`;
};
