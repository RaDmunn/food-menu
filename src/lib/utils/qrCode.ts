type QrConfig = {
  version: number;
  dataCodewords: number;
  eccPerBlock: number;
  blocks: number[];
};

const QR_LOW_CONFIGS: QrConfig[] = [
  { version: 1, dataCodewords: 19, eccPerBlock: 7, blocks: [19] },
  { version: 2, dataCodewords: 34, eccPerBlock: 10, blocks: [34] },
  { version: 3, dataCodewords: 55, eccPerBlock: 15, blocks: [55] },
  { version: 4, dataCodewords: 80, eccPerBlock: 20, blocks: [80] },
  { version: 5, dataCodewords: 108, eccPerBlock: 26, blocks: [108] },
  { version: 6, dataCodewords: 136, eccPerBlock: 18, blocks: [68, 68] },
];

const GF_EXP = new Array<number>(512);
const GF_LOG = new Array<number>(256);

let gfValue = 1;
for (let i = 0; i < 255; i++) {
  GF_EXP[i] = gfValue;
  GF_LOG[gfValue] = i;
  gfValue <<= 1;
  if (gfValue & 0x100) {
    gfValue ^= 0x11d;
  }
}
for (let i = 255; i < 512; i++) {
  GF_EXP[i] = GF_EXP[i - 255];
}

function gfMultiply(left: number, right: number) {
  if (left === 0 || right === 0) return 0;
  return GF_EXP[GF_LOG[left] + GF_LOG[right]];
}

function multiplyPolynomials(left: number[], right: number[]) {
  const result = new Array<number>(left.length + right.length - 1).fill(0);

  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      result[i + j] ^= gfMultiply(left[i], right[j]);
    }
  }

  return result;
}

function createGeneratorPolynomial(degree: number) {
  let result = [1];

  for (let i = 0; i < degree; i++) {
    result = multiplyPolynomials(result, [1, GF_EXP[i]]);
  }

  return result;
}

function createErrorCorrection(data: number[], eccLength: number) {
  const generator = createGeneratorPolynomial(eccLength);
  const message = [...data, ...new Array<number>(eccLength).fill(0)];

  for (let i = 0; i < data.length; i++) {
    const coefficient = message[i];
    if (coefficient === 0) continue;

    for (let j = 0; j < generator.length; j++) {
      message[i + j] ^= gfMultiply(generator[j], coefficient);
    }
  }

  return message.slice(data.length);
}

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >>> i) & 1);
  }
}

function bitsToBytes(bits: number[]) {
  const bytes: number[] = [];

  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      value = (value << 1) | (bits[i + j] || 0);
    }
    bytes.push(value);
  }

  return bytes;
}

function getTextBytes(text: string) {
  return Array.from(new TextEncoder().encode(text));
}

function selectConfig(text: string) {
  const bytes = getTextBytes(text);

  for (const config of QR_LOW_CONFIGS) {
    const availableBits = config.dataCodewords * 8;
    const requiredBits = 4 + 8 + bytes.length * 8;
    if (requiredBits <= availableBits) {
      return { config, bytes };
    }
  }

  throw new Error("QR value is too long");
}

function createDataCodewords(bytes: number[], config: QrConfig) {
  const bits: number[] = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);

  for (const byte of bytes) {
    appendBits(bits, byte, 8);
  }

  const capacityBits = config.dataCodewords * 8;
  const terminatorLength = Math.min(4, capacityBits - bits.length);
  appendBits(bits, 0, terminatorLength);

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const data = bitsToBytes(bits);
  const padBytes = [0xec, 0x11];
  let padIndex = 0;

  while (data.length < config.dataCodewords) {
    data.push(padBytes[padIndex % 2]);
    padIndex++;
  }

  return data;
}

function createFinalCodewords(data: number[], config: QrConfig) {
  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];
  let offset = 0;

  for (const blockLength of config.blocks) {
    const block = data.slice(offset, offset + blockLength);
    dataBlocks.push(block);
    eccBlocks.push(createErrorCorrection(block, config.eccPerBlock));
    offset += blockLength;
  }

  const result: number[] = [];
  const maxDataLength = Math.max(...dataBlocks.map((block) => block.length));

  for (let i = 0; i < maxDataLength; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  for (let i = 0; i < config.eccPerBlock; i++) {
    for (const block of eccBlocks) {
      result.push(block[i]);
    }
  }

  return result;
}

function createMatrix(size: number) {
  return {
    modules: Array.from({ length: size }, () =>
      new Array<boolean>(size).fill(false)
    ),
    reserved: Array.from({ length: size }, () =>
      new Array<boolean>(size).fill(false)
    ),
  };
}

function setFunctionModule(
  modules: boolean[][],
  reserved: boolean[][],
  row: number,
  col: number,
  value: boolean
) {
  if (row < 0 || col < 0 || row >= modules.length || col >= modules.length) {
    return;
  }

  modules[row][col] = value;
  reserved[row][col] = true;
}

function drawFinderPattern(
  modules: boolean[][],
  reserved: boolean[][],
  row: number,
  col: number
) {
  for (let y = -1; y <= 7; y++) {
    for (let x = -1; x <= 7; x++) {
      const distance = Math.max(Math.abs(x - 3), Math.abs(y - 3));
      const isPattern = x >= 0 && x <= 6 && y >= 0 && y <= 6;
      setFunctionModule(
        modules,
        reserved,
        row + y,
        col + x,
        isPattern && distance !== 2
      );
    }
  }
}

function drawAlignmentPattern(
  modules: boolean[][],
  reserved: boolean[][],
  row: number,
  col: number
) {
  if (reserved[row][col]) return;

  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      const distance = Math.max(Math.abs(x), Math.abs(y));
      setFunctionModule(modules, reserved, row + y, col + x, distance !== 1);
    }
  }
}

function getAlignmentPositions(version: number) {
  if (version === 1) return [];
  return [6, 4 * version + 10];
}

function drawFunctionPatterns(
  modules: boolean[][],
  reserved: boolean[][],
  version: number
) {
  const size = modules.length;

  drawFinderPattern(modules, reserved, 0, 0);
  drawFinderPattern(modules, reserved, 0, size - 7);
  drawFinderPattern(modules, reserved, size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    const value = i % 2 === 0;
    setFunctionModule(modules, reserved, 6, i, value);
    setFunctionModule(modules, reserved, i, 6, value);
  }

  const positions = getAlignmentPositions(version);
  for (const row of positions) {
    for (const col of positions) {
      drawAlignmentPattern(modules, reserved, row, col);
    }
  }

  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      setFunctionModule(modules, reserved, 8, i, false);
      setFunctionModule(modules, reserved, i, 8, false);
    }
  }

  for (let i = 0; i < 8; i++) {
    setFunctionModule(modules, reserved, 8, size - 1 - i, false);
  }

  for (let i = 0; i < 7; i++) {
    setFunctionModule(modules, reserved, size - 1 - i, 8, false);
  }

  setFunctionModule(modules, reserved, size - 8, 8, true);
}

function getFormatBits(mask: number) {
  const data = (0b01 << 3) | mask;
  let remainder = data;

  for (let i = 0; i < 10; i++) {
    remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
  }

  return (((data << 10) | remainder) ^ 0x5412) & 0x7fff;
}

function getBit(value: number, index: number) {
  return ((value >>> index) & 1) !== 0;
}

function drawFormatBits(modules: boolean[][], mask: number) {
  const size = modules.length;
  const bits = getFormatBits(mask);

  for (let i = 0; i <= 5; i++) modules[8][i] = getBit(bits, i);
  modules[8][7] = getBit(bits, 6);
  modules[8][8] = getBit(bits, 7);
  modules[7][8] = getBit(bits, 8);
  for (let i = 9; i < 15; i++) modules[14 - i][8] = getBit(bits, i);

  for (let i = 0; i < 8; i++) modules[size - 1 - i][8] = getBit(bits, i);
  for (let i = 8; i < 15; i++) modules[8][size - 15 + i] = getBit(bits, i);

  modules[size - 8][8] = true;
}

function getMask(mask: number, row: number, col: number) {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function placeCodewords(
  modules: boolean[][],
  reserved: boolean[][],
  codewords: number[],
  mask: number
) {
  const bits: number[] = [];
  for (const codeword of codewords) {
    appendBits(bits, codeword, 8);
  }

  const size = modules.length;
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right--;

    for (let vertical = 0; vertical < size; vertical++) {
      const row = upward ? size - 1 - vertical : vertical;

      for (let j = 0; j < 2; j++) {
        const col = right - j;
        if (reserved[row][col]) continue;

        const bit = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        modules[row][col] = bit !== getMask(mask, row, col);
        bitIndex++;
      }
    }

    upward = !upward;
  }
}

function cloneModules(modules: boolean[][]) {
  return modules.map((row) => [...row]);
}

function calculatePenalty(modules: boolean[][]) {
  const size = modules.length;
  let penalty = 0;

  for (let row = 0; row < size; row++) {
    let runColor = modules[row][0];
    let runLength = 1;
    for (let col = 1; col < size; col++) {
      if (modules[row][col] === runColor) {
        runLength++;
      } else {
        if (runLength >= 5) penalty += 3 + runLength - 5;
        runColor = modules[row][col];
        runLength = 1;
      }
    }
    if (runLength >= 5) penalty += 3 + runLength - 5;
  }

  for (let col = 0; col < size; col++) {
    let runColor = modules[0][col];
    let runLength = 1;
    for (let row = 1; row < size; row++) {
      if (modules[row][col] === runColor) {
        runLength++;
      } else {
        if (runLength >= 5) penalty += 3 + runLength - 5;
        runColor = modules[row][col];
        runLength = 1;
      }
    }
    if (runLength >= 5) penalty += 3 + runLength - 5;
  }

  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const color = modules[row][col];
      if (
        color === modules[row][col + 1] &&
        color === modules[row + 1][col] &&
        color === modules[row + 1][col + 1]
      ) {
        penalty += 3;
      }
    }
  }

  const finderPattern = [true, false, true, true, true, false, true];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - 7; col++) {
      if (finderPattern.every((value, i) => modules[row][col + i] === value)) {
        const before =
          col >= 4 &&
          !modules[row][col - 1] &&
          !modules[row][col - 2] &&
          !modules[row][col - 3] &&
          !modules[row][col - 4];
        const after =
          col + 11 <= size &&
          !modules[row][col + 7] &&
          !modules[row][col + 8] &&
          !modules[row][col + 9] &&
          !modules[row][col + 10];
        if (before || after) penalty += 40;
      }
    }
  }

  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - 7; row++) {
      if (finderPattern.every((value, i) => modules[row + i][col] === value)) {
        const before =
          row >= 4 &&
          !modules[row - 1][col] &&
          !modules[row - 2][col] &&
          !modules[row - 3][col] &&
          !modules[row - 4][col];
        const after =
          row + 11 <= size &&
          !modules[row + 7][col] &&
          !modules[row + 8][col] &&
          !modules[row + 9][col] &&
          !modules[row + 10][col];
        if (before || after) penalty += 40;
      }
    }
  }

  const darkCount = modules.flat().filter(Boolean).length;
  const total = size * size;
  penalty += Math.floor(Math.abs((darkCount * 100) / total - 50) / 5) * 10;

  return penalty;
}

export function createQrMatrix(text: string) {
  const { config, bytes } = selectConfig(text);
  const size = 21 + (config.version - 1) * 4;
  const base = createMatrix(size);
  const data = createDataCodewords(bytes, config);
  const codewords = createFinalCodewords(data, config);

  drawFunctionPatterns(base.modules, base.reserved, config.version);

  let bestModules: boolean[][] | null = null;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask++) {
    const modules = cloneModules(base.modules);
    placeCodewords(modules, base.reserved, codewords, mask);
    drawFormatBits(modules, mask);

    const penalty = calculatePenalty(modules);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestModules = modules;
    }
  }

  return bestModules || base.modules;
}
